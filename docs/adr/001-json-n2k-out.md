# ADR 001: JSON N2K out, not HEX

Status: implemented

## Context

This plugin emulates a B&G ZC/OP40 on the bus. It used Actisense HEX strings on `nmea2000out`. Canboat’s PGN 65332 is Yanmar engine data, not Navico keys, so HEX was the old last resort. [signalk-ai-approach](https://github.com/htool/signalk-ai-approach) and lighting ADR 0004: HEX only when the layout is unknown.

The 8-byte Simnet ZC layout is known (manufacturer Simrad, address, Function Key/Knob, parameter, key event/key or ticks).

## Decision

1. Emit **`nmea2000JsonOut`** objects. Do not emit HEX `nmea2000out`.
2. **Create** PGN 65332 with canboatjs 3 (`createPGN` when ts-pgns has the ids, else a canboat-derived excerpt in `lib/simnet-zc.json` + `toPgn`). Do not hand-roll the 8-byte layout.
3. Register **65332** (`simnetZcKey` / `simnetZcKnob`) and **65280** (`navicoDeviceStatus`) as **`canboat-custom-pgns`** so SK’s canboatjs can encode keys and decode the MFD heartbeat. Do **not** register the ZC 130845 announce def: SK prepends custom PGNs and that shadows `simnetKeyValue`, so display lighting encode is wrong.
4. PGN 130845 announce still uses the plugin’s ZC announce layout on the plugin’s own canboatjs instance (canboat `simnetKeyValue` field names differ). It is emitted as `nmea2000JsonOut` only.
5. This plugin still emits N2K (it impersonates a remote). It does not invent SK paths for keys. Src is left unset so the CAN device fills it.

## Consequences

- The plugin depends on `@canboat/canboatjs` 3.x from npm. It will not emit a PGN `toPgn` cannot encode.
- Encode tests live in `lib/zc-n2k.js` / `test/zc-n2k.test.js` (JSON fields + sample frames).
- HEX templates in `plugin/index.js` are gone.
- After ts-pgns publishes Simnet 65332, `lib/simnet-zc.json` can retire. SK still needs `canboat-custom-pgns` for 65332 and Navico 65280 until SK’s canboatjs includes those defs.
- Never register 130845 announce as `canboat-custom-pgns` (shadows lighting `simnetKeyValue`).
