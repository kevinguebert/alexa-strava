# Build a Strava Alexa App - Part 1

Hello and Welcome! In this tutorial series we are going to walk through the steps of creating a new Alexa App using [Strava](https://www.strava.com). Let's first get some basic terminology down, introduce you to what we are going to build, and then we will dive right into building!

### Outline

1. Introduction to Strava
  - What is Strava
2. Strava + Alexa
  - What are we building
3. Prerequisites
4. Setup
  - Lcoal Setup
  - Amazon Alexa Configuration
6. Access to Strava
7. Defining Intents & Actions
7. Sending Requests
9. Returning Responses
10. Wrap up


### Strava

##### What is Strava?

> If you're active, Strava was made for you. Our mobile app and website enhance the experience of sport and connect millions of athletes from around the world. We're the social network for those whoe strive. Join us.

Strava is the running/biking/swimming app that I use on a daily basis to record my activities. Through a wide range of features including activity tracking, live tracking, detailed activity data, maps, and connecting you with friends and others, Strava is "the ultimate athlete resource" for staying in shape and helping you get through your next challenge. If you've never used it before, I would highly recommend trying it out. You can find out more information here: [https://www.strava.com/](https://www.strava.com/).

> You don't have to run or ride to love our features. Strava works with many of your other favorite sports, like skiing, kiteboarding, crossfit, kayaking, inline skating, rock climbing, surfing, yoga and more. Give it a shot, you'll dig it.

INSERT STRAVA LOGO

### Strava + Alexa

##### What are we building?

In this tutorial series we are going to walk through all the steps in creating and (hopefully) publishing an Alexa app that utilizes the API provided by Strava. You may be thinking "wait, isn't Strava for during an activity like tracking a run?" Yes and no. Yes, it is definitely **the best** resource for tracking during an activity, but we are not going to use those features. A great part of Strava is the data analytics and social features that come with it. From pace to heart race to distance to KOM/QOM (King/Queen of the Mountain) to Course Record (CR) to Personal Records (PR) to competing against your friends and joining clubs, Strava helps you stay motivated and engaged even when you are not out doing an activity.

Here is the tutorial series outline for us:

1. Setup & Activity Retrieval with Alexa
2. Intents and Actions - Adding more features
3. Account linking with Alexa & Strava
4. App Submission

### Prerequisites

First off, welcome! With this tutorial I hope to walk you through all the steps of creating an Alexa app. However, I am assuming some background in programming and some familiarity with Javascript (our language of choice). If you know python, maybe in the future we can create a similar series, but for now we are sticking with Javascript.

If you've never built an Alexa app before or are wondering where to get started, check out the [Amazon Developer Portal](https://developer.amazon.com/alexa) for a suite of resources to get you started. If you would like to follow a base tutorial for beginners, check out my other tutorial [Build Your First Alexa App](http://www.kevinguebert.com/build-your-first-alexa-app/). Please note though, that tutorial is using Python but is still a good introduction.

INSERT IMAGE OF OTHER TUTORIAL

Other things of note:

- I am using a Mac and will be working in the terminal a fair bit. The commands are not too intensive, but if you are on a Windows machine I have not tested this there.
- My editor is [Atom](https://atom.io/)
- At the end of every section the whole file will be posted. I would **strongly** recommend not copying and pasting. Spend the time, learn what each line does and understand it.
- There will also be a Github repo with all files (except the keys of course)

Well I think that's everything on the list, let's get started!

### Setup

#### Local Setup

1. Step one in every tutorial, let's open up the terminal, create a new folder, and move into it..

  `mkdir Desktop/alexa-strava && cd Desktop/alexa-strava`

2. Init a new project and fill in the required responses. If you hit "enter" through them, it does the default value (i.e. uses index.js for the entry point) which is what we want.

  `npm init`

  INSERT STEP 2 PICTURE

3. With our project created, let's install the dependencies we need for this project.

  **Things to note**: Amazon provides an awesome Node.js SDK called the [Alexa Skills Kit SDK for Node.js](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs). However, I have found that I cannot iterate as quickly with that as it required uploading a zip file to the Amazon Console everytime I make a change and want to test. Because of that, in this tutorial we are going to use [Alexa-App](https://github.com/alexa-js/alexa-app) - a framework for Alexa using Node.js that is not associated with Amazon but does all the same features. It utilizes a webserver (express) to run the app. In the future, we can work on using Amazon's provided resources, but for now, we will stick with Alexa-App

  Node packages we will be using:

  INSERT NPM LINKS
    - alexa-app
    - express
    - dotenv
    - convert-units
    - moment

  `npm install --save alexa-app express dotenv convert-units moment`

4. Once that has been completed, let's create our `index.js` file and open it up in Atom.

5. With our packages installed, let's start structuring out our code.

    ```
    var express    = require("express");
    var alexa      = require("alexa-app");
    var http       = require('http');
    var dotenv     = require('dotenv');
    var moment     = require('moment');
    var convert    = require('convert-units')
    ```

6. If we follow the starter installation of `alexa-app`, we know we now need to start an express server and get it up and running.

  ```
  var app = express();
  ```

7. Lastly, to officially initialize our Alexa app, we need to:

  - Create a new instance of Alexa
  - Share where Alexa will live (what endpoint)
  - Start the server

  ```
  var alexaApp = new alexa.app("strava");
      alexaApp.express(app, "/echo/");

  app.listen(process.env.port || 5000);
  ```

8. If we take a look at our code now, we will *almost* have all of what we need to get started, but we need to initialize Alexa to listen for that "welcome" intent to make it official. So the last part of the code for this section is just that:

  ```
  alexaApp.launch(function(request, response) {
      response.say("Hello, welcome to Strava");
      response.shouldEndSession(false);
  });
  ```

9. Our file should be very simple and just look like this:

    ```
    var express    = require("express");
    var alexa      = require("alexa-app");
    var http       = require('http');
    var dotenv     = require('dotenv');
    var moment     = require('moment');
    var convert    = require('convert-units')

    var app = express();

    alexaApp.launch(function(request, response) {
        response.say("Hello, welcome to Strava");
        response.shouldEndSession(false);
    });

    var alexaApp = new alexa.app("strava");
        alexaApp.express(app, "/echo/");

    app.listen(process.env.port || 5000);
    ```

10. I wish I could say we were done in the terminal, but not quite yet. In order to get our express server up and running for Alexa to talk to, we need to 1) start it up 2) have a url for it to hit. If you read my last tutorial, you would know that my favorite tool for that is `ngrok`. `ngrok` is a local tunneling service that provides `https` urls for you to test with that come from localhost. To download `nrgok` [visit the website](https://ngrok.com/) and download the right one for your operating system.

Once it is downloaded, unzip the folder, and **copy and paste** the file called `ngrok` into your **alexa-strava directory.** Your directory should now look like this:

INSERT STEP 10 PICTURE

11. Now that we have `nrok` downloaded, we can work on getting the web server started and tunneling into localhost.

12. To do that, open up another terminal window and make sure you are in your project folder. Go ahead and run:

    `./ngrok http 5000`

    What that will do is start up an ngrok tunneling instance on port 5000. It should look something like the image below. **Note:** if you ever close or accidentally stop this terminal window, you will get a new url for your tunnel.

    INSERT NROK IMAGE

13. With our ngrok server running, we are good to go for this first section! Next up is setting up the Alexa app configuration in the Developer Portal and then getting the Strava keys.

#### Amazon Alexa Configuration

For this section, we are going to *quickly* walk through the steps of getting your app up and running. If you ever get lost, refer back to my first tutorial [Build Your First Alexa App](http://www.kevinguebert.com/build-your-first-alexa-app/) for more detailed steps and some more images. The app creation is the same across all platforms.

1. Signup and/or sign in to your developer account at the [Amazon Developer Services](https://developer.amazon.com)

2. Click on "Alexa" in the top, and then click on "Get Started" for Alexa Skills Kit.

INSERT IMAGE HERE

3. Click on "Add a New Skill" on the following page. We are going to be doing the following things:

    - **Skill Type:** Custom Interaction Model
    - **Name:** Strava
    - **Invocation Name**: Strava

4. With those fields filled out, go ahead and click on "Save". **Note** - if you get problems with using the word *Strava* as your name, it's because it's already taken. Name it however you like.

5. We are going to skip the **Interaction Model* section for now and come back to that later.

6. For **Configuration**, we are going to do the following:

    - **Service Endpoint Type:** HTTPS
    - **Account Linking:** No (we will do that in a later tutorial)

7. When you click on **HTTPS** for your endpoint, a check box will appear.

    - **Geographical Region:** North America

8. In the text box that appears below North America, what you are going to do is grab the `ngrok` url from above and copy and paste that in there.

INSERT IMAGE OF NGROK

9. **BUT WAIT** We aren't quite done yet - in our code from above there are two special things we did.

    Remember this:
    ```
    var alexaApp = new alexa.app("strava");
        alexaApp.express(app, "/echo/");
    ```

    What this did is it created a new `alexaApp` at the endpoint `/echo/strava`. If you want, you can remove the `/echo/` but the `strava` is required.

10. At the end of the `ngrok` url, make sure you add in

    `ngrok_url` + `/echo/strava`

11. Go ahead and click "Next" and you'll be taken to the **SSL Certificate** page. Since we are using `ngrok` and having it locally click the middle radio button: *My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority*. **Note** this is only for development and we will clean this up later.

12. Alright sounds good! Now onto setting up Strava and getting a developer account!
