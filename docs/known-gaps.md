# Known gaps

- **Knob turn** left/right hit areas fire on release, but the MFD still does not respond usefully. Do not “fix” turn encoding in a UI slice.
- **`plugin.registerWithRouter` is assigned inside `plugin.start`.** Same pattern as several older plugins. Do not move it unless a server version requires it. That is why CI should stay a simple `npm test` workflow, not Signal K’s reusable `plugin-ci.yml`, until that gap is its own slice.
- **`sourceAddress`** is no longer sent; the CAN device sets src on JSON out.
- **Long press** for MOB / GOTO / POWER is `> 1s` (or `action=longpress`). That is current behaviour, not a bug to loosen in a UI slice.
- **`chart` and `radar` share key code `1a`.**
- **`plugin.stop`** does not remove the `N2KAnalyzerOut` listener.
- **Live N2K / Zeus** is not in `npm test`. Unit tests cover layout scale, press offset, and LED colour.
- **Published ts-pgns 1.11.18** still has no Simnet 65332. The plugin uses local `file:../ts-pgns` and `file:../canboatjs-simnet-65332` (canboat-derived `createPGN`). GitHub CI `npm install` needs those sibling checkouts, or a published ts-pgns.
- **Hop SK 1.46.3** still encodes `nmea2000JsonOut` with canboatjs **1.27**. Replacing that nested package with 3.x is not this plugin’s job (`@signalk/streams` pins `^1.4.0`). `canboat-custom-pgns` stays.
- **PGN 130845 announce** is not canboat `simnetKeyValue` (different fields). Do not remap announce onto that def in a 65332 slice.
- **Zeus / IE11:** no optional chaining in `public/`. No `aspect-ratio` / `clip-path` requirement for keys (bounding boxes).
