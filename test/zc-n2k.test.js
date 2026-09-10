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
  assert.equal(typeof pgn, 'object')
  assert.equal(Array.isArray(pgn), false)
}

test('button PGN is JSON 65332 with canboat Function/Key Event names', () => {
  const pgn = n2k.buttonPgn('1d', 'press', '1')
  assertJsonPgn(pgn, 65332)
  assert.equal(pgn.Address, 0x1d)
  assert.equal(pgn.Function, 'Key')
  assert.equal(pgn.Parameter, n2k.BUTTON_PARAMETER)
  assert.equal(pgn['Key Event'], n2k.KEY_EVENT.press)
  assert.equal(pgn.Key, '1')
})

test('missing MFD address becomes 0xff', () => {
  assert.equal(n2k.buttonPgn('', 'release', 'mob').Address, 0xff)
})

test('knob PGN uses Function Knob, Ticks, and address 0xfe', () => {
  const left = n2k.knobPgn('knobleft')
  assertJsonPgn(left, 65332)
  assert.equal(left.Address, 0xfe)
  assert.equal(left.Function, 'Knob')
  assert.equal(left.Parameter, 0)
  assert.equal(left.Ticks, 1)
  assert.equal(left.Unknown, n2k.KNOB_UNKNOWN)
  assert.equal(n2k.knobPgn('knobright').Ticks, -1)
})

test('short press emits press then release JSON', () => {
  const pgns = n2k.pgnsForAction('1', 'released', '0a', 1000, 1100)
  assert.equal(pgns.length, 2)
  assert.equal(pgns[0]['Key Event'], n2k.KEY_EVENT.press)
  assert.equal(pgns[1]['Key Event'], n2k.KEY_EVENT.release)
  assert.equal(typeof pgns[0], 'object')
})

test('long press MOB emits longpress twice', () => {
  const pgns = n2k.pgnsForAction('mob', 'released', '0a', 0, 1500)
  assert.equal(pgns.length, 2)
  assert.equal(pgns[0]['Key Event'], n2k.KEY_EVENT.longpress)
  assert.equal(pgns[0].Key, 'MOB')
})

test('plot short press uses longpress event', () => {
  const pgns = n2k.pgnsForAction('plot', 'released', '0a', 1000, 1100)
  assert.equal(pgns[0]['Key Event'], n2k.KEY_EVENT.longpress)
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

test('custom PGN 65332 is two Simnet ZC variants', () => {
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

function loadCanboatjs() {
  try {
    return require('/usr/lib/node_modules/signalk-server/node_modules/@canboat/canboatjs')
  } catch (e) {
    return null
  }
}

test('canboatjs encodes Simnet key/knob frames from lookup names', { skip: !loadCanboatjs() }, () => {
  const canboatjs = loadCanboatjs()
  const { addCustomPgn } = require('/usr/lib/node_modules/signalk-server/node_modules/@canboat/canboatjs/lib/pgns')
  n2k.CUSTOM_PGNS.forEach(function (def) {
    addCustomPgn(def)
  })
  const keyBuf = canboatjs.toPgn(n2k.buttonPgn('1d', 'press', '1'))
  assert.ok(keyBuf, 'toPgn returned a buffer for key')
  assert.equal(keyBuf.toString('hex'), '419f1d840e32b31e')
  const knobBuf = canboatjs.toPgn(n2k.knobPgn('knobleft'))
  assert.ok(knobBuf, 'toPgn returned a buffer for knob')
  assert.equal(knobBuf.toString('hex'), '419ffe8500000108')
  const knobRight = canboatjs.toPgn(n2k.knobPgn('knobright'))
  assert.equal(knobRight.toString('hex'), '419ffe850000ff08')
})
