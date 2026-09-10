# Agents

This plugin: webapp that looks like a B&G ZC1/OP40 remote. HTTP key events emit NMEA 2000 PGN 65332 as `nmea2000JsonOut` (not HEX). It does not own display brightness, NAVIOP switches, or buddy alerts.

Follow [Signal K AI approach](https://github.com/htool/signalk-ai-approach). Do not copy those pages into this tree. Do not load `signalk-server` `src/` unless a client contract is undefined.

## Read first

1. [README.md](README.md) — scope card (job, in, out)
2. [docs/architecture.md](docs/architecture.md)
3. [docs/adr/](docs/adr/) — locked: [001 JSON N2K out](docs/adr/001-json-n2k-out.md)
4. [docs/features.md](docs/features.md) — next pending slice only
5. [docs/known-gaps.md](docs/known-gaps.md) — do not invent these here
6. [skills/zc-remote/SKILL.md](skills/zc-remote/SKILL.md)
7. Then plugin source — never import `signalk-server` `src/`

## Overlap

| Repo | Role |
| --- | --- |
| This plugin | ZC1/OP40 lookalike webapp; `GET /plugins/signalk-bandg-zc-plugin/key/:button/:action` → `app.emit('nmea2000JsonOut')` PGN 65332. First PGN 65280 sets `mfdAddress`. |
| signalk-to-nmea2000 / signalk-n2k-displays | Display brightness/mode on N2K, not keypad keys |
| signalk-naviop-plugin | NAVIOP switch PGNs |
| signalk-mfd-plugin | Extra Zeus tiles, not the ZC faceplate |

If a slice cannot be done from these files, fix the docs. Do not grow the prompt.

## Rules

- One logical change per commit. Do not bump `package.json` version (0.0.9).
- This plugin **does** emit NMEA (`nmea2000JsonOut` PGN 65332 / 130845). It emulates a ZC remote. Do not emit HEX `nmea2000out`.
- Zeus/IE11 webapp: no optional chaining; use `var`/`function`.
- Feature slices include tests in done-when. Put layout/LED math in `public/zc-ui.js`; run `npm test` (`node --test`) before the code commit.
