const util = require("util")
// const url = require('url');

var path = require('path');
var plugin = {}
var n2kCallback

var buttonPressed = false;
var lastButton = "";
var repeatCounter = 0;
var buttonTimeoutId;

var mfdAddress = "";
var sourceAddress = "30";  // Gets overwritten by candevice

// Intervals
var buttonChartID;

const zc_key_code = {
//knob right
// can0 0CFF3400 [8] 41 9F FE 85 00 00 FF 08
//know left
// can0 0CFF3400 [8] 41 9F FE 85 00 00 01 08
    'mob':      '1d',
    'zoomin':   '57',
    'zoomout':  '56',
    'press':    'b3',
    'release':  '33',
    'display':  '07',
    'stbyauto': '04',
    'power':    '14',
    'plot':     '1b',
    'goto':     '0a',
    'chart':    '1a',
    'radar':    '1a',
    'echo':     '15',
    'nav':      '17',
    'info':     '1c',
    'pages':    '13',
    'knobpush': '58',
    'up':       '52',
    'down':     '51',
    'left':     '50',
    'right':    '4f',
    'menu':     '10',
    'win':      '06',
    '1':        '1e',
    '2':        '1f',
    '3':        '20',
    '4':        '21',
    '5':        '22',
    '6':        '23',
    '7':        '24',
    '8':        '25',
    '9':        '26',
    '0':        '27'
}

const buttonPGN = '%s,3,65332,%s,255,8,41,9f,%s,84,0e,32,%s,%s';

var buttonAction = {
  "pressed" : "33",
  "released": "b3"
}

function buf2hex(buffer) { // buffer is an ArrayBuffer
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2));
}

module.exports = function(app, options) {
  "use strict"
  var plugin = {}
  plugin.id = "signalk-bandg-zc-plugin"
  plugin.name = "B&G ZC remote control"
  plugin.description = "Signal K B&G ZC1 remote control server plugin"

  function sendN2k(msgs) {
    app.debug("n2k_msg: " + msgs)
    msgs.map(function(msg) { app.emit('nmea2000out', msg)})
  }

  function announceZC () {
    var msgs = [
      "%s,3,130845,%s,255,0e,41,9f,fe,ff,ff,ff,2f,4a,00,00,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff",
      "%s,3,130845,%s,255,0e,41,9f,01,ff,ff,ff,2f,4a,00,00,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff",
      "%s,3,130845,%s,255,0e,41,9f,01,ff,ff,ff,2f,12,00,00,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff",
      "%s,3,130845,%s,255,0e,41,9f,01,ff,ff,ff,2f,25,00,00,ff,ff,ff,ff,ff,ff,ff,ff,ff,ff" ]
    msgs.forEach(value => {
      var msg = util.format(value, (new Date()).toISOString(), sourceAddress)
      sendN2k([msg])
    });
  }

  function sendButton (button, action) {
    var msg = util.format(buttonPGN, (new Date()).toISOString(), sourceAddress, mfdAddress, buttonAction[action], zc_key_code[button])
    if (action == 'pressed') {
      buttonTimeoutId = setTimeout(sendButton, 100, button, action);
      repeatCounter++;
    } else {
      if (action == 'released' || repeatCounter > 20) {
        clearTimeout(buttonTimeoutId);
        repeatCounter = 0;
      }
    }
    sendN2k([msg])
  }

  plugin.schema = function() {
    return {};
  }

  plugin.start = function(options, restartPlugin) {
    app.debug('Starting plugin')

    announceZC();

    plugin.registerWithRouter = function(router) {
	    // Will appear here; plugins/signalk-bandg-zc-plugin/
	    app.debug("registerWithRouter")
	    router.get("/key/:button/:action", (req, res) => {
	      res.contentType("application/json")
	      res.send(JSON.stringify(req.params))
        var button = req.params.button;
        var action = req.params.action;
        app.debug('button: %s  action: %s', button, action);
        if (action == 'click') {
          sendButton(button, 'pressed');
          sendButton(button, 'released');
        } else {
          sendButton(button, action);
        }
	    })
	  }

    n2kCallback = (msg) => {
      try {
        let fields = msg['fields']
        if (msg.pgn == "65280" && mfdAddress == "") {
          app.debug('[65280]: %s', JSON.stringify(msg));
          app.debug('Maybe MFD on ID: %d', msg.src);
          mfdAddress = (msg.src).toString(16).padStart(2, '0');
          if (buf2hex(msg.data).join(',') == '13,99,04,05,00,00,02,00') {
            app.debug('Found REAL MFD on ID: %d', msg.src);
          }
        }
      } catch (e) {
        console.error(e)
      }
    }
    app.on("N2KAnalyzerOut", n2kCallback)

  }

  plugin.stop = function() {
    app.debug("Stopping")
    // clearInterval(buttonChartID)
    app.debug("Stopped")
  }

  return plugin;
};
module.exports.app = "app"
module.exports.options = "options"

