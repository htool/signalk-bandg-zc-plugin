---
name: zc-remote
description: >-
  Change the B&G ZC1/OP40 lookalike webapp and PGN 65332 key emit
  in signalk-bandg-zc-plugin. Use when editing public/zc-ui.js,
  control-panel layout, key HTTP routes, or mfdAddress /status LED.
---

# ZC remote

Read [AGENTS.md](../../AGENTS.md) first. Next slice is [docs/features.md](../../docs/features.md).

## Do

- Register `canboat-custom-pgns` for 65332, Navico 65280, and 130850 Standby/Heading (Event Match 6/9) only. Do **not** register 130845 (shadows lighting `simnetKeyValue`). Do not emit HEX `nmea2000out`.
- Put layout and LED math in `public/zc-ui.js`. `PRESS_OFFSET_PX` is **3**. Faceplate is `public/control-panel.jpg` (1807×1103). Scale old 875×535 image-map coords; do not treat zip folder names as labels.
- `knobleft` / `knobright` are mapped half-wells of the top-right dial (not greyed). They emit the same 65332 keys as `up` (82) / `down` (81). Center `knobpush` is a round well (`is-circle`, `border-radius: 50%`, higher z-index) and Key 88. ZC2 firmware (`ZC2_1_0_02_00.swup`) MOVs those HID values from the rotary. Do not emit Function Knob ticks (`0x85`) for the dial.
- LED: panel pixels 213,187–269,212; red until `GET /signalk/v1/api/signalk-bandg-zc-plugin/status` has `mfdFound`, then green. Do not poll `/plugins/...` (admin-only on SK 2.x).
- Zeus/IE11 webapp: `var` / `function`, no optional chaining. Status/keys via `XMLHttpRequest`, not jQuery.
- HTTP `radar` → Key 8; `pages` → 19 (`0x13`); `chart` → 26. Live Zeus3S 12; canboat master still Pages=13.
- `stbyauto` is **not** ZC Key 4. Listen to PGN **65305** Mode for `apState`/`apAddress`. On `pressed` emit PGN **130850** Event **9** Heading if standby, Event **6** Standby if auto. Same 12-byte AP-group layout as emulate.js Standby/Engage (`41,9f,<ac>,ff,ff,0a,06|09,00,ff,ff,ff,ff`). Register those two Event-Match defs on `canboat-custom-pgns`; do not register a catch-all 130850 or 130845. IN/OUT stay 65332.
- Add tests in `test/` for that slice. `npm test` must pass.
- After a code change that boatnet runs, copy to `pi@boatnet:/home/pi/src/signalk-bandg-zc-plugin` and `cd ~/signalk && docker compose restart signalk`. Keep plugin config.

## Do not

- Copy “do not emit NMEA” from other plugins (this one emulates a ZC).
- Emit HEX `nmea2000out`.
- Ship the zip’s mislabeled fragment PNGs as live buttons.
- Bump the npm version.
- Load `signalk-server` `src/` unless a client contract is undefined.
- Invent a Function Knob (`0x85`) tick encoding for the dial (firmware uses Up/Down keys).
- Use optional chaining or `clip-path` as the only hit test.
- PUT empty plugin config on boatnet.
- Open a signalk-server issue unless the human asked.
