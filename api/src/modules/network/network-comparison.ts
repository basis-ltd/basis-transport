import type {
  NetworkPattern,
  NetworkSnapshot,
  TransferLink,
} from './network.types';

export type ComparisonCategory =
  | 'route_added'
  | 'route_withdrawn'
  | 'route_modified'
  | 'direction_changed'
  | 'stop_sequence_changed'
  | 'boarding_point_moved'
  | 'geometry_changed'
  | 'fare_changed'
  | 'service_changed'
  | 'transfer_added'
  | 'transfer_withdrawn'
  | 'transfer_modified'
  | 'coverage_gained'
  | 'coverage_lost'
  | 'stop_area_added'
  | 'stop_area_modified'
  | 'stop_area_withdrawn'
  | 'stop_metadata_changed';

export interface ComparisonEntry {
  category: ComparisonCategory;
  reference: string;
  message: string;
  severity: 'info' | 'warning';
}

export interface ImportComparisonReport {
  routesAdded: string[];
  routesWithdrawn: string[];
  entries: ComparisonEntry[];
  summary: {
    addedRoutes: number;
    withdrawnRoutes: number;
    modifiedRoutes: number;
    addedTransfers: number;
    withdrawnTransfers: number;
    modifiedTransfers: number;
  };
}

function routeKey(p: NetworkPattern): string {
  return `${p.routeId}|${p.sourceTripId}`;
}

function stopSignature(p: NetworkPattern): string {
  return p.stops.map((s) => `${s.id}@${s.sequence}`).join('>');
}

function fareSignature(p: NetworkPattern): string {
  const rules = p.fareRules?.length ? p.fareRules : p.fare ? [p.fare] : [];
  return JSON.stringify(rules);
}

function serviceSignature(p: NetworkPattern): string {
  return JSON.stringify({
    from: p.service.validFrom,
    to: p.service.validTo,
    weekdays: p.service.weekdays,
    windows: p.service.windows,
    exceptions: p.service.exceptions,
    timezone: p.service.timezone,
    timetable: p.service.timetable,
    offsets: p.stops.map((s) => [s.elapsedSeconds, s.departureElapsedSeconds]),
  });
}

function geometrySignature(p: NetworkPattern): string | null {
  if (!p.geometry?.length) return null;
  return JSON.stringify(p.geometry);
}

function patternsByRoute(
  snapshot: NetworkSnapshot
): Map<string, NetworkPattern[]> {
  const map = new Map<string, NetworkPattern[]>();
  for (const p of snapshot.patterns.filter((p) => p.enabled)) {
    const list = map.get(p.routeId) || [];
    list.push(p);
    map.set(p.routeId, list);
  }
  return map;
}

function transferKey(t: TransferLink): string {
  // Parallel pedestrian paths can connect the same platforms. Never hide one.
  return t.id;
}

