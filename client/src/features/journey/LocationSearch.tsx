import { useEffect, useId, useRef, useState } from "react";
import { MapPin, Navigation, X } from "lucide-react";
import { networkRequest } from "./api";
import { createPlaceSearch, type PlaceSuggestion } from "./places";
import { locationFromStop, requestLocation } from "./locations";
import type { JourneyLocation, NetworkStop, Page } from "./types";

interface Props {
  label: string;
  value?: JourneyLocation;
  initialText?: string;
  onChange: (value: JourneyLocation | undefined) => void;
}
export default function LocationSearch({
  label,
  value,
  initialText = "",
  onChange,
}: Props) {
  const id = useId(),
    listId = `${id}-suggestions`;
  const [text, setText] = useState(value?.name || initialText),
    [focused, setFocused] = useState(false),
    [stops, setStops] = useState<NetworkStop[]>([]),
    [places, setPlaces] = useState<PlaceSuggestion[]>([]);
  const [busy, setBusy] = useState(false),
    [locating, setLocating] = useState(false),
    [error, setError] = useState(""),
    [active, setActive] = useState(-1);
  const search = useRef(createPlaceSearch()),
    inputRef = useRef<HTMLInputElement>(null),
    selection = useRef(0);
  useEffect(() => {
    if (value) setText(value.name);
  }, [value]);
  useEffect(() => {
    const controller = new AbortController();
    setActive(-1);
    setStops([]);
    setPlaces([]);
    if (!focused || value || text.trim().length < 2) {
      setStops([]);
      setPlaces([]);
      setBusy(false);
      return () => controller.abort();
    }
    const timer = setTimeout(() => {
      setBusy(true);
      setError("");
      const local = networkRequest<Page<NetworkStop>>(
        `/stops?q=${encodeURIComponent(text.trim())}&size=6`,
        { signal: controller.signal },
      );
      const external = Promise.race([
        search.current(text.trim()),
        new Promise<PlaceSuggestion[]>((resolve) =>
          setTimeout(() => resolve([]), 5000),
        ),
      ]).catch(() => [] as PlaceSuggestion[]);
      void local
        .then((p) => {
          if (!controller.signal.aborted) setStops(p.rows);
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
  }, [text, focused, value]);
  const options = [
    ...stops.map((s) => ({
      key: s.id,
      label: s.name,
      kind: `Bus stop · ${(s as NetworkStop & { routeNumbers?: string[] }).routeNumbers?.join(", ") || s.code}`,
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
    const request = ++selection.current;
    setBusy(true);
    try {
      const selected = await option.select();
      if (request !== selection.current) return;
      onChange(selected);
      setText(selected.name);
      setFocused(false);
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const locate = async () => {
    setLocating(true);
    setError("");
    try {
      const p = await requestLocation();
      onChange(p);
      setText(p.name);
      setFocused(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLocating(false);
    }
  };
  return (
    <div className="journey-field">
      <label htmlFor={id}>{label}</label>
      <div className="journey-location-control">
        <MapPin size={17} aria-hidden="true" />
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={focused && !value}
          aria-controls={listId}
          aria-activedescendant={
            active >= 0 ? `${id}-option-${active}` : undefined
          }
          aria-describedby={error ? `${id}-error` : undefined}
          autoComplete="off"
          value={text}
          placeholder="Search a stop or place"
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onChange={(e) => {
            selection.current++;
            setText(e.target.value);
            onChange(undefined);
            setError("");
          }}
          onKeyDown={(e) => {
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
          }}
        />
        {(value || text) && (
          <button
            type="button"
            className="journey-icon-button"
            aria-label={`Clear ${label.toLowerCase()}`}
            onClick={() => {
              selection.current++;
              onChange(undefined);
              setText("");
              inputRef.current?.focus();
            }}
          >
            <X size={17} />
          </button>
        )}
        <button
          type="button"
          className="journey-icon-button"
          aria-label={`Use my location for ${label.toLowerCase()}`}
          disabled={locating}
          onClick={() => void locate()}
        >
          <Navigation size={17} />
        </button>
      </div>
      {focused && !value && (
        <div className="journey-suggestions">
          {text.trim().length < 2 ? (
            <p>Type at least two letters. Search by stop name or landmark.</p>
          ) : (
            <>
              <ul
                id={listId}
                role="listbox"
                aria-label={`${label} suggestions`}
              >
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
      )}
      {locating && (
        <p className="journey-field-hint" role="status">
          Finding your location…
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="journey-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
