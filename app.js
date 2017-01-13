var express    = require("express");
var alexa      = require("alexa-app");
var bodyParser = require("body-parser");
var moment     = require('moment');
var Forecast   = require('forecast');
var env        = require('node-env-file');

var app = express();
var PORT = process.env.port || 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");

// Initialize
var forecast = new Forecast({
  service: 'darksky',
  key: process.env.DARKSKY,
  units: 'fahrenheit',
  cache: true,      // Cache API requests
  ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/
    minutes: 27,
    seconds: 45
  }
});

var alexaApp = new alexa.app("jenkins");
alexaApp.launch(function(request, response) {
  response.say("Welcome to your sailing weather center");
});

alexaApp.intent("GetWeatherInSydney", function(request, response) {
    // Retrieve weather information from coordinates (Sydney, Australia)
    forecast.get([-33.8683, 151.2086], function(err, weather) {
      if(err) return console.dir(err);
      console.dir(weather);
    });
});

alexaApp.express(app, "/echo/");
app.listen(PORT);
console.log("Listening on port " + PORT);
