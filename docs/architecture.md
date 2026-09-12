# Architecture

## Job

Serve a webapp that looks like a B&G ZC1/OP40 remote. Pointer events on keys become NMEA 2000 PGN 65332 frames on the bus. The first PGN 65280 seen sets the destination MFD address.

## Data flow

```
webapp pointer down/up on a key well
        │
        ▼
GET /plugins/signalk-bandg-zc-plugin/key/:button/:action
        │
        ▼
sendButton(button, action)
        │
        ├─ knobleft / knobright on release → PGN 65332 Function Knob, Ticks ±1 (twice)
        └─ other keys on release (or longpress):
              hold > 1s and mob|goto|power → longpress frame (twice)
              plot short → longpress frame; plot long → press then release
              else short → press frame then release frame
        │
        ▼
app.emit('nmea2000JsonOut', pgn)

N2KAnalyzerOut PGN 65280 (first only)
        │
        ▼
mfdAddress = src as 2-digit hex
        │
        ▼
GET /signalk/v1/api/signalk-bandg-zc-plugin/status
        → { mfdFound: mfdAddress !== "", mfdAddress }
        │
        ▼
webapp LED: red until mfdFound, then green
```

HTTP button `radar` is Key **8**; `pages` is **19** (`0x13`); `chart` is **26**. Those Radar/Pages bytes are from this Zeus3S 12; canboat master still has Pages=13 and no Radar.

On `plugin.start`, register `canboat-custom-pgns` (`simnetZcKey`, `simnetZcKnob`, `navicoDeviceStatus`) so **SK’s** canboatjs can encode 65332 and decode Navico PGN 65280. Flattened JSON uses **numeric** lookup values (`Key Event` 179, `Key` 30) because SK 2.x canboatjs 3.5.3 does not resolve custom lookup names. Do **not** register the ZC 130845 announce def there: SK prepends custom defs, which shadows canboat `simnetKeyValue` and breaks `signalk-n2k-displays` / `signalk-to-nmea2000` lighting encode. Announce still uses the plugin’s own canboatjs `toPgn` and `nmea2000JsonOut`. `lib/zc-n2k.js` builds 65332 with canboatjs 3 `toPgn` (ts-pgns `createPGN` when present, else `lib/simnet-zc.json`). Src is unset so the CAN device fills it.

## HTTP

Routes are assigned on `plugin.registerWithRouter` **inside** `plugin.start` (see known-gaps).

| Method | Path | Result |
|---|---|---|
| GET | `/signalk/v1/api/signalk-bandg-zc-plugin/key/:button/:action` | JSON echo of params; side effect `sendButton` (readonly SK API, no admin) |
| GET | `/signalk/v1/api/signalk-bandg-zc-plugin/status` | `{ mfdFound, mfdAddress }` (readonly SK API) |
| GET | `/plugins/signalk-bandg-zc-plugin/status` | same JSON; SK 2.x requires admin |

`action` is `pressed`, `released`, `longpress`, or `click` (pressed then released).

## Webapp layout

`public/index.html` draws `public/control-panel.jpg` (1807×1103). Key wells are CSS windows into that image (`background`/`<img>` offset). Layout math lives in `public/zc-ui.js`: old image-map coords on 875×535 scale onto the panel. Pressed wells `translate(3px, 3px)` with `overflow: hidden`. The LED box is panel pixels `213,187 – 269,212`.

## Addresses

| Name | Source |
|---|---|
| `mfdAddress` | First PGN 65280 `msg.src`, hex padded to 2 chars. Empty until then. |
| `sourceAddress` | Not set on TX. canboatjs candevice overwrites src on `nmea2000JsonOut`. |

## Stop

`plugin.stop` logs only. It does not remove the `N2KAnalyzerOut` listener.
