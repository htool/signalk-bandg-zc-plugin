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
  - `GET /plugins/signalk-bandg-zc-plugin/status` returns `{ mfdFound: mfdAddress !== "", mfdAddress }`.
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
