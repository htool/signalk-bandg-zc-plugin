(function (root) {
  var OLD_WIDTH = 875
  var OLD_HEIGHT = 535
  var PANEL_WIDTH = 1807
  var PANEL_HEIGHT = 1103
  var PRESS_OFFSET_PX = 3
  var LED_BBOX = { left: 213, top: 187, right: 269, bottom: 212 }

  var KEYS = [
    { id: 'mob', shape: 'rect', coords: [184, 175, 79, 130] },
    { id: 'display', shape: 'rect', coords: [197, 132, 298, 176] },
    { id: 'zoomin', shape: 'rect', coords: [431, 175, 329, 130] },
    { id: 'zoomout', shape: 'rect', coords: [443, 129, 544, 173] },
    { id: 'check', shape: 'poly', coords: [576, 225, 674, 225, 677, 248, 639, 257, 625, 271, 606, 292, 577, 269] },
    { id: 'cancel', shape: 'poly', coords: [690, 225, 789, 224, 790, 265, 758, 288, 725, 261, 691, 248] },
    { id: 'plot', shape: 'rect', coords: [330, 193, 431, 237] },
    { id: 'goto', shape: 'rect', coords: [445, 193, 545, 237] },
    { id: '1', shape: 'rect', coords: [82, 219, 146, 263] },
    { id: '2', shape: 'rect', coords: [160, 219, 220, 260] },
    { id: '3', shape: 'rect', coords: [234, 219, 296, 263] },
    { id: '4', shape: 'rect', coords: [81, 280, 147, 324] },
    { id: '5', shape: 'rect', coords: [158, 282, 223, 325] },
    { id: '6', shape: 'rect', coords: [236, 282, 298, 323] },
    { id: '7', shape: 'rect', coords: [82, 344, 146, 388] },
    { id: '8', shape: 'rect', coords: [158, 343, 224, 388] },
    { id: '9', shape: 'rect', coords: [235, 343, 298, 387] },
    { id: '0', shape: 'rect', coords: [158, 406, 222, 449] },
    { id: 'stbyauto', shape: 'rect', coords: [84, 407, 145, 449] },
    { id: 'power', shape: 'rect', coords: [235, 406, 299, 450] },
    { id: 'radar', shape: 'rect', coords: [444, 279, 542, 324] },
    { id: 'echo', shape: 'rect', coords: [330, 343, 430, 386] },
    { id: 'chart', shape: 'rect', coords: [330, 282, 429, 324] },
    { id: 'nav', shape: 'rect', coords: [442, 343, 542, 387] },
    { id: 'info', shape: 'rect', coords: [330, 407, 432, 449] },
    { id: 'pages', shape: 'rect', coords: [442, 405, 544, 449] },
    { id: 'menu', shape: 'poly', coords: [577, 405, 610, 386, 636, 410, 677, 429, 674, 449, 576, 451] },
    { id: 'win', shape: 'poly', coords: [692, 426, 732, 413, 757, 385, 790, 412, 789, 449, 691, 451] },
    { id: 'up', shape: 'rect', coords: [654, 266, 717, 310] },
    { id: 'down', shape: 'rect', coords: [656, 368, 714, 411] },
    { id: 'left', shape: 'rect', coords: [610, 313, 654, 363] },
    { id: 'right', shape: 'rect', coords: [718, 310, 760, 364] },
    { id: 'knobpush', shape: 'circle', coords: [692, 121, 43] },
    { id: 'knobleft', shape: 'poly', coords: [684, 46, 650, 57, 621, 82, 612, 116, 612, 141, 619, 168, 639, 188, 659, 206, 669, 177, 642, 158, 632, 126, 636, 100, 658, 72, 686, 64] },
    { id: 'knobright', shape: 'poly', coords: [692, 46, 725, 54, 757, 73, 765, 105, 767, 138, 759, 165, 736, 190, 719, 203, 698, 210, 698, 184, 725, 173, 746, 150, 751, 123, 743, 98, 723, 77, 691, 64] }
  ]

  function scaleX(n) {
    return n * PANEL_WIDTH / OLD_WIDTH
  }

  function scaleY(n) {
    return n * PANEL_HEIGHT / OLD_HEIGHT
  }

  function boundingBox(shape, coords) {
    var i, x, y, r, minX, minY, maxX, maxY
    if (shape === 'circle') {
      x = coords[0]
      y = coords[1]
      r = coords[2]
      return { x: x - r, y: y - r, w: r * 2, h: r * 2 }
    }
    minX = coords[0]
    maxX = coords[0]
    minY = coords[1]
    maxY = coords[1]
    for (i = 0; i < coords.length; i += 2) {
      x = coords[i]
      y = coords[i + 1]
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
  }

  function scaleBox(box) {
    return {
      x: scaleX(box.x),
      y: scaleY(box.y),
      w: scaleX(box.w),
      h: scaleY(box.h)
    }
  }

  function keyBox(key) {
    return scaleBox(boundingBox(key.shape, key.coords))
  }

  function ledBox() {
    return {
      x: LED_BBOX.left,
      y: LED_BBOX.top,
      w: LED_BBOX.right - LED_BBOX.left,
      h: LED_BBOX.bottom - LED_BBOX.top
    }
  }

  function pct(n, den) {
    return (n / den * 100) + '%'
  }

  function wellStyle(box) {
    return {
      left: pct(box.x, PANEL_WIDTH),
      top: pct(box.y, PANEL_HEIGHT),
      width: pct(box.w, PANEL_WIDTH),
      height: pct(box.h, PANEL_HEIGHT)
    }
  }

  function faceStyle(box) {
    return {
      width: pct(PANEL_WIDTH, box.w),
      height: pct(PANEL_HEIGHT, box.h),
      left: pct(-box.x, box.w),
      top: pct(-box.y, box.h)
    }
  }

  function pressTransform() {
    return 'translate(' + PRESS_OFFSET_PX + 'px,' + PRESS_OFFSET_PX + 'px)'
  }

  function ledColorFromStatus(status) {
    if (status && status.mfdFound) {
      return 'green'
    }
    return 'red'
  }

  function statusUrl() {
    return '/plugins/signalk-bandg-zc-plugin/status'
  }

  function keyUrl(button, action) {
    return '/plugins/signalk-bandg-zc-plugin/key/' + button + '/' + action
  }

  function applyStyle(el, style) {
    var k
    for (k in style) {
      if (style.hasOwnProperty(k)) {
        el.style[k] = style[k]
      }
    }
  }

  function bindPress(well, button, send) {
    var down = false
    function faceEl() {
      return well.querySelector ? well.querySelector('.zc-face') : well.firstChild
    }
    function press(ev) {
      if (ev && ev.preventDefault) {
        ev.preventDefault()
      }
      down = true
      well.className = 'zc-well is-pressed'
      if (faceEl()) {
        faceEl().style.transform = pressTransform()
      }
      send(button, 'pressed')
    }
    function release(ev) {
      if (!down) {
        return
      }
      if (ev && ev.preventDefault) {
        ev.preventDefault()
      }
      down = false
      well.className = 'zc-well'
      if (faceEl()) {
        faceEl().style.transform = ''
      }
      send(button, 'released')
    }
    well.onmousedown = press
    well.onmouseup = release
    well.onmouseleave = release
    well.ontouchstart = press
    well.ontouchend = release
    well.ontouchcancel = release
  }

  function mount(panel, opts) {
    var imageSrc = (opts && opts.imageSrc) || 'control-panel.jpg'
    var send = (opts && opts.send) || function () {}
    var i, key, box, well, face, led, faceplate

    faceplate = panel.querySelector('.zc-faceplate')
    if (faceplate) {
      faceplate.src = imageSrc
    }

    for (i = 0; i < KEYS.length; i++) {
      key = KEYS[i]
      box = keyBox(key)
      well = document.createElement('div')
      well.className = 'zc-well'
      well.setAttribute('data-key', key.id)
      applyStyle(well, wellStyle(box))
      face = document.createElement('img')
      face.className = 'zc-face'
      face.src = imageSrc
      face.alt = ''
      applyStyle(face, faceStyle(box))
      well.appendChild(face)
      bindPress(well, key.id, send)
      panel.appendChild(well)
    }

    led = document.createElement('div')
    led.id = 'zc-led'
    led.className = 'zc-led'
    applyStyle(led, wellStyle(ledBox()))
    led.style.background = ledColorFromStatus({ mfdFound: false })
    panel.appendChild(led)
    return led
  }

  var api = {
    OLD_WIDTH: OLD_WIDTH,
    OLD_HEIGHT: OLD_HEIGHT,
    PANEL_WIDTH: PANEL_WIDTH,
    PANEL_HEIGHT: PANEL_HEIGHT,
    PRESS_OFFSET_PX: PRESS_OFFSET_PX,
    LED_BBOX: LED_BBOX,
    KEYS: KEYS,
    scaleX: scaleX,
    scaleY: scaleY,
    boundingBox: boundingBox,
    scaleBox: scaleBox,
    keyBox: keyBox,
    ledBox: ledBox,
    wellStyle: wellStyle,
    faceStyle: faceStyle,
    pressTransform: pressTransform,
    ledColorFromStatus: ledColorFromStatus,
    statusUrl: statusUrl,
    keyUrl: keyUrl,
    mount: mount
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api
  } else {
    root.ZcUi = api
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this))
