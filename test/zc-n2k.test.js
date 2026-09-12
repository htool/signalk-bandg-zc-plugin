'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const n2k = require('../lib/zc-n2k')

function assertJsonPgn(pgn, expectedPgn) {
  assert.equal(typeof pgn, 'object')
  assert.equal(pgn.pgn, expectedPgn)
  assert.equal(pgn.prio, 3)
  assert.equal(pgn.dst, 255)
  assert.equal(pgn['Manufacturer Code'], n2k.NAVICO_MANUFACTURER)
  assert.equal(Array.isArray(pgn), false)
  assert.ok(n2k.toPgn(pgn), 'canboatjs toPgn encodes this PGN')
}

test('button PGN is JSON 65332 built and encoded by canboatjs', () => {
  const pgn = n2k.buttonPgn('1d', 'press', '1')
  assertJsonPgn(pgn, 65332)
  assert.equal(pgn.Address, 0x1d)
  assert.equal(pgn.Function, n2k.KEY_FUNCTION)
  assert.equal(pgn.Parameter, n2k.BUTTON_PARAMETER)
  assert.equal(pgn['Key Event'], 179)
  assert.equal(pgn.Key, 30)
  assert.equal(n2k.toPgn(pgn).toString('hex'), '419f1d840e32b31e')
})

test('missing MFD address becomes 0xff', () => {
  assert.equal(n2k.buttonPgn('', 'release', 'mob').Address, 0xff)
})

test('knob PGN uses Function Knob, Ticks, and address 0xfe', () => {
  const left = n2k.knobPgn('knobleft')
  assertJsonPgn(left, 65332)
  assert.equal(left.Address, 0xfe)
  assert.equal(left.Function, n2k.KNOB_FUNCTION)
  assert.equal(left.Parameter, 0)
  assert.equal(left.Ticks, 1)
  assert.equal(left.Unknown, n2k.KNOB_UNKNOWN)
  assert.equal(n2k.toPgn(left).toString('hex'), '419ffe8500000108')
  assert.equal(n2k.knobPgn('knobright').Ticks, -1)
  assert.equal(n2k.toPgn(n2k.knobPgn('knobright')).toString('hex'), '419ffe850000ff08')
})

test('short press emits press then release JSON', () => {
  const pgns = n2k.pgnsForAction('1', 'released', '0a', 1000, 1100)
  assert.equal(pgns.length, 2)
  assert.equal(pgns[0]['Key Event'], 179)
  assert.equal(pgns[1]['Key Event'], 51)
  assert.equal(typeof pgns[0], 'object')
})

test('long press MOB emits longpress twice', () => {
  const pgns = n2k.pgnsForAction('mob', 'released', '0a', 0, 1500)
  assert.equal(pgns.length, 2)
  assert.equal(pgns[0]['Key Event'], 128)
  assert.equal(pgns[0].Key, 29)
})

test('plot short press uses longpress event', () => {
  const pgns = n2k.pgnsForAction('plot', 'released', '0a', 1000, 1100)
  assert.equal(pgns[0]['Key Event'], 128)
})

test('announce is four JSON 130845 objects', () => {
  const pgns = n2k.announcePgns()
  assert.equal(pgns.length, 4)
  pgns.forEach(function (pgn) {
    assertJsonPgn(pgn, 130845)
    assert.equal(typeof pgn.Key, 'number')
  })
  assert.equal(pgns[0].Address, 0xfe)
  assert.equal(pgns[0].Key, 0x004a2f)
})

test('custom PGNs are 65332 key/knob and Navico 65280, not 130845', () => {
  const defs = n2k.CUSTOM_PGNS
  assert.deepEqual(defs.map(function (p) { return p.Id }), [
    'simnetZcKey',
    'simnetZcKnob',
    'navicoDeviceStatus'
  ])
  assert.equal(defs.filter(function (p) { return p.PGN === 130845 }).length, 0)
  const status = defs.filter(function (p) { return p.PGN === 65280 })[0]
  assert.equal(status.Fields[0].Match, 275)
  assert.equal(status.Fields[0].Description, 'Navico')
})

test('custom PGN 65332 is canboat-derived simnetZcKey and simnetZcKnob', () => {
  const defs = n2k.CUSTOM_PGNS.filter(function (p) {
    return p.PGN === 65332
  })
  assert.equal(defs.length, 2)
  assert.equal(defs[0].Id, 'simnetZcKey')
  assert.equal(defs[1].Id, 'simnetZcKnob')
  assert.equal(defs[0].Length, 8)
  assert.equal(defs[0].Fields[0].Match, n2k.NAVICO_MANUFACTURER)
  const fn = defs[0].Fields.filter(function (f) { return f.Name === 'Function' })[0]
  assert.equal(fn.Match, n2k.KEY_FUNCTION)
  assert.equal(fn.Description, 'Key')
  const ticks = defs[1].Fields.filter(function (f) { return f.Name === 'Ticks' })[0]
  assert.equal(ticks.Signed, true)
})

test('FromPgn decodes Navico MFD PGN 65280', () => {
  const FromPgn = require('@canboat/canboatjs').FromPgn
  const from = new FromPgn()
  const parsed = from.parse('2023-01-01-00:00:00.000,2,65280,31,255,8,13,99,04,05,00,00,02,00')
  assert.ok(parsed)
  assert.equal(parsed.pgn, 65280)
  assert.equal(parsed.src, 31)
  assert.equal(parsed.id, 'navicoDeviceStatus')
})

test('createPGN builds Simnet ZC key and knob classes', () => {
  const key = n2k.createPGN('simnetZcKey', {
    address: 0x1d,
    parameter: n2k.BUTTON_PARAMETER,
    keyEvent: 'Press',
    key: '1'
  })
  assert.equal(key.pgn, 65332)
  assert.equal(key.fields.function, 'Key')
  assert.equal(n2k.toPgn(key).toString('hex'), '419f1d840e32b31e')
  const knob = n2k.createPGN('simnetZcKnob', {
    address: 0xfe,
    parameter: 0,
    ticks: 1,
    unknown: n2k.KNOB_UNKNOWN
  })
  assert.equal(knob.fields.function, 'Knob')
  assert.equal(n2k.toPgn(knob).toString('hex'), '419ffe8500000108')
})

test('canboatjs toPgn is required to create a key PGN', () => {
  const pgn = n2k.buttonPgn('0a', 'release', 'mob')
  assert.equal(n2k.toPgn(pgn).toString('hex'), '419f0a840e32331d')
})

test('radar is 0x08, pages is 0x13, chart stays 0x1a', () => {
  const radar = n2k.buttonPgn('1d', 'press', 'radar')
  const pages = n2k.buttonPgn('1d', 'press', 'pages')
  const chart = n2k.buttonPgn('1d', 'press', 'chart')
  assert.equal(radar.Key, 8)
  assert.equal(pages.Key, 19)
  assert.equal(chart.Key, 26)
  assert.equal(n2k.toPgn(radar).toString('hex'), '419f1d840e32b308')
  assert.equal(n2k.toPgn(pages).toString('hex'), '419f1d840e32b313')
  assert.equal(n2k.toPgn(chart).toString('hex'), '419f1d840e32b31a')
})
