const util = require("util")
// const url = require('url');

var path = require('path');
var plugin = {}
var n2kCallback

var mfdAddress = "";
var sourceAddress = "30";  // Gets overwritten by candevice

var lastPressTime;

const zc_key_code = {
    'press':    'b3',
    'release':  '33',
    'longpress':'80',
    'mob':      '1d',
    'zoomin':   '57',
    'zoomout':  '56',
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
    'check':    '28',
    'cancel':   '29',
    '1':        '1e',
    '2':        '1f',
    '3':        '20',
    '4':        '21',
    '5':        '22',
    '6':        '23',
    '7':        '24',
    '8':        '25',
    '9':        '26',
    '0':        '27',
    'knobleft': '01',
    'knobright':'ff'
}

const knobPGN   = '%s,3,65332,%s,255,8,41,9f,fe,85,00,00,%s,08';
const buttonPGN = '%s,3,65332,%s,255,8,41,9f,%s,84,0e,32,%s,%s';

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
    app.debug('button: %s, action: %s', button, action);
    var msg;
    if (button == 'knobleft' || button == 'knobright') {
      if (action == 'released') {
        msg = util.format(knobPGN, (new Date()).toISOString(), sourceAddress, zc_key_code[button])
        sendN2k([msg,msg])
      }
    } else {
      if (action == 'released' || action == 'longpress') {
        if (Date.now() - lastPressTime > 1000 || action == 'longpress') {
          // long press
          if (button == 'mob' || button == 'goto' || button == 'power') {
            msg = util.format(buttonPGN, (new Date()).toISOString(), sourceAddress, mfdAddress, zc_key_code['longpress'], zc_key_code[button])
            sendN2k([msg,msg])
          }
          if (button == 'plot') {
            // Bit different, vessel needs press/release
            msg = util.format(buttonPGN, (new Date()).toISOString(), sourceAddress, mfdAddress, zc_key_code['press'], zc_key_code[button])
            sendN2k([msg])
            msg = util.format(buttonPGN, (new Date()).toISOString(), sourceAddress, mfdAddress, zc_key_code['release'], zc_key_code[button])
            sendN2k([msg])
          }
        } else {
          // short press
          if (button == 'plot') {
            // plot requires long press action
            msg = util.format(buttonPGN, (new Date()).toISOString(), sourceAddress, mfdAddress, zc_key_code['longpress'], zc_key_code[button])
            sendN2k([msg,msg])
          } else {
            // normal short press
            msg = util.format(buttonPGN, (new Date()).toISOString(), sourceAddress, mfdAddress, zc_key_code['press'], zc_key_code[button])
            sendN2k([msg])
            msg = util.format(buttonPGN, (new Date()).toISOString(), sourceAddress, mfdAddress, zc_key_code['release'], zc_key_code[button])
            sendN2k([msg])
          }
        }
      }
    }
    lastPressTime = Date.now();
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
    app.debug("Stopped")
  }

  return plugin;
};
module.exports.app = "app"
module.exports.options = "options"

