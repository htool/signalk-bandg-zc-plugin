# ZC1 remote control

![ZC](https://raw.githubusercontent.com/htool/signalk-bandg-zc-plugin/main/public/zc.jpg)

Signal K webapp that looks like a B&G ZC1 / OP40 remote. Key presses emit NMEA 2000 PGN 65332.

## Scope

| | |
|---|---|
| Job | ZC1/OP40 lookalike webapp; HTTP key events → N2K PGN 65332 to a discovered MFD |
| In | Webapp pointer events; first PGN 65280 (`N2KAnalyzerOut`) for `mfdAddress` |
| Out | `app.emit('nmea2000JsonOut')` PGN 65332 (keys), 130850 Standby/Heading for STBY/AUTO, 130845 (announce on start); `GET /signalk/v1/api/signalk-bandg-zc-plugin/status` |
| Not | Display brightness/mode; NAVIOP switches; buddy alerts; fake AIS |

Agent work: start at [AGENTS.md](AGENTS.md).

## Notes

- Long-press buttons (MOB, GOTO, POWER) need a press longer than 1 second.
- STBY/AUTO follows PGN 65305 on the bus and sends Simnet AP Standby or Heading (PGN 130850), not a keypad key.
- The top-right dial sends the same 65332 keys as Up/Down (ZC2 firmware HID 0x52/0x51). Zeus applies those to the focused window.
