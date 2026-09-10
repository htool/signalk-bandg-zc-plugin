'use strict'

var canboatjs = require('@canboat/canboatjs')
var tsPgns = require('@canboat/ts-pgns')
var toPgn = canboatjs.toPgn
var addCustomPgns = canboatjs.addCustomPgns
var tsCreatePGN = tsPgns.createPGN
var getPGNWithId = tsPgns.getPGNWithId
var getEnumeration = tsPgns.getEnumeration
var updateLookup = tsPgns.updateLookup

var SIMNET_ZC = require('./simnet-zc.json')

;(SIMNET_ZC.LookupEnumerations || []).forEach(function (en) {
  updateLookup(en)
})

function excerptDef(id) {
  var i
  for (i = 0; i < SIMNET_ZC.PGNs.length; i++) {
    if (SIMNET_ZC.PGNs[i].Id === id) {
      return SIMNET_ZC.PGNs[i]
    }
  }
}

var KEY_DEF = getPGNWithId('simnetZcKey') || excerptDef('simnetZcKey')
var KNOB_DEF = getPGNWithId('simnetZcKnob') || excerptDef('simnetZcKnob')
if (!KEY_DEF || !KNOB_DEF) {
  throw new Error('missing canboat-derived simnetZcKey/simnetZcKnob')
}

addCustomPgns({ PGNs: [KEY_DEF, KNOB_DEF] }, 'signalk-bandg-zc-plugin')

function fieldByName(def, name) {
  var i
  for (i = 0; i < def.Fields.length; i++) {
    if (def.Fields[i].Name === name) {
      return def.Fields[i]
    }
  }
}

var NAVICO_MANUFACTURER = fieldByName(KEY_DEF, 'Manufacturer Code').Match
var MARINE_INDUSTRY = fieldByName(KEY_DEF, 'Industry Code').Match
var KEY_FUNCTION = fieldByName(KEY_DEF, 'Function').Match
var KNOB_FUNCTION = fieldByName(KNOB_DEF, 'Function').Match
var BUTTON_PARAMETER = 0x320e
var KNOB_PARAMETER = 0
var KNOB_UNKNOWN = 8
var KNOB_ADDRESS = 0xfe
var LONG_PRESS_MS = 1000

var KEY_EVENT = {
  press: 'Press',
  release: 'Release',
  longpress: 'Long press'
}

var KEY_NAME = {
  mob: 'MOB',
  zoomin: 'Zoom in',
  zoomout: 'Zoom out',
  display: 'Display',
  stbyauto: 'Standby Auto',
  power: 'Power',
  plot: 'Plot',
  goto: 'Goto',
  chart: 'Chart',
  radar: 'Chart',
  echo: 'Echo',
  nav: 'Nav',
  info: 'Info',
  pages: 'Pages',
  knobpush: 'Knob push',
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  menu: 'Menu',
  win: 'Win',
  check: 'Check',
  cancel: 'Cancel',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '0': '0'
}

function addressFromHex(hex) {
  var n = parseInt(hex, 16)
  if (isNaN(n)) {
    return 0xff
  }
  return n
}

function defById(id) {
  if (id === 'simnetZcKey') {
    return KEY_DEF
  }
  if (id === 'simnetZcKnob') {
    return KNOB_DEF
  }
}

function createPGN(id, fields, dst) {
  var created = tsCreatePGN(id, fields, dst)
  if (created) {
    return created
  }
  var def = defById(id)
  if (!def) {
    return
  }
  var pgn = {
    pgn: def.PGN,
    prio: 3,
    dst: dst === undefined ? 255 : dst,
    fields: {},
    getDefinition: function () {
      return def
    }
  }
  def.Fields.forEach(function (field) {
    if (!field.Id || field.FieldType === 'RESERVED') {
      return
    }
    if (field.Match !== undefined) {
      pgn.fields[field.Id] = field.Description || field.Match
    }
  })
  Object.keys(fields || {}).forEach(function (key) {
    pgn.fields[key] = fields[key]
  })
  return pgn
}

function flattenCreated(created) {
  var def = created.getDefinition()
  var out = {
    pgn: created.pgn,
    prio: created.prio,
    dst: created.dst
  }
  def.Fields.forEach(function (field) {
    if (!field.Name || field.FieldType === 'RESERVED') {
      return
    }
    if (field.Name === 'Manufacturer Code' || field.Name === 'Industry Code') {
      out[field.Name] = field.Match
      return
    }
    if (Object.prototype.hasOwnProperty.call(created.fields, field.Id)) {
      out[field.Name] = created.fields[field.Id]
    }
  })
  return out
}

function jsonPgn(id, fields) {
  var created = createPGN(id, fields)
  if (!created) {
    throw new Error('createPGN failed for ' + id)
  }
  if (!toPgn(created)) {
    throw new Error('canboatjs toPgn failed for ' + id)
  }
  return flattenCreated(created)
}

function buttonPgn(mfdAddress, eventName, keyName) {
  return jsonPgn('simnetZcKey', {
    address: addressFromHex(mfdAddress),
    parameter: BUTTON_PARAMETER,
    keyEvent: KEY_EVENT[eventName],
    key: KEY_NAME[keyName]
  })
}

function knobPgn(keyName) {
  return jsonPgn('simnetZcKnob', {
    address: KNOB_ADDRESS,
    parameter: KNOB_PARAMETER,
    ticks: keyName === 'knobleft' ? 1 : -1,
    unknown: KNOB_UNKNOWN
  })
}

