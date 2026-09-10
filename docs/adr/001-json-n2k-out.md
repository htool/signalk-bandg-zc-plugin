# ADR 001: JSON N2K out, not HEX

Status: implemented

## Context

This plugin emulates a B&G ZC/OP40 on the bus. It used Actisense HEX strings on `nmea2000out`. Canboat’s PGN 65332 is Yanmar engine data, not Navico keys, so HEX was the old last resort. [signalk-ai-approach](https://github.com/htool/signalk-ai-approach) and lighting ADR 0004: HEX only when the layout is unknown.

The 8-byte Simnet ZC layout is known (manufacturer Simrad, address, Function Key/Knob, parameter, key event/key or ticks).

## Decision

1. Emit **`nmea2000JsonOut`** objects. Do not emit HEX `nmea2000out`.
2. **Create** PGN 65332 with canboatjs 3 `createPGN('simnetZcKey'|'simnetZcKnob')`. Those classes come from `@canboat/ts-pgns`, which is generated from canboat (not a layout copied into this plugin).
3. Register the same defs as **`canboat-custom-pgns`** so hop SK 1.46’s canboatjs 1.27 can encode the JSON. Stock `@canboat/pgns` 1.4.2 and published `@canboat/ts-pgns` 1.11.18 have no Simnet 65332.
4. PGN 130845 announce still uses the plugin’s ZC announce layout (canboat `simnetKeyValue` field names differ).
5. This plugin still emits N2K (it impersonates a remote). It does not invent SK paths for keys. Src is left unset so the CAN device fills it.

## Consequences

- The plugin depends on `@canboat/canboatjs` 3.x and `@canboat/ts-pgns` (local `file:../` until Simnet 65332 is published). It will not emit a PGN `createPGN` / `toPgn` cannot encode.
- Encode tests live in `lib/zc-n2k.js` / `test/zc-n2k.test.js` (JSON fields + sample frames).
- HEX templates in `plugin/index.js` are gone.
- After ts-pgns publishes Simnet 65332, the `file:` deps can become npm versions. SK 1.27 still needs `canboat-custom-pgns` until SK itself uses canboatjs 3.
