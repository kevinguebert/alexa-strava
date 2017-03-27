var express    = require("express");
var alexa      = require("alexa-app");
var http       = require('http');
var dotenv     = require('dotenv');
var bodyParser = require("body-parser");
var moment     = require('moment');
var convert    = require('convert-units')
var strava     = require('strava-v3');
var env        = require('node-env-file');

var app = express();
var PORT = process.env.port || 5000;

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({path: '.env'});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.set("view engine", "ejs");

var alexaApp = new alexa.app("strava");
alexaApp.launch(function(request, response) {
    response.say("Hello Kevin, welcome back to Strava. Would you like to hear about your latest activity or see how you are doing on your goals?");
    response.shouldEndSession(false);
});

alexaApp.intent("GetLastestActivity", function(request, response) {
    //Send request to strava
    strava.athlete.listActivities({
        id: 9503898,
        page: 1,
        per_page: 1
    }, function(err, activities) {
        var output = "";
        if (activities.length === 0) {
            //No activities, have an error
            // TODO: better error
            output = "No activities found.";
            response.say(output);
        } else {
            var activity = activities[0];
            /* Response:
            { id: 894557721,
            resource_state: 2,
            external_id: 'garmin_push_1612875533',
            upload_id: 993065686,
            athlete: { id: 9503898, resource_state: 1 },
            name: 'Treadmills are tough',
            distance: 5129.4,
            moving_time: 2413,
            elapsed_time: 2413,
            total_elevation_gain: 0,
            type: 'Run',
            start_date: '2017-03-10T13:15:17Z',
            start_date_local: '2017-03-10T08:15:17Z',
            timezone: '(GMT-05:00) America/New_York',
            utc_offset: -18000,
            start_latlng: null,
            end_latlng: null,
            location_city: null,
            location_state: null,
            location_country: 'United States',
            start_latitude: null,
            start_longitude: null,
            achievement_count: 0,
            kudos_count: 11,
            comment_count: 1,
            athlete_count: 1,
            photo_count: 0,
            map: { id: 'a894557721', summary_polyline: null, resource_state: 2 },
            trainer: true,
            commute: false,
            manual: false,
            private: false,
            flagged: false,
            gear_id: 'g1825577',
            average_speed: 2.126,
            max_speed: 2.9,
            average_cadence: 78.8,
            has_heartrate: true,
            average_heartrate: 155,
            max_heartrate: 186,
            pr_count: 0,
            total_photo_count: 0,
            has_kudoed: false,
            workout_type: 0,
            suffer_score: 66 }
                */

            //Get most recent activity
            var activity = activities[0];

            // Activity name
            output = "Name: " + activity.name+ ".";

            //Last activity date
            var aDate = new Date(activity.start_date_local).toString();
                aDate = dateFormat(aDate, "dddd, mmmm dS, yyyy");
            output += " Date: " + aDate + ". ";


            if(activity.type) output += " Type: " + activity.type + ".";

            if(activity.average_heartrate) output += " Average Heartrate: " + activity.average_heartrate + " beats per minute.";

            if(activity.average_speed) output += " Average pace: " + timeToHuman(convert(truncate((1609.344 / activity.average_speed), 3)).from('s').to('ms')) + " per mile.";

            // if(activity.max_speed !== null) {
            //   output += " Fastest pace: " + timeToHuman(convert(truncate((1609.344 / activity.max_speed), 3)).from('s').to('ms')) + " per mile.";
            // }

            // console.log(activity.average_speed * (2.2369));
            //
            // if(activity.average_cadence !== null) {
            //   output += " Average Cadence: " + activity.average_cadence + " steps per minute.";
            // }

            // Activity Distance (in meters)
            if(activity.distance) output += " Distance: " + truncate(convert(activity.distance).from("m").to("mi"), 3) + " miles.";

            // Activity Time (elapsed, in seconds)
            if(activity.elapsed_time) output += " Total time: " + timeToHuman(convert(activity.elapsed_time.from("s").to("ms"))) + ".";

            output += " Nice job!";


            response.say(output);
            return response.send();
        }
    });
    return false;
});

alexaApp.intent("GetGoalStatus", function(request, response) {
    // Retrieve weather information from coordinates (Sydney, Australia)
});

alexaApp.express(app, "/echo/");
app.listen(PORT);
console.log("Listening on port " + PORT);

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};

function truncate (num, places) {
  return Math.trunc(num * Math.pow(10, places)) / Math.pow(10, places);
}

function timeToHuman (milliseconds) {
  var elapsed = "";
  milliseconds = new Date(milliseconds);
  var days = milliseconds.getUTCDate()-1;
  var hours = milliseconds.getUTCHours();
  var minutes = milliseconds.getUTCMinutes();
  var seconds = milliseconds.getUTCSeconds();
  if(days > 0) {
    elapsed += milliseconds.getUTCDate()-1 + " days, ";
  }

  if(hours > 0) {
    elapsed += milliseconds.getUTCHours() + " hours, ";
  }

  if(minutes > 0) {
    elapsed += milliseconds.getUTCMinutes() + " minutes, ";
  }
  elapsed += milliseconds.getUTCSeconds() + " seconds";
  return elapsed;
}
