# Known gaps

- **Knob turn** left/right hit areas fire on release, but the MFD still does not respond usefully. Do not “fix” turn encoding in a UI slice.
- **`plugin.registerWithRouter` is assigned inside `plugin.start`.** Same pattern as several older plugins. Do not move it unless a server version requires it. That is why CI should stay a simple `npm test` workflow, not Signal K’s reusable `plugin-ci.yml`, until that gap is its own slice.
- **`sourceAddress`** is no longer sent; the CAN device sets src on JSON out.
- **Long press** for MOB / GOTO / POWER is `> 1s` (or `action=longpress`). That is current behaviour, not a bug to loosen in a UI slice.
- **`chart` and `radar` share key code `1a`.**
- **`plugin.stop`** does not remove the `N2KAnalyzerOut` listener.
- **Live N2K / Zeus** is not in `npm test`. Unit tests cover layout scale, press offset, and LED colour.
- **Canboat PGN 65332** in published `@canboat/pgns` 1.4.2 is missing; canboat C (PR 874) has Simnet ZC Key/Knob plus Yanmar. This plugin registers `simnetZcKey` / `simnetZcKnob` via `canboat-custom-pgns` ([ADR 001](adr/001-json-n2k-out.md)) until `@canboat/pgns` / `@canboat/ts-pgns` publish those defs.
- **Zeus / IE11:** no optional chaining in `public/`. No `aspect-ratio` / `clip-path` requirement for keys (bounding boxes).
