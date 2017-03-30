var express    = require("express");
var alexa      = require("alexa-app");
var dotenv     = require('dotenv');
var convert    = require('convert-units')

var app = express();
app.set("view engine", "ejs");

var alexaApp = new alexa.app("strava");
alexaApp.express({ expressApp: app });


alexaApp.launch(function(request, response) {
    response.say("Hello, welcome to Strava.");
    response.shouldEndSession(false);
});

app.listen(5000);
console.log('Started on port 5000');