export function compareSnapshots(
  previous: NetworkSnapshot | null,
  next: NetworkSnapshot
): ImportComparisonReport {
  const entries: ComparisonEntry[] = [];
  const prevRoutes = previous
    ? patternsByRoute(previous)
    : new Map<string, NetworkPattern[]>();
  const nextRoutes = patternsByRoute(next);
  const prevRouteIds = new Set(prevRoutes.keys());
  const nextRouteIds = new Set(nextRoutes.keys());

  const routesAdded = [...nextRouteIds].filter((id) => !prevRouteIds.has(id));
  const routesWithdrawn = [...prevRouteIds].filter(
    (id) => !nextRouteIds.has(id)
  );

  for (const routeId of routesAdded) {
    entries.push({
      category: 'route_added',
      reference: routeId,
      message: `Route ${routeId} added with ${nextRoutes.get(routeId)!.length} directional pattern(s).`,
      severity: 'info',
    });
    entries.push({
      category: 'coverage_gained',
      reference: routeId,
      message: `New coverage from route ${routeId}.`,
      severity: 'info',
    });
  }

  for (const routeId of routesWithdrawn) {
    entries.push({
      category: 'route_withdrawn',
      reference: routeId,
      message: `Route ${routeId} withdrawn from the network.`,
      severity: 'warning',
    });
    entries.push({
      category: 'coverage_lost',
      reference: routeId,
      message: `Coverage lost for route ${routeId}.`,
      severity: 'warning',
    });
  }

  let modifiedRoutes = 0;
  for (const routeId of [...prevRouteIds].filter((id) =>
    nextRouteIds.has(id)
  )) {
    const before = new Map<string, NetworkPattern>(
      prevRoutes
        .get(routeId)!
        .map((p): [string, NetworkPattern] => [routeKey(p), p])
    );
    const after = new Map<string, NetworkPattern>(
      nextRoutes
        .get(routeId)!
        .map((p): [string, NetworkPattern] => [routeKey(p), p])
    );
    let routeChanged = false;

    for (const [key, p] of after) {
      const old = before.get(key);
      if (!old) {
        entries.push({
          category: 'direction_changed',
          reference: routeId,
          message: `New direction/headsign on route ${routeId}: ${p.headsign}.`,
          severity: 'info',
        });
        routeChanged = true;
        continue;
      }
      if (old.direction !== p.direction || old.headsign !== p.headsign) {
        entries.push({
          category: 'direction_changed',
          reference: p.sourceTripId,
          message: `Direction/headsign changed on route ${p.routeNumber}.`,
          severity: 'warning',
        });
        routeChanged = true;
      }
      if (
        old.routeName !== p.routeName ||
        old.routeNumber !== p.routeNumber ||
        old.agency !== p.agency
      )
        routeChanged = true;
      if (stopSignature(old) !== stopSignature(p)) {
        entries.push({
          category: 'stop_sequence_changed',
          reference: p.sourceTripId,
          message: `Stop sequence changed on route ${p.routeNumber} towards ${p.headsign}.`,
          severity: 'warning',
        });
        routeChanged = true;
      }
      if (
        JSON.stringify(
          old.stops.map((s) => [
            s.id,
            s.name,
            s.code,
            s.aliases,
            s.displayNames,
            s.stopAreaId,
            s.zoneId,
            s.platformCode,
            s.sourceRecord,
          ])
        ) !==
        JSON.stringify(
          p.stops.map((s) => [
            s.id,
            s.name,
            s.code,
            s.aliases,
            s.displayNames,
            s.stopAreaId,
            s.zoneId,
            s.platformCode,
            s.sourceRecord,
          ])
        )
      ) {
        entries.push({
          category: 'stop_metadata_changed',
          reference: p.sourceTripId,
          message: `Stop labels, terminal membership or fare zones changed on route ${p.routeNumber}.`,
          severity: 'warning',
        });
        routeChanged = true;
      }
      const moved = p.stops.filter((s) => {
        const prev = old.stops.find((before) => before.id === s.id);
        return (
          prev &&
          prev.id === s.id &&
          (prev.coordinates[0] !== s.coordinates[0] ||
            prev.coordinates[1] !== s.coordinates[1])
        );
      });
      for (const s of moved) {
        routeChanged = true;
        entries.push({
          category: 'boarding_point_moved',
          reference: s.id,
          message: `Boarding point moved for ${s.name} on route ${p.routeNumber}.`,
          severity: 'warning',
        });
      }
      if (geometrySignature(old) !== geometrySignature(p)) {
        entries.push({
          category: 'geometry_changed',
          reference: p.sourceTripId,
          message: `Geometry changed on route ${p.routeNumber} towards ${p.headsign}.`,
          severity: 'warning',
        });
        routeChanged = true;
      }
      if (fareSignature(old) !== fareSignature(p)) {
        entries.push({
          category: 'fare_changed',
          reference: p.sourceTripId,
          message: `Fare rules changed on route ${p.routeNumber} towards ${p.headsign}.`,
          severity: 'warning',
        });
        routeChanged = true;
      }
      if (serviceSignature(old) !== serviceSignature(p)) {
        entries.push({
          category: 'service_changed',
          reference: p.sourceTripId,
          message: `Service calendar or frequency changed on route ${p.routeNumber}.`,
          severity: 'warning',
        });
        routeChanged = true;
      }
    }

    for (const key of Array.from(before.keys())) {
      if (!after.has(key)) {
        entries.push({
          category: 'direction_changed',
          reference: routeId,
          message: `Pattern withdrawn from route ${routeId}: ${key.split('|')[1]}.`,
          severity: 'warning',
        });
        routeChanged = true;
      }
    }

    if (routeChanged) {
      modifiedRoutes++;
      entries.push({
        category: 'route_modified',
        reference: routeId,
        message: `Route ${routeId} has one or more pattern changes.`,
        severity: 'warning',
      });
    }
  }

  const prevTransfers = new Map<string, TransferLink>(
    (previous?.transfers || []).map((t): [string, TransferLink] => [
      transferKey(t),
      t,
    ])
  );
  const nextTransfers = new Map<string, TransferLink>(
    next.transfers.map((t): [string, TransferLink] => [transferKey(t), t])
  );

  let addedTransfers = 0;
  let withdrawnTransfers = 0;
  let modifiedTransfers = 0;

  for (const [key, t] of nextTransfers) {
    if (!prevTransfers.has(key)) {
      addedTransfers++;
      entries.push({
        category: 'transfer_added',
        reference: key,
        message: `${t.reviewed ? 'Reviewed' : 'Unreviewed'} transfer added: ${t.fromStopId} → ${t.toStopId} (${t.distanceMeters === null ? 'distance unknown' : `${t.distanceMeters} m`}).`,
        severity: 'info',
      });
    } else {
      const old = prevTransfers.get(key)!;
      if (
        old.fromStopId !== t.fromStopId ||
        old.toStopId !== t.toStopId ||
        old.distanceMeters !== t.distanceMeters ||
        old.durationSeconds !== t.durationSeconds ||
        old.source !== t.source ||
        old.reviewed !== t.reviewed ||
        old.pathKind !== t.pathKind ||
        JSON.stringify(old.review) !== JSON.stringify(t.review) ||
        JSON.stringify(old.instructions) !== JSON.stringify(t.instructions) ||
        JSON.stringify(old.geometry) !== JSON.stringify(t.geometry)
      ) {
        modifiedTransfers++;
        entries.push({
          category: 'transfer_modified',
          reference: key,
          message: `Transfer link updated: ${t.fromStopId} → ${t.toStopId}.`,
          severity: 'warning',
        });
      }
    }
  }

  for (const key of Array.from(prevTransfers.keys())) {
    if (!nextTransfers.has(key)) {
      withdrawnTransfers++;
      entries.push({
        category: 'transfer_withdrawn',
        reference: key,
        message: `Transfer link withdrawn: ${key}.`,
        severity: 'warning',
      });
    }
  }

  const oldAreas = new Map((previous?.stopAreas ?? []).map((a) => [a.id, a]));
  const newAreas = new Map((next.stopAreas ?? []).map((a) => [a.id, a]));
  for (const [id, area] of newAreas) {
    if (!oldAreas.has(id))
      entries.push({
        category: 'stop_area_added',
        reference: id,
        message: `Terminal ${area.name} added with ${area.boardingPointIds.length} boarding points.`,
        severity: 'info',
      });
    else if (JSON.stringify(oldAreas.get(id)) !== JSON.stringify(area))
      entries.push({
        category: 'stop_area_modified',
        reference: id,
        message: `Terminal ${area.name} aliases, position or boarding membership changed.`,
        severity: 'warning',
      });
  }
  for (const [id, area] of oldAreas)
    if (!newAreas.has(id))
      entries.push({
        category: 'stop_area_withdrawn',
        reference: id,
        message: `Terminal ${area.name} withdrawn.`,
        severity: 'warning',
      });
  if (
    JSON.stringify(previous?.fareRules ?? []) !==
    JSON.stringify(next.fareRules ?? [])
  )
    entries.push({
      category: 'fare_changed',
      reference: 'dataset-transfer-fares',
      message:
        'Dataset-level transfer fare amounts, eligibility or evidence changed.',
      severity: 'warning',
    });
  return {
    routesAdded,
    routesWithdrawn,
    entries,
    summary: {
      addedRoutes: routesAdded.length,
      withdrawnRoutes: routesWithdrawn.length,
      modifiedRoutes,
      addedTransfers,
      withdrawnTransfers,
      modifiedTransfers,
    },
  };
}