function enumValuesForLookup(lookupName) {
  var en = getEnumeration(lookupName)
  if (!en || !en.EnumValues) {
    var i
    for (i = 0; i < (SIMNET_ZC.LookupEnumerations || []).length; i++) {
      if (SIMNET_ZC.LookupEnumerations[i].Name === lookupName) {
        en = SIMNET_ZC.LookupEnumerations[i]
        break
      }
    }
  }
  if (!en || !en.EnumValues) {
    return
  }
  return en.EnumValues.map(function (ev) {
    return { name: ev.Name, value: String(ev.Value) }
  })
}

function skCustomDef(def) {
  var copy = JSON.parse(JSON.stringify(def))
  copy.Fields.forEach(function (field) {
    if (field.LookupEnumeration) {
      var values = enumValuesForLookup(field.LookupEnumeration)
      if (values) {
        field.EnumValues = values
        field.Type = 'Lookup table'
      }
    }
  })
  return copy
}

var NAVICO_ZC_ANNOUNCE_PGN = {
  PGN: 130845,
  Id: 'navicoZcAnnounce',
  Description: 'Simnet: Key Value (ZC announce)',
  Type: 'Fast',
  Complete: false,
  Length: 14,
  RepeatingFields: 0,
  Fields: [
    { Name: 'Manufacturer Code', BitLength: 11, BitOffset: 0, BitStart: 0, Match: NAVICO_MANUFACTURER, Type: 'Manufacturer code', Description: 'Simrad' },
    { Name: 'Reserved', BitLength: 2, BitOffset: 11, BitStart: 3 },
    { Name: 'Industry Code', BitLength: 3, BitOffset: 13, BitStart: 5, Match: MARINE_INDUSTRY, Description: 'Marine Industry' },
    { Name: 'Address', BitLength: 8, BitOffset: 16, BitStart: 0 },
    { Name: 'Instance', BitLength: 8, BitOffset: 24, BitStart: 0 },
    { Name: 'Network Group', BitLength: 8, BitOffset: 32, BitStart: 0 },
    { Name: 'Source', BitLength: 8, BitOffset: 40, BitStart: 0 },
    { Name: 'Key', BitLength: 24, BitOffset: 48, BitStart: 0 },
    { Name: 'Operation', BitLength: 8, BitOffset: 72, BitStart: 0 },
    { Name: 'Value', BitLength: 32, BitOffset: 80, BitStart: 0 }
  ]
}

addCustomPgns({ PGNs: [NAVICO_ZC_ANNOUNCE_PGN] }, 'signalk-bandg-zc-plugin')

var CUSTOM_PGNS = [
  skCustomDef(KEY_DEF),
  skCustomDef(KNOB_DEF),
  NAVICO_ZC_ANNOUNCE_PGN
]

function fillAnnounce(values) {
  var pgn = {
    pgn: NAVICO_ZC_ANNOUNCE_PGN.PGN,
    prio: 3,
    dst: 255
  }
  NAVICO_ZC_ANNOUNCE_PGN.Fields.forEach(function (field) {
    if (!field.Name || field.Name.indexOf('Reserved') === 0) {
      return
    }
    if (Object.prototype.hasOwnProperty.call(values, field.Name)) {
      pgn[field.Name] = values[field.Name]
    } else if (field.Match !== undefined) {
      pgn[field.Name] = field.Match
    }
  })
  if (!toPgn(pgn)) {
    throw new Error('canboatjs toPgn failed for ' + NAVICO_ZC_ANNOUNCE_PGN.Id)
  }
  return pgn
}

function announcePgn(address, key) {
  return fillAnnounce({
    Address: address,
    Instance: 0xff,
    'Network Group': 0xff,
    Source: 0xff,
    Key: key,
    Operation: 0,
    Value: 0xffffffff
  })
}

function announcePgns() {
  return [
    announcePgn(0xfe, 0x004a2f),
    announcePgn(0x01, 0x004a2f),
    announcePgn(0x01, 0x00122f),
    announcePgn(0x01, 0x00252f)
  ]
}

function twice(pgn) {
  return [pgn, pgn]
}

function pgnsForAction(button, action, mfdAddress, lastPressTime, now) {
  var pgns = []
  var held = now - lastPressTime
  var isLong = held > LONG_PRESS_MS || action === 'longpress'

  if (button === 'knobleft' || button === 'knobright') {
    if (action === 'released') {
      pgns = twice(knobPgn(button))
    }
  } else if (action === 'released' || action === 'longpress') {
    if (isLong) {
      if (button === 'mob' || button === 'goto' || button === 'power') {
        pgns = twice(buttonPgn(mfdAddress, 'longpress', button))
      }
      if (button === 'plot') {
        pgns = [
          buttonPgn(mfdAddress, 'press', button),
          buttonPgn(mfdAddress, 'release', button)
        ]
      }
    } else if (button === 'plot') {
      pgns = twice(buttonPgn(mfdAddress, 'longpress', button))
    } else {
      pgns = [
        buttonPgn(mfdAddress, 'press', button),
        buttonPgn(mfdAddress, 'release', button)
      ]
    }
  }
  return pgns
}

module.exports = {
  NAVICO_MANUFACTURER: NAVICO_MANUFACTURER,
  KEY_EVENT: KEY_EVENT,
  KEY_NAME: KEY_NAME,
  KEY_FUNCTION: KEY_FUNCTION,
  KNOB_FUNCTION: KNOB_FUNCTION,
  BUTTON_PARAMETER: BUTTON_PARAMETER,
  KNOB_UNKNOWN: KNOB_UNKNOWN,
  CUSTOM_PGNS: CUSTOM_PGNS,
  buttonPgn: buttonPgn,
  knobPgn: knobPgn,
  announcePgns: announcePgns,
  pgnsForAction: pgnsForAction,
  addressFromHex: addressFromHex,
  LONG_PRESS_MS: LONG_PRESS_MS,
  toPgn: toPgn,
  createPGN: createPGN
}
