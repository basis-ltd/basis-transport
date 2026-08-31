# Door-to-door implementation audit

Goal: the complete objective in the user-supplied `goal-objective.md`, not merely
rendering a planner page. Initial resumed audit: 30 August 2026.

The worktree is authoritative. Existing uncommitted implementation is preserved.
Baseline: 39 backend unit tests pass, but their coverage does not prove the goal.

## Requirement ledger

| Objective area | Current evidence / remaining work |
| --- | --- |
| Preserve application and guest access | Existing guest APIs, archives, saved items and reports; re-run integration/security checks after changes. |
| Authorized current source | No current licensed complete export supplied. Rechecked Bisi landing and GTFS reference; direct HTTP fetches of Ecofleet overview/shuttle succeeded after web-reader timeouts. No GTFS/ZIP export links found on those two pages. This does not establish a complete inventory or redistribution rights. |
| Network model/import | Directional occurrences, shapes and comparisons exist. Added GTFS parent-station/platform import, stop-name translations, immutable archive provenance and original route/trip/stop/occurrence references. No name/coordinate merging. Still need a reviewed cross-source mapping workflow, richer per-record verification, pathway/accessibility import and broader feed profiles (including calendar-dates-only feeds). |
| Fares | Fixed/section conflict detection, requested fare date, known subtotal, discount sign and physical-leg indices fixed. GTFS zones preserved; foreign currency quarantined. Transfer adjustments now require an explicit route pair and may restrict physical boarding/alighting stop IDs. Missing scope, stale/conflicting adjustments and excessive discounts leave totals unknown. Categories, sourced distance rules, complex transfer eligibility and estimated-quote UI still require completion. |
| Planning | Walking-only now handles stops/outside transit coverage and unrelated provider failures. Terminal selection resolves correctly; individual platforms remain specific. Candidate diversity and truncation reporting added. Accessibility model and remaining performance/continuity edge cases need review. |
| Timing | Replaced invented common start with independently verified service-day departures inside graph search. Includes waits/walks/dwell, exceptions, prior-day overnight trips and minimum transfer time; unknown/historic data stays unknown. Added regression tests including usable fourth alternative. Still need full approved current-feed integration and real-provider checks. |
| Passenger instructions | Correct physical-leg fare association, complete pedestrian text/attribution, intermediate stops, map-leg selection and timing labels. Stop details now expose platform codes, source record identity and language-tagged names. Broader record verification and specialized fare instructions remain part of the model follow-up. |
| Follow journey | Explicit arrival/undo, validated 12-hour version-scoped storage, automatic resume, actual-location replanning, in-memory completed-step reference, permission/exit/unmount/hidden-document watcher cleanup implemented. Added unit/browser tests; inspect remaining accessibility and geo edge cases. |
| UI | Existing spine/cards and filters fixed, including Radix empty-option crash. Preferences survive URL reload/back/share. Added guest network map/list explorer with route/operator/direction filters, occurrence-specific stop selection and mobile full-screen map. Added explicit map pins with confirmation, cancellation and coordinate-entry fallback. Mobile/desktop screenshots inspected, including provider outage; live Google-map QA is still a release dependency. |
| Operations/privacy | Added bounded nested snapshot validation, stop/terminal identity invariants, and evidence-bound staff transfer approval with revision checking. No generated straight-line path can be approved by a checkbox alone. Comparison reports include terminals, labels, global fares and parallel path identities; staff can inspect all changes. Isolated API/security/archive checks pass. Still need broader import/mapping administration, concurrent generic draft-save protection, production deployment verification and provider QA. |
| Release evidence | Existing named Kigali fixtures are synthetic, not independently field reviewed. Current rights, operator verification, real Google-provider QA, production audit/staging checks remain external release dependencies. |

## Rules for subsequent passes

- Keep missing information unknown; never publish historic or synthetic coverage
  as current.
- Passing tests that encode an incorrect assumption must be corrected, not used
  to preserve that assumption.
- Test routing outcomes through the service/API as well as isolated helpers.
- Continue implementation despite source-dependent release gates. Do not mark the
  overall goal complete until all required work and evidence are accounted for.

## Latest verification / next actions

- Backend: 90 unit tests and 12 API/security tests on the existing isolated
  `basis_planner_test_restore_1788076930171` database. No developer/production
  migration or publication performed in this pass. Archive count checks pass.
- Frontend: 30 component/utility/adapter tests and 30 browser tests across desktop and
  320-pixel mobile; builds pass. `client/test-results` contains result/guidance and
  map-explorer/pin-picker, staff-review and stop-identity PNGs. Map interactions are adapter-tested using mocks;
  browser checks exercise blocked/missing-provider recovery, not a paid live API.
- Goal is NOT complete. Next work: complete the licensed-source adapter/profile,
  pathway/accessibility and fare eligibility
  model and broader staff import/mapping workflows. Run full regression/security/
  migration and real-provider checks again.
- Nested snapshot validation now rejects malformed optional fields, impossible
  dates, inconsistent repeated-stop metadata, ambiguous terminal membership,
  unsupported fare eligibility and invalid scoped rules before projection.
  Current-route fixtures remain synthetic, not independently reviewed.
