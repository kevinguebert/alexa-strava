var express    = require("express");
var alexa      = require("alexa-app");
var http       = require('http');
var dotenv     = require('dotenv');
var bodyParser = require("body-parser");
var moment     = require('moment');
var convert    = require('convert-units')
var strava     = require('strava-v3');

var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: '.env'});


var alexaApp = new alexa.app("strava");
alexaApp.launch(function(request, response) {
    response.say("Hello Kevin, welcome back to Strava. Would you like to hear about your latest activity or see how you are doing on your goals?");
    response.shouldEndSession(false);
});

alexaApp.intent("GetLastestActivity", function(request, response) {
    strava.athlete.listActivities({
        page: 1,
        per_page: 1
    }, function(err, activities) {
        if (err) {
          response.say("A problem with the request has occured. We apologize for the problem. Please try again later.")
        }

        if (activities.length === 0) {
            var output = "I'm sorry, I was unable to find any activities for this athlete. Today's a good day to create one! Get out there and record your first activity!";
            response.say(output);
        } else {
        }
    });
    return false;
});
alexaApp.express(app, "/echo/");

app.listen(process.env.port || 5000);
