import { lazy, Suspense, useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { faCrosshairs, faXmark } from "@fortawesome/free-solid-svg-icons";
import Input from "@/components/inputs/Input";
import Button from "@/components/inputs/Button";
import { FieldShell } from "@/components/inputs/Field";
import { nestedControlInputClassName } from "@/components/inputs/control";
import { Input as UIInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { networkRequest } from "./api";
import {
  createPlaceSearch,
  reverseGeocodeLocation,
  type PlaceSuggestion,
} from "./places";
import { locationFromStop, requestLocation } from "./locations";
import type { JourneyLocation, NetworkStop, Page } from "./types";

const MapPinPicker = lazy(() => import("./MapPinPicker"));

interface Props {
  label: string;
  value?: JourneyLocation;
  initialText?: string;
  onChange: (value: JourneyLocation | undefined) => void;
  /** `field` uses the shared Input shell; `composite` keeps the inline icon row. */
  appearance?: "field" | "composite";
  endpoint?: "origin" | "destination";
  otherStopId?: string;
}

export default function LocationSearch({
  label,
  value,
  initialText = "",
  onChange,
  appearance = "composite",
  endpoint,
  otherStopId,
}: Props) {
  const id = useId(),
    listId = `${id}-suggestions`;
  const [text, setText] = useState(value?.name || initialText),
    [focused, setFocused] = useState(false),
    [stops, setStops] = useState<NetworkStop[]>([]),
    [places, setPlaces] = useState<PlaceSuggestion[]>([]);
  const [busy, setBusy] = useState(false),
    [picking, setPicking] = useState(false),
    [locating, setLocating] = useState(false),
    [error, setError] = useState(""),
    [addressSource, setAddressSource] = useState(false),
    [stopLimit, setStopLimit] = useState(12),
    [stopCount, setStopCount] = useState(0),
    [active, setActive] = useState(-1);
  const search = useRef(createPlaceSearch()),
    inputRef = useRef<HTMLInputElement>(null),
    selection = useRef(0);
  const addressRequest = useRef<AbortController | null>(null);
  const invalidateSelection = () => {
    selection.current++;
    addressRequest.current?.abort();
    setLocating(false);
    setAddressSource(false);
  };
  const isField = appearance === "field";
  const hasText = Boolean(value || text);

  useEffect(
    () => () => {
      selection.current++;
      addressRequest.current?.abort();
    },
    [],
  );

  useEffect(() => {
    if (value) setText(value.name);
  }, [value]);

  useEffect(() => {
    const controller = new AbortController();
    setActive(-1);
    setStops([]);
    setPlaces([]);
    setStopCount(0);
    if (!focused || value || text.trim().length < 2) {
      setStops([]);
      setPlaces([]);
      setBusy(false);
      return () => controller.abort();
    }
    const timer = setTimeout(() => {
      setBusy(true);
      setError("");
      const params = new URLSearchParams({
        q: text.trim(),
        size: String(stopLimit),
      });
      if (endpoint) params.set("endpoint", endpoint);
      if (otherStopId) params.set("otherStopId", otherStopId);
      const local = networkRequest<Page<NetworkStop>>(`/stops?${params}`, {
        signal: controller.signal,
      });
      const external = Promise.race([
        search.current(text.trim()),
        new Promise<PlaceSuggestion[]>((resolve) =>
          setTimeout(() => resolve([]), 5000),
        ),
      ]).catch(() => [] as PlaceSuggestion[]);
      void local
        .then((p) => {
          if (!controller.signal.aborted) {
            setStops(p.rows);
            setStopCount(p.totalCount ?? p.rows.length);
          }
        })
        .catch((e) => {
          if (!controller.signal.aborted) {
            setStops([]);
            setError(e.message);
          }
        });
      void external.then((p) => {
        if (!controller.signal.aborted) setPlaces(p.slice(0, 4));
      });
      void Promise.allSettled([local, external]).then(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text, focused, value, endpoint, otherStopId, stopLimit]);

  const options = [
    ...stops.map((s) => ({
      key: s.id,
      label: s.name,
      kind: s.terminalArea
        ? `Terminal · ${s.boardingPointCount ?? "?"} boarding points`
        : `Bus stop · ${s.services?.length ? s.services.map((service) => `${service.routeNumber} towards ${service.headsign}`).join("; ") : s.routeNumbers?.join(", ") || s.code}${s.directConnection ? " · Direct connection to selected stop" : ""}`,
      select: async () => locationFromStop(s),
    })),
    ...places.map((p) => ({
      key: p.id,
      label: p.label,
      kind: "Google place",
      select: p.select,
    })),
  ];

  const select = async (index: number) => {
    const option = options[index];
    if (!option) return;
    invalidateSelection();
    const request = selection.current;
    setBusy(true);
    try {
      const selected = await option.select();
      if (request !== selection.current) return;
      onChange(selected);
      setText(selected.name);
      setFocused(false);
      setError("");
    } catch (e) {
      if (request === selection.current) setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    invalidateSelection();
    onChange(undefined);
    setText("");
    setError("");
    inputRef.current?.focus();
  };

  const locate = async () => {
    invalidateSelection();
    const request = selection.current;
    const controller = new AbortController();
    addressRequest.current = controller;
    setLocating(true);
    setError("");
    try {
      const p = await requestLocation();
      if (request !== selection.current) return;
      let selected: JourneyLocation;
      try {
        selected = await reverseGeocodeLocation(p, controller.signal);
        if (request !== selection.current) return;
        setAddressSource(true);
      } catch {
        if (request !== selection.current) return;
        selected = {
          ...p,
          name: `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`,
        };
        setError(
          "Your position was found, but its address could not be loaded. Coordinates are shown; you can still use this location.",
        );
      }
      onChange(selected);
      setText(selected.name);
      setFocused(false);
    } catch (e) {
      if (request === selection.current) setError((e as Error).message);
    } finally {
      if (request === selection.current) setLocating(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocused(true);
      setActive((i) => Math.min(i + 1, options.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Escape") {
      setFocused(false);
      setActive(-1);
    }
    if (e.key === "Enter" && focused && active >= 0) {
      e.preventDefault();
      void select(active);
    }
  };

  const inputProps = {
    id,
    role: "combobox" as const,
    "aria-label": label,
    "aria-autocomplete": "list" as const,
    "aria-expanded": focused && !value,
    "aria-controls": listId,
    "aria-activedescendant": active >= 0 ? `${id}-option-${active}` : undefined,
    autoComplete: "off",
    value: text,
    placeholder: "Search a stop or place",
    onFocus: () => setFocused(true),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      invalidateSelection();
      setStopLimit(12);
      setText(e.target.value);
      onChange(undefined);
      setError("");
    },
    onKeyDown,
  };

  const suggestions =
    focused && !value ? (
      <div className="journey-suggestions">
        {text.trim().length < 2 ? (
          <p>Type at least two letters. Search by stop name or landmark.</p>
        ) : (
          <>
            <ul id={listId} role="listbox" aria-label={`${label} suggestions`}>
              {options.map((o, i) => (
                <li
                  id={`${id}-option-${i}`}
                  key={`${o.kind}-${o.key}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => void select(i)}
                  className={i === active ? "is-active" : ""}
                >
                  <MapPin size={16} />
                  <span>
                    {o.label}
                    <small>{o.kind}</small>
                  </span>
                </li>
              ))}
            </ul>
            {stopCount > stops.length && stopLimit < 100 && (
              <button
                type="button"
                className="journey-pin-trigger"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setStopLimit((n) => Math.min(n + 12, 100))}
              >
                Show more stops ({stopCount - stops.length} more)
              </button>
            )}
            {busy ? (
              <p role="status">Finding stops and places…</p>
            ) : !options.length ? (
              <p>No suggestions. Try another stop name.</p>
            ) : null}
            {places.length > 0 && (
              <p className="journey-google-attribution">
                Place suggestions by <span translate="no">Google Maps</span>
              </p>
            )}
          </>
        )}
      </div>
    ) : null;

  return (
    <div
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setFocused(false);
      }}
      className={cn(
        "journey-field",
        isField && "journey-field--field",
        focused && !value && "journey-field--open",
      )}
    >
      <div className="journey-location-search-anchor">
        {isField ? (
          <Input
            ref={inputRef}
            {...inputProps}
            label={label}
            errorMessage={error || undefined}
            isLoading={locating}
            suffixIcon={hasText ? faXmark : faCrosshairs}
            suffixIconHandler={hasText ? clear : () => void locate()}
            suffixIconLabel={
              hasText
                ? `Clear ${label.toLowerCase()}`
                : `Use my location for ${label.toLowerCase()}`
            }
            className="h-11 text-base md:text-base"
          />
        ) : (
          <FieldShell
            label={label}
            htmlFor={id}
            errorMessage={error || undefined}
          >
            <div className="journey-location-control">
              <MapPin size={17} aria-hidden="true" />
              <UIInput
                ref={inputRef}
                {...inputProps}
                className={cn(
                  "journey-location-input",
                  nestedControlInputClassName,
                )}
              />
              {hasText && (
                <Button
                  type="button"
                  size="icon-sm"
                  className="journey-icon-button"
                  aria-label={`Clear ${label.toLowerCase()}`}
                  onClick={clear}
                >
                  <span aria-hidden="true">×</span>
                </Button>
              )}
              <Button
                type="button"
                size="icon-sm"
                className="journey-icon-button"
                aria-label={`Use my location for ${label.toLowerCase()}`}
                disabled={locating}
                onClick={() => void locate()}
              >
                <span aria-hidden="true">◎</span>
              </Button>
            </div>
          </FieldShell>
        )}
        {suggestions}
      </div>
      {addressSource && (
        <p className="journey-google-attribution">
          Address by <span translate="no">Google Maps</span>
        </p>
      )}
      <button
        type="button"
        className="journey-pin-trigger"
        onClick={() => {
          invalidateSelection();
          setFocused(false);
          setPicking(true);
        }}
      >
        <MapPin size={14} aria-hidden="true" />
        Choose {label.toLowerCase()} on map
      </button>
      {picking && (
        <Suspense fallback={<p role="status">Opening map picker…</p>}>
          <MapPinPicker
            label={label}
            value={value}
            onClose={() => {
              setPicking(false);
              inputRef.current?.focus();
            }}
            onChoose={(location) => {
              invalidateSelection();
              onChange(location);
              setText(location.name);
              setError("");
              setPicking(false);
              inputRef.current?.focus();
            }}
          />
        </Suspense>
      )}
      {locating && !isField && (
        <p className="journey-field-hint" role="status">
          Finding your location…
        </p>
      )}
    </div>
  );
}