- Initial browser bundle now measures 592 kB (190 kB gzip), not the older 425 kB
  documented baseline. Analyze shared imports before asserting performance gates.

## Network explorer / map-pin pass

- `GET /api/network/map` reads a single published snapshot and applies the same
  rights/currentness gate as planning. Filters are validated and server payload
  limits cannot be overridden. It never identifies a route as currently running.
- Overview budget: 100 patterns, 128 geometry points per pattern, 200 stop
  occurrences per pattern / 2,000 total, and 500 route-filter entries. Original
  shapes and stop sequences are not mutated. Generalization, schematics and
  truncation are labeled; refine by route or open full route details as needed.
- `/routes?view=map` preserves route/operator/direction filters on reload, keeps
  source metadata visible, and provides ordered stop details when maps fail.
  Map line/marker selection is linked to the route/occurrence list. No realtime
  vehicle feed, fare inference, or external map inventory is introduced.
- Pin selection is lazy and opt-in, does not request GPS, and never treats the
  default camera center or empty coordinate fields as an endpoint. Confirmation
  removes any previous stop identity and uses the normal shareable journey URL.
- This is additive read-only API/UI work: no migration, network import or
  developer/production publication was performed. Integration tests temporarily
  publish synthetic data only inside the existing isolated test database.

## Evidence-bound transfer review / validation pass

- Draft transfer creation records intent only: distinct existing stop IDs, empty
  geometry, unknown distance/duration and no approval. It invents no crossing,
  walking time or route geometry.
- Staff supplies a surveyed/licensed pedestrian path, metrics, source reference
  and passenger instructions, saves the draft, then explicitly records HTTPS
  evidence and review notes. The server records authenticated reviewer identity
  and time and checks the saved revision under a database lock.
- Approval is bound to exact path content and boarding-point coordinates.
  Changing either invalidates approval. Imports and clones cannot carry approvals
  forward, snapshot edits cannot manufacture them, and published graphs ignore
  legacy checkbox-only approvals. Historical records are not rewritten.
- Path checks validate endpoints within 30 m, length consistency and a 400 m
  transfer cap. These checks do not prove a safe crossing or accessibility; human
  field/source review is still required. Accessibility capability fields remain
  a separate implementation requirement.
- The staff UI follows the existing paper/ink/green design, with an explicit
  boarding-point path, distinct save/review actions, required labeled controls,
  mobile-native path-source selection and visible errors. Raw editing is locked
  while review is pending. Tests cover both 320 px mobile and desktop.
- API integration tests exercise guest/user denial, authenticated staff review,
  missing path evidence, malformed nested input, forged approval, stale revisions,
  approval invalidation and unchanged publication/archive counts. Browser tests
  use synthetic authentication and mocked data, not real staff privileges or
  actual field evidence.
- Additive JSON fields require no new SQL migration. Existing published transfer
  approvals without evidence are intentionally unusable until freshly reviewed
  in a draft. Generic snapshot saves still need optimistic concurrency protection;
  only the dedicated transfer-approval operation currently requires a revision.

## Terminal / translation / provenance pass

- GTFS `location_type=1` imports a terminal container; type 0 imports distinct
  boarding platforms. Only explicit `parent_station` relationships group them.
  Invalid parents, cycles, duplicate source IDs and stop-times referencing missing
  or non-platform records quarantine affected patterns instead of skipping a stop.
  Non-platform entrance/node/boarding-area records are flagged as unsupported, not
  converted into boarding locations or approved pedestrian pathways.
- Stop-name translations support exact field-value matches and record-specific
  precedence. Conflicting equal-priority translations are quarantined. BCP 47
  language tags are validated/canonicalized. Other translation fields are reported
  as unsupported; this is not complete application or GTFS translation support.
- Public search finds translated terminal/platform names. Terminal detail links
  resolve to their own platforms and serving routes. Duplicate public stop codes
  require an exact stop ID rather than returning an arbitrary platform.
- Original record references retain namespace, GTFS file, ID and stop-time source
  sequence. An immutable import envelope records the archive checksum, URL,
  import timestamp and optional known retrieval timestamp. A local file does not
  acquire a fabricated retrieval date, and no timestamp refreshes service dates.
  These are provenance references, not current-service verification assertions.
- Fixed CLI source-URL forwarding and empty-timezone handling. An in-memory
  re-import of the real DT4A archive validates with 195 patterns, 55 routes,
  828 stop IDs, zero terminals and unchanged 2019–2021 service dates. It reports
  27 stop/pattern notices and 191 unverified-fare notices (218 total), rather than
  the older stored import's 28 notices. No real dataset was saved or published.
- Isolated API tests import a synthetic terminal and prove translated search,
  terminal detail, platform-specific boarding, protected provenance and unchanged
  publication after cleanup. New component/browser tests cover multilingual source
  details. The in-app browser was also inspected at desktop and 320 px; no overflow.
- These optional JSON fields need no SQL migration or in-place backfill. Re-import
  an authorized source as a new draft when provenance is needed. Old published
  versions and legacy archives remain intact. No current licensed source export
  has been supplied; source rights and field verification remain release gates.
