function getLastestActivity() {
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
        output += " Date: " + dateFormat(new Date(activity.start_date_local).toString(), "dddd, mmmm dS, yyyy") + ".";

        //Activity Type (Run or Bike or Swim))
        if(activity.type) output += " Type: " + activity.type + ".";

        //Average HeartRate
        if(activity.average_heartrate) output += " Average Heartrate: " + activity.average_heartrate + " beats per minute.";

        //Average Pace - convert from meters per second to pace
        if(activity.average_speed) output += " Average pace: " + timeToHuman(convert(truncate((1609.344 / activity.average_speed), 3)).from('s').to('ms')) + " per mile.";

        // Activity Distance - convert from meters to miles
        if(activity.distance) output += " Distance: " + truncate(convert(activity.distance).from("m").to("mi"), 3) + " miles.";

        // Activity Time - convert from seconds to human hours, minutes, seconds
        if(activity.elapsed_time) output += " Total time: " + timeToHuman(convert(activity.elapsed_time).from("s").to("ms")) + ".";

        //TODO: Random congratulations
        output += " Nice job!";

        return output;
      }
  });
}
