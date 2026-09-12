# Known gaps

- **Knob turn** left/right hit areas fire on release, but the MFD still does not respond usefully. Do not “fix” turn encoding in a UI slice.
- **`plugin.registerWithRouter` is assigned inside `plugin.start`.** Same pattern as several older plugins. Do not move it unless a server version requires it. That is why CI should stay a simple `npm test` workflow, not Signal K’s reusable `plugin-ci.yml`, until that gap is its own slice. SK 2.x puts `/plugins` behind admin auth; the webapp polls readonly `/signalk/v1/api/signalk-bandg-zc-plugin/status` (`plugin.signalKApiRoutes`).
- **`sourceAddress`** is no longer sent; the CAN device sets src on JSON out.
- **Long press** for MOB / GOTO / POWER is `> 1s` (or `action=longpress`). That is current behaviour, not a bug to loosen in a UI slice.
- **`plugin.stop`** does not remove the `N2KAnalyzerOut` listener.
- **Live N2K / Zeus** is not in `npm test`. Unit tests cover layout scale, press offset, and LED colour.
- **Published ts-pgns 1.11.18** still has no Simnet 65332 classes or `navicoDeviceStatus`. The plugin ships `lib/simnet-zc.json` excerpted from canboat (PR 874 + Navico 65280) and `@canboat/canboatjs` 3 from npm. `createPGN` uses ts-pgns when those ids exist, otherwise the excerpt + `toPgn`.
- **Hop SK 1.46.3** still encodes `nmea2000JsonOut` with canboatjs **1.27**. Boatnet SK 2.31 uses canboatjs **3.5.3** (`ts-pgns` 1.10.7), which also lacks Navico 65280 / Simnet 65332. Replacing SK’s nested canboatjs is not this plugin’s job. `canboat-custom-pgns` stays for 65332 and 65280.
- **Canboat Pages lookup** on master is still **13** (`0x0D`). This Zeus3S 12 opens the home grid on **19** (`0x13`); the plugin lookup matches that live test. Radar is **8** here (canboat still has no Radar value). Do not revert those in a CI slice.
- **PGN 130845 announce** is not canboat `simnetKeyValue` (different fields). Do not register the announce def as `canboat-custom-pgns`: SK prepends it and lighting `toPgn` packs `419fffffffffffffffff32000000` instead of `419fffff01ffff12000132`. Keep announce on the plugin’s private canboatjs instance only.
- **Zeus / IE11:** no optional chaining in `public/`. No `aspect-ratio` / `clip-path` requirement for keys (bounding boxes). Status and keys use `XMLHttpRequest`, not jQuery (`/jquery/dist/jquery.min.js` is 404 on SK 2.31).
