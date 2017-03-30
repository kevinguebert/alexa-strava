var express    = require("express");
var alexa      = require("alexa-app");
var dotenv     = require('dotenv');
var convert    = require('convert-units')
var strava     = require('strava-v3');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: '.env'});

var app = express();
app.set("view engine", "ejs");

var alexaApp = new alexa.app("strava");
alexaApp.express({ expressApp: app });


alexaApp.launch(function(request, response) {
    response.say("Hello, welcome to Strava.");
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
          //TODO
        }
    });
});

app.listen(5000);
console.log('Started on port 5000');
