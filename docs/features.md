# Features

Implement in order. One slice per commit unless a slice says otherwise. Stop when the slice's done-when is met. **New feature slices include tests** (`npm test`); put layout/LED math in `public/zc-ui.js`.

## 1. Agent docs kit

- **Status:** done
- **Outcome:** An agent can change this plugin from the files in AGENTS.md without a chat dump.
- **Done when:** AGENTS.md (links [signalk-ai-approach](https://github.com/htool/signalk-ai-approach)), README scope, architecture, this file, known-gaps, and `skills/zc-remote/SKILL.md` exist.
- **Out of scope:** `plugin/index.js` changes, ADRs (none locked).

## 2. Zip panel UI + 3px press offset

- **Status:** done
- **Outcome:** Webapp uses the zip `control-panel` faceplate; keys are CSS windows; pressed key moves 3 CSS pixels.
- **Done when:**
  - `public/control-panel.jpg` is the faceplate (1807×1103). Do not ship the zip’s mislabeled fragment PNGs.
  - Old image-map coords (875×535) scale onto the panel in `public/zc-ui.js`.
  - Each key is a well (`overflow: hidden`) whose face is a window into the panel image.
  - Press uses `PRESS_OFFSET_PX = 3` (`translate(3px, 3px)`).
  - `knobleft` / `knobright` stay hit areas.
  - Tests cover scale, key list, offset, well/face math (`node --test`).
- **Out of scope:** knob *turn* behaviour, fragment PNGs as buttons, version bump.

## 3. MFD found LED

- **Status:** done
- **Outcome:** Status LED (bar under “1”, top-left) starts red and turns green when an MFD is found.
- **Done when:**
  - `GET /signalk/v1/api/signalk-bandg-zc-plugin/status` returns `{ mfdFound: mfdAddress !== "", mfdAddress }` (readonly API; `/plugins/.../status` is admin-only on SK 2.x).
  - LED box is panel pixels `213,187 – 269,212`.
  - Webapp polls status; LED red until `mfdFound`, then green.
  - Tests cover LED box and colour from `mfdFound`.
- **Out of scope:** changing how `mfdAddress` is chosen (first PGN 65280), version bump.

## 4. JSON N2K out, not HEX

- **Status:** done
- **Outcome:** Keys and announce go out as `nmea2000JsonOut`. No HEX `nmea2000out`.
- **ADR:** [001](adr/001-json-n2k-out.md)
- **Done when:**
  - `lib/zc-n2k.js` builds PGN 65332 / 130845 objects
  - `canboat-custom-pgns` registers Navico 65332 (canboat stock is Yanmar)
  - `plugin/index.js` emits only `nmea2000JsonOut`
  - tests cover JSON fields, short/long press, knob, announce
- **Out of scope:** canboat upstream PR, version bump, SK paths for keys.

## 5. Canboat field names on JSON 65332

- **Status:** done
- **Outcome:** Emitted JSON matches canboat Simnet ZC1/OP40 PGN 65332 (`Function` Key/Knob, `Key Event` lookups, knob `Ticks`).
- **Done when:**
  - `lib/zc-n2k.js` uses canboat names: `Function` `Key`/`Knob`, `Parameter` 0x320E, `Key Event` Press/Release/Long press, `Key` lookup; knob `Address` 254, `Ticks` +1/−1, `Unknown` 8.
  - `canboat-custom-pgns` registers `simnetZcKey` and `simnetZcKnob` (stock `@canboat/pgns` 1.4.2 has no 65332).
  - Tests cover names, both custom defs, and canboatjs encode of sample frames when SK's canboatjs is present.
- **Out of scope:** waiting for published `@canboat/pgns` / `@canboat/ts-pgns`, version bump.

## 6. Create PGNs with canboatjs toPgn

- **Status:** done
- **Outcome:** Key/knob/announce JSON is filled from the registered canboatjs PGN defs and only returned if `toPgn` succeeds.
- **Done when:**
  - Plugin depends on `@canboat/canboatjs` (1.27, same major as hop SK).
  - `lib/zc-n2k.js` calls `addCustomPgn` then `toPgn`; Match fields come from the def, not duplicated in `buttonPgn`.
  - Tests encode sample frames via the plugin’s canboatjs, not a hardcoded SK path.
- **Out of scope:** upgrading hop SK to canboatjs 3.x / `createPGN` classes, version bump.

## 7. createPGN from canboat-derived canboatjs 3

- **Status:** done
- **Outcome:** PGN 65332 objects are created with `createPGN`, using ts-pgns generated from canboat. The plugin no longer owns the 65332 field layout.
- **Done when:**
  - Plugin depends on canboatjs 3.x + `@canboat/ts-pgns` (`file:../canboatjs-simnet-65332`, `file:../ts-pgns` until npm publishes Simnet 65332).
  - `lib/zc-n2k.js` calls `createPGN('simnetZcKey'|'simnetZcKnob')` then `toPgn`; HTTP button names still map to canboat lookup strings.
  - Tests cover `createPGN` classes and the same sample hex as canboat (`419f1d840e32b31e`, knob `419ffe8500000108` / `419ffe850000ff08`).
- **Out of scope:** publishing ts-pgns, replacing SK’s nested canboatjs 1.27, changing 130845 announce layout, version bump.

## 8. CI uses npm canboatjs 3 (no file: siblings)

- **Status:** done
- **Outcome:** GitHub `npm test` installs `@canboat/canboatjs` 3 from npm. Simnet 65332 defs come from `lib/simnet-zc.json` (canboat PR 874) until ts-pgns publishes them.
- **Done when:**
  - `package.json` has no `file:../canboatjs-simnet-65332` / `file:../ts-pgns`.
  - `npm install && npm test` works without sibling checkouts.
  - Sample hex tests still pass.
- **Out of scope:** publishing ts-pgns, version bump.

## 9. Do not shadow lighting 130845; decode Navico 65280

- **Status:** done
- **Outcome:** SK canboatjs still encodes Navico display lighting. ZC LED can see Zeus PGN 65280.
- **Done when:**
  - `canboat-custom-pgns` is `simnetZcKey`, `simnetZcKnob`, `navicoDeviceStatus` only (no 130845).
  - `lib/simnet-zc.json` includes canboat `navicoDeviceStatus` (manufacturer 275).
  - Tests: custom list, FromPgn of `13,99,04,05,00,00,02,00` → src 31.
- **Out of scope:** remapping announce onto `simnetKeyValue`, version bump, changing how `mfdAddress` is chosen.

## 10. Webapp XHR + numeric 65332 lookups for SK 3.5.3

- **Status:** done
- **Outcome:** ZC webapp polls LED and sends keys without jQuery. SK 2.31 canboatjs encodes Press/Key bytes correctly.
- **Done when:**
  - `public/index.html` uses `XMLHttpRequest` (IE11). No `/jquery/` script.
  - Flattened 65332 JSON uses lookup numbers (`Key Event` 179, `Key` 30 for `"1"`). Sample hex still `419f1d840e32b31e`.
- **Out of scope:** version bump.

## 11. Zeus-live Radar and Pages key bytes

- **Status:** done
- **Outcome:** Radar and Pages keys match this Zeus3S 12 (not canboat’s Chart/Pages=13 guesses).
- **Done when:**
  - `radar` encodes Key **8** (`0x08`), not Chart 26.
  - `pages` encodes Key **19** (`0x13`), not 13 (`0x0D`).
  - `chart` stays 26 (`0x1A`).
  - Tests cover those three hex frames.
- **Out of scope:** canboat upstream lookup PR, version bump.
