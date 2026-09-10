'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const ui = require('../public/zc-ui.js')

function keyById(id) {
  const found = ui.KEYS.filter(function (k) {
    return k.id === id
  })[0]
  assert.ok(found, 'missing key ' + id)
  return found
}

test('panel and old map sizes match the zip / zc.jpg facts', () => {
  assert.equal(ui.PANEL_WIDTH, 1807)
  assert.equal(ui.PANEL_HEIGHT, 1103)
  assert.equal(ui.OLD_WIDTH, 875)
  assert.equal(ui.OLD_HEIGHT, 535)
})

test('press offset is 3 CSS pixels', () => {
  assert.equal(ui.PRESS_OFFSET_PX, 3)
  assert.equal(ui.pressTransform(), 'translate(3px,3px)')
})

test('old image-map rect for key 1 scales onto the panel', () => {
  const box = ui.keyBox(keyById('1'))
  assert.equal(Math.round(box.x), 169)
  assert.equal(Math.round(box.y), 452)
  assert.equal(Math.round(box.w), 132)
  assert.equal(Math.round(box.h), 91)
})

test('scale factors are panel / old map', () => {
  assert.ok(Math.abs(ui.scaleX(1) - 1807 / 875) < 1e-12)
  assert.ok(Math.abs(ui.scaleY(1) - 1103 / 535) < 1e-12)
})

test('key list includes keypad, d-pad, knobs', () => {
  const ids = ui.KEYS.map(function (k) {
    return k.id
  })
  assert.equal(ui.KEYS.length, 35)
  assert.ok(ids.indexOf('knobleft') !== -1)
  assert.ok(ids.indexOf('knobright') !== -1)
  assert.ok(ids.indexOf('knobpush') !== -1)
  assert.ok(ids.indexOf('mob') !== -1)
  assert.ok(ids.indexOf('1') !== -1)
})

test('well and face CSS windows into the panel image', () => {
  const box = { x: 169.34, y: 451.51, w: 132.17, h: 90.71 }
  const well = ui.wellStyle(box)
  const face = ui.faceStyle(box)
  assert.equal(well.left, (box.x / 1807) * 100 + '%')
  assert.equal(well.top, (box.y / 1103) * 100 + '%')
  assert.equal(well.width, (box.w / 1807) * 100 + '%')
  assert.equal(well.height, (box.h / 1103) * 100 + '%')
  assert.equal(face.width, (1807 / box.w) * 100 + '%')
  assert.equal(face.height, (1103 / box.h) * 100 + '%')
  assert.equal(face.left, (-box.x / box.w) * 100 + '%')
  assert.equal(face.top, (-box.y / box.h) * 100 + '%')
})

test('LED box is panel pixels 213,187 – 269,212', () => {
  const box = ui.ledBox()
  assert.equal(ui.LED_BBOX.left, 213)
  assert.equal(ui.LED_BBOX.top, 187)
  assert.equal(ui.LED_BBOX.right, 269)
  assert.equal(ui.LED_BBOX.bottom, 212)
  assert.equal(box.x, 213)
  assert.equal(box.y, 187)
  assert.equal(box.w, 56)
  assert.equal(box.h, 25)
})

test('LED starts red, green when mfdFound', () => {
  assert.equal(ui.ledColorFromStatus(undefined), 'red')
  assert.equal(ui.ledColorFromStatus({}), 'red')
  assert.equal(ui.ledColorFromStatus({ mfdFound: false, mfdAddress: '' }), 'red')
  assert.equal(ui.ledColorFromStatus({ mfdFound: true, mfdAddress: '1d' }), 'green')
})

test('status and key URLs', () => {
  assert.equal(ui.statusUrl(), '/plugins/signalk-bandg-zc-plugin/status')
  assert.equal(ui.keyUrl('1', 'pressed'), '/plugins/signalk-bandg-zc-plugin/key/1/pressed')
})
