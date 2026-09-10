# ZC1 remote control

![ZC](https://raw.githubusercontent.com/htool/signalk-bandg-zc-plugin/main/public/zc.jpg)

Signal K webapp that looks like a B&G ZC1 / OP40 remote. Key presses emit NMEA 2000 PGN 65332.

## Scope

| | |
|---|---|
| Job | ZC1/OP40 lookalike webapp; HTTP key events → N2K PGN 65332 to a discovered MFD |
| In | Webapp pointer events; first PGN 65280 (`N2KAnalyzerOut`) for `mfdAddress` |
| Out | `app.emit('nmea2000JsonOut')` PGN 65332 (keys) and 130845 (announce on start); `GET /plugins/signalk-bandg-zc-plugin/status` |
| Not | Display brightness/mode; NAVIOP switches; buddy alerts; fake AIS; knob *turn* (hit areas only) |

Agent work: start at [AGENTS.md](AGENTS.md).

## Notes

- Long-press buttons (MOB, GOTO, POWER) need a press longer than 1 second.
- Knob turn left/right hit areas still do not get a useful MFD response (known gap).
