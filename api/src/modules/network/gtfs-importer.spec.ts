import JSZip from 'jszip';
import { importGtfs, serviceSeconds } from './gtfs-importer';
import { validateSnapshot } from './network.validation';

async function feed(overrides: Record<string, string> = {}) {
  const files = {
    'agency.txt': 'agency_id,agency_name\na,Test operator',
    'routes.txt':
      'route_id,agency_id,route_short_name,route_long_name\nr,a,101,A to C',
    'stops.txt':
      'stop_id,stop_name,stop_lat,stop_lon\nA,Alpha,-1.95,30\nB,Bravo,-1.95,30.001\nC,Charlie,-1.95,30.002',
    'trips.txt':
      'route_id,service_id,trip_id,direction_id\nr,s,out,0\nr,s,back,1\nr,s,loop,0',
    'stop_times.txt':
      'trip_id,arrival_time,departure_time,stop_id,stop_sequence\nout,23:55:00,23:55:00,A,1\nout,24:05:00,24:05:00,B,2\nout,24:10:00,24:10:00,C,3\nback,08:00:00,08:00:00,C,1\nback,08:05:00,08:05:00,A,2\nloop,08:00:00,08:00:00,A,1\nloop,08:05:00,08:05:00,B,2\nloop,08:10:00,08:10:00,A,3\nloop,08:15:00,08:15:00,C,4',
    'calendar.txt':
      'service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\ns,1,1,1,1,1,0,0,20190225,20210225',
    'calendar_dates.txt': 'service_id,date,exception_type\ns,20190301,2',
    'frequencies.txt':
      'trip_id,start_time,end_time,headway_secs\nout,23:00:00,25:00:00,600',
    ...overrides,
  };
  const zip = new JSZip();
  for (const [name, text] of Object.entries(files)) zip.file(name, text);
  return zip.generateAsync({ type: 'nodebuffer' });
}
describe('GTFS directional import', () => {
  it('retains source journeys, directions, repeated occurrences, and historical calendars', async () => {
    const result = await importGtfs(await feed());
    expect(result.snapshot.patterns).toHaveLength(3);
    expect(validateSnapshot(result.snapshot)).toEqual([]);
    const [out, back, loop] = result.snapshot.patterns;
    expect(out).toMatchObject({
      sourceTripId: 'out',
      direction: '0',
      service: {
        validTo: '2021-02-25',
        windows: [
          { startSeconds: 82800, endSeconds: 90000, headwaySeconds: 600 },
        ],
      },
    });
    expect(out.stops.map((s) => s.elapsedSeconds)).toEqual([0, 600, 900]);
    expect(back.direction).toBe('1');
    expect(loop.stops.map((s) => s.id)).toEqual([
      'DT4A_A',
      'DT4A_B',
      'DT4A_A',
      'DT4A_C',
    ]);
    expect(result.snapshot.transfers).toEqual([]);
    expect(result.snapshot.patterns.every((p) => p.fare === null)).toBe(true);
  });
  it('quarantines patterns referencing malformed stops, not just the bad occurrence', async () => {
    const result = await importGtfs(
      await feed({
        'stops.txt':
          'stop_id,stop_name,stop_lat,stop_lon\nA,Alpha,-1.95,30\nB,Bravo,999,30.001\nC,Charlie,-1.95,30.002',
      })
    );
    expect(result.snapshot.patterns.map((p) => p.sourceTripId)).toEqual([
      'back',
    ]);
    expect(result.issues.some((i) => i.reference === 'B')).toBe(true);
  });
  it('falls back explicitly to schematic geometry and preserves source namespace', async () => {
    const result = await importGtfs(
      await feed({
        'shapes.txt':
          'shape_id,shape_pt_sequence,shape_pt_lat,shape_pt_lon\ns,0,999,30',
      }),
      'reviewed-test'
    );
    expect(result.snapshot.patterns[0].geometry).toBeNull();
    expect(result.snapshot.patterns[0].routeId).toBe('reviewed-test:r');
    expect(result.snapshot.patterns[0].stops[0].id).toBe('REVIEWED-TEST_A');
  });
  it('rejects missing required files and invalid service times', async () => {
    await expect(
      importGtfs(await new JSZip().generateAsync({ type: 'nodebuffer' }))
    ).rejects.toThrow('Missing agency.txt');
    expect(serviceSeconds('25:10:00')).toBe(90600);
    expect(() => serviceSeconds('08:99:00')).toThrow();
  });
});
