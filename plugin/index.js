const n2k = require('../lib/zc-n2k')

var n2kCallback

var mfdAddress = ""
var lastPressTime = 0

function buf2hex(buffer) {
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2));
}

module.exports = function(app, options) {
  "use strict"
  var plugin = {}
  plugin.id = "signalk-bandg-zc-plugin"
  plugin.name = "B&G ZC remote control"
  plugin.description = "Signal K B&G ZC1 remote control server plugin"

  function sendPgns(pgns) {
    app.debug("nmea2000JsonOut: " + JSON.stringify(pgns))
    pgns.forEach(function(pgn) {
      app.emit('nmea2000JsonOut', pgn)
    })
  }

  function sendButton(button, action) {
    app.debug('button: %s, action: %s', button, action)
    var now = Date.now()
    sendPgns(n2k.pgnsForAction(button, action, mfdAddress, lastPressTime, now))
    lastPressTime = now
  }

  plugin.schema = function() {
    return {};
  }

  plugin.start = function(options, restartPlugin) {
    app.debug('Starting plugin')

    if (app.emitPropertyValue) {
      app.emitPropertyValue('canboat-custom-pgns', { PGNs: n2k.CUSTOM_PGNS })
    }

    sendPgns(n2k.announcePgns())

    plugin.registerWithRouter = function(router) {
	    app.debug("registerWithRouter")
	    router.get("/status", function(req, res) {
	      res.contentType("application/json")
	      res.send(JSON.stringify({
	        mfdFound: mfdAddress !== "",
	        mfdAddress: mfdAddress
	      }))
	    })
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
