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
GET /plugins/signalk-bandg-zc-plugin/status
        → { mfdFound: mfdAddress !== "", mfdAddress }
        │
        ▼
webapp LED: red until mfdFound, then green
```

On `plugin.start`, register `canboat-custom-pgns` (`simnetZcKey`, `simnetZcKnob`, 130845 announce) and emit four PGN 130845 JSON objects. Keys are JSON PGN 65332 (`lib/zc-n2k.js`) using canboat field names. Src is unset so the CAN device fills it. Hop Signal K 1.46 encodes that JSON with canboatjs 1.27 `toPgn` via `nmea2000JsonOut`.

## HTTP

Routes are assigned on `plugin.registerWithRouter` **inside** `plugin.start` (see known-gaps).

| Method | Path | Result |
|---|---|---|
| GET | `/plugins/signalk-bandg-zc-plugin/key/:button/:action` | JSON echo of params; side effect `sendButton` |
| GET | `/plugins/signalk-bandg-zc-plugin/status` | `{ mfdFound, mfdAddress }` |

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
