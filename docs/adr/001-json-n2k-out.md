# ADR 001: JSON N2K out, not HEX

Status: implemented

## Context

This plugin emulates a B&G ZC/OP40 on the bus. It used Actisense HEX strings on `nmea2000out`. Canboat’s PGN 65332 is Yanmar engine data, not Navico keys, so HEX was the old last resort. [signalk-ai-approach](https://github.com/htool/signalk-ai-approach) and lighting ADR 0004: HEX only when the layout is unknown.

The 8-byte Simnet ZC layout is known (manufacturer Simrad, address, Function Key/Knob, parameter, key event/key or ticks).

## Decision

1. Emit **`nmea2000JsonOut`** objects. Do not emit HEX `nmea2000out`.
2. Register **custom PGN 65332** variants `simnetZcKey` / `simnetZcKnob` (`canboat-custom-pgns`) so canboatjs encodes Simnet ZC frames. Stock `@canboat/pgns` 1.4.2 has no 65332; canboat C already distinguishes Yanmar Engine Data C on the same PGN.
3. PGN 130845 announce uses named Simrad Key Value fields, same event.
4. This plugin still emits N2K (it impersonates a remote). It does not invent SK paths for keys. Src is left unset so the CAN device fills it.

## Consequences

- Encode tests live in `lib/zc-n2k.js` / `test/zc-n2k.test.js` (JSON fields).
- HEX templates in `plugin/index.js` are gone.
- A canboat PR for Navico 65332 would let the custom PGN retire later.
