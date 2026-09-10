'use strict'

var NAVICO_MANUFACTURER = 1857
var MARINE_INDUSTRY = 4
var KEY_FUNCTION = 132
var KNOB_FUNCTION = 133
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

var KEY_EVENT_VALUE = {
  Press: 179,
  Release: 51,
  'Long press': 128
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

var KEY_VALUE = {
  'Standby Auto': 4,
  Win: 6,
  Display: 7,
  Goto: 10,
  Menu: 16,
  Pages: 19,
  Power: 20,
  Echo: 21,
  Nav: 23,
  Chart: 26,
  Plot: 27,
  Info: 28,
  MOB: 29,
  '1': 30,
  '2': 31,
  '3': 32,
  '4': 33,
  '5': 34,
  '6': 35,
  '7': 36,
  '8': 37,
  '9': 38,
  '0': 39,
  Check: 40,
  Cancel: 41,
  Right: 79,
  Left: 80,
  Down: 81,
  Up: 82,
  'Zoom out': 86,
  'Zoom in': 87,
  'Knob push': 88
}

function enumValues(valueByName) {
  return Object.keys(valueByName).map(function (name) {
    return { name: name, value: String(valueByName[name]) }
  })
}

function manufacturerFields() {
  return [
    {
      Name: 'Manufacturer Code',
      BitLength: 11,
      BitOffset: 0,
      BitStart: 0,
      Match: NAVICO_MANUFACTURER,
      Type: 'Manufacturer code',
      Description: 'Simrad'
    },
    { Name: 'Reserved', BitLength: 2, BitOffset: 11, BitStart: 3 },
    {
      Name: 'Industry Code',
      BitLength: 3,
      BitOffset: 13,
      BitStart: 5,
      Match: MARINE_INDUSTRY,
      Type: 'Lookup table',
      Description: 'Marine Industry'
    }
  ]
}

var SIMNET_ZC_KEY_PGN = {
  PGN: 65332,
  Id: 'simnetZcKey',
  Description: 'Simnet: ZC1/OP40 Key',
  Type: 'Single',
  Complete: true,
  Length: 8,
  RepeatingFields: 0,
  Fields: manufacturerFields().concat([
    { Name: 'Address', BitLength: 8, BitOffset: 16, BitStart: 0 },
    {
      Name: 'Function',
      BitLength: 8,
      BitOffset: 24,
      BitStart: 0,
      Match: KEY_FUNCTION,
      Type: 'Lookup table',
      Description: 'Key',
      EnumValues: [
        { name: 'Key', value: '132' },
        { name: 'Knob', value: '133' }
      ]
    },
    { Name: 'Parameter', BitLength: 16, BitOffset: 32, BitStart: 0 },
    {
      Name: 'Key Event',
      BitLength: 8,
      BitOffset: 48,
      BitStart: 0,
      Type: 'Lookup table',
      EnumValues: enumValues(KEY_EVENT_VALUE)
    },
    {
      Name: 'Key',
      BitLength: 8,
      BitOffset: 56,
      BitStart: 0,
      Type: 'Lookup table',
      EnumValues: enumValues(KEY_VALUE)
    }
  ])
}

var SIMNET_ZC_KNOB_PGN = {
  PGN: 65332,
  Id: 'simnetZcKnob',
  Description: 'Simnet: ZC1/OP40 Knob',
  Type: 'Single',
  Complete: true,
  Length: 8,
  RepeatingFields: 0,
  Fields: manufacturerFields().concat([
    { Name: 'Address', BitLength: 8, BitOffset: 16, BitStart: 0 },
    {
      Name: 'Function',
      BitLength: 8,
      BitOffset: 24,
      BitStart: 0,
      Match: KNOB_FUNCTION,
      Type: 'Lookup table',
      Description: 'Knob',
      EnumValues: [
        { name: 'Key', value: '132' },
        { name: 'Knob', value: '133' }
      ]
    },
    { Name: 'Parameter', BitLength: 16, BitOffset: 32, BitStart: 0 },
    {
      Name: 'Ticks',
      BitLength: 8,
      BitOffset: 48,
      BitStart: 0,
      Type: 'Integer',
      Signed: true
    },
    { Name: 'Unknown', BitLength: 8, BitOffset: 56, BitStart: 0, Type: 'Integer' }
  ])
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
    { Name: 'Manufacturer Code', BitLength: 11, BitOffset: 0, BitStart: 0, Match: NAVICO_MANUFACTURER, Type: 'Manufacturer code' },
    { Name: 'Reserved', BitLength: 2, BitOffset: 11, BitStart: 3 },
    { Name: 'Industry Code', BitLength: 3, BitOffset: 13, BitStart: 5, Match: MARINE_INDUSTRY },
    { Name: 'Address', BitLength: 8, BitOffset: 16, BitStart: 0 },
    { Name: 'Instance', BitLength: 8, BitOffset: 24, BitStart: 0 },
    { Name: 'Network Group', BitLength: 8, BitOffset: 32, BitStart: 0 },
    { Name: 'Source', BitLength: 8, BitOffset: 40, BitStart: 0 },
    { Name: 'Key', BitLength: 24, BitOffset: 48, BitStart: 0 },
    { Name: 'Operation', BitLength: 8, BitOffset: 72, BitStart: 0 },
    { Name: 'Value', BitLength: 32, BitOffset: 80, BitStart: 0 }
  ]
}

var CUSTOM_PGNS = [SIMNET_ZC_KEY_PGN, SIMNET_ZC_KNOB_PGN, NAVICO_ZC_ANNOUNCE_PGN]

function addressFromHex(hex) {
  var n = parseInt(hex, 16)
  if (isNaN(n)) {
    return 0xff
  }
  return n
}

function basePgn(pgn) {
  return {
    pgn: pgn,
    prio: 3,
    dst: 255,
    'Manufacturer Code': NAVICO_MANUFACTURER,
    'Industry Code': MARINE_INDUSTRY
  }
}

function buttonPgn(mfdAddress, eventName, keyName) {
  var pgn = basePgn(65332)
  pgn.Address = addressFromHex(mfdAddress)
  pgn.Function = 'Key'
  pgn.Parameter = BUTTON_PARAMETER
  pgn['Key Event'] = KEY_EVENT[eventName]
  pgn.Key = KEY_NAME[keyName]
  return pgn
}

function knobPgn(keyName) {
  var pgn = basePgn(65332)
  pgn.Address = KNOB_ADDRESS
  pgn.Function = 'Knob'
  pgn.Parameter = KNOB_PARAMETER
  pgn.Ticks = keyName === 'knobleft' ? 1 : -1
  pgn.Unknown = KNOB_UNKNOWN
  return pgn
}

function announcePgn(address, key) {
  var pgn = basePgn(130845)
  pgn.Address = address
  pgn.Instance = 0xff
  pgn['Network Group'] = 0xff
  pgn.Source = 0xff
  pgn.Key = key
  pgn.Operation = 0
  pgn.Value = 0xffffffff
  return pgn
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
  KEY_VALUE: KEY_VALUE,
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
  LONG_PRESS_MS: LONG_PRESS_MS
}
