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

- Emit NMEA as JSON: `app.emit('nmea2000JsonOut', pgn)` from `lib/zc-n2k.js`. Create 65332 with canboatjs 3 `toPgn` (canboat-derived defs). Register `canboat-custom-pgns` for 65332 and Navico 65280 only. Do **not** register 130845 (shadows lighting `simnetKeyValue`). Do not emit HEX `nmea2000out`.
- Put layout and LED math in `public/zc-ui.js`. `PRESS_OFFSET_PX` is **3**. Faceplate is `public/control-panel.jpg` (1807×1103). Scale old 875×535 image-map coords; do not treat zip folder names as labels.
- Keep `knobleft` / `knobright` as hit areas.
- LED: panel pixels 213,187–269,212; red until `GET /signalk/v1/api/signalk-bandg-zc-plugin/status` has `mfdFound`, then green. Do not poll `/plugins/...` (admin-only on SK 2.x).
- Zeus/IE11 webapp: `var` / `function`, no optional chaining. Status/keys via `XMLHttpRequest`, not jQuery.
- HTTP `radar` → Key 8; `pages` → 19 (`0x13`); `chart` → 26. Live Zeus3S 12; canboat master still Pages=13.
- Add tests in `test/` for that slice. `npm test` must pass.
- After a code change that boatnet runs, copy to `pi@boatnet:/home/pi/src/signalk-bandg-zc-plugin` and `cd ~/signalk && docker compose restart signalk`. Keep plugin config.

## Do not

- Copy “do not emit NMEA” from other plugins (this one emulates a ZC).
- Emit HEX `nmea2000out`.
- Ship the zip’s mislabeled fragment PNGs as live buttons.
- Bump the npm version.
- Load `signalk-server` `src/` unless a client contract is undefined.
- Invent a knob-turn encoding in a UI/LED slice.
- Use optional chaining or `clip-path` as the only hit test.
- PUT empty plugin config on boatnet.
- Open a signalk-server issue unless the human asked.
