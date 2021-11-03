require('dotenv').config({path: '/home/pi/spacex-twitter-bot/.env'});
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 6000;

express()
.use(express.static(path.join(__dirname, 'public')))
.set('views', path.join(__dirname, 'views'))
.set('view engine', 'ejs')
.get('/', (req, res) => res.render('pages/index'))
.listen(PORT, () => console.log(`Listening on ${ PORT }`));

console.log("The bot is starting");

let Twit = require('twit');
//let config = require('./config');
//let T = new Twit(config);
let T = new Twit({
	consumer_key: process.env.consumer_key,
  	consumer_secret: process.env.consumer_secret,
  	access_token: process.env.access_token,
  	access_token_secret: process.env.access_token_secret,
  	timeout_ms: 60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL: true     // optional - requires SSL certificates to be valid.
});

let jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;


// the API url
let url = "https://api.spacexdata.com/v4/launches/query";

// the post options
let options = {
    "query": {
        "upcoming": true
    },
    "options": {
        "select": {
            "fairings": 0,
            "links": 0,
            "tbd": 0,
            "net": 0,
            "window": 0,
            "success": 0,
            "details": 0,
            "crew": 0,
            "ships": 0,
            "capsules": 0,
            "payloads": 0,
            "static_fire_date_utc": 0,
            "static_fire_date_unix": 0,
            "auto_update": 0,
            "launch_library_id": 0,
            "failures": 0,
            "upcoming": 0,
            "cores": 0,
            "id": 0
        },
        "populate": [
            {
                "path": "launchpad",
                "select": "name"
            },
            {
                "path": "rocket",
                "select": "name"
            }
        ],
        "sort": {
            "flight_number": "asc"
        },
        "limit": 1
    }
}

let $ = jQuery = require('jquery')(window);

$.getJSON(url, options, function(data) {
	execute(data);
});



setInterval(function(){
	$.getJSON(url, options, function(data) {
		execute(data);
	});
}, 1 * 60 * 60 * 1000); //every hour

function execute(queryResult){
	console.log("getJSON function called");

	// get the correct data
	let data = queryResult.docs[0];

	let mission = data.name;
	let rocket = data.rocket.name;
	let location = data.launchpad.name;
	let launchTime = date.date_unix * 1000; // in millis

	let date = new Date(launchTime);
	
	tweet(mission, rocket, location, data);
	
	// deprecated

	/*
	let intervalID = setInterval(function(){
		let now = Math.floor(Date.now()/1000); 
		
		let timeDiff = Math.abs(unixtime - now);
		let diffDays = timeDiff / (3600 * 24);
		let diffHours = (diffDays % 1) * 24;
		let diffMinutes = (diffHours % 1 ) * 60;
		let diffSeconds = (diffMinutes % 1) * 60;


		let timeString;
		if(ymd === localymd){
			timeString = ymd + ' at ' + hour + ':' + minute + ' UTC, ' + localhour + ':' + localminute + ' local time (UTC' + localtz + ').'
		}else{
			timeString = ymd + ' at ' + hour + ':' + minute + ' UTC, ' + localymd + ' at ' + localhour + ':' + localminute + ' local time (UTC' + localtz + ').';
		}

		if(Math.floor(diffMinutes) === 30 && Math.floor(diffHours) === 0 && Math.floor(diffDays) === 0 && now < unixtime){
			T.post('statuses/update', 
			{
				status: mission + ' using the ' + rocket + ' rocket, launches from ' + location + ' in 30 minutes. Exact time: ' + timeString + ' Watch on spacex.com/webcast. #SpaceX'
			}, tweeted);
			clearInterval(intervalID);
		}else if(Math.floor(diffMinutes) === 0 && Math.floor(diffHours) === 0 && Math.floor(diffDays) === 7 && now < unixtime){
			T.post('statuses/update', 
			{
				status: mission + ' using the ' + rocket + ' rocket, launches from ' + location + ' in 1 week. Exact time: ' + timeString + ' #SpaceX'
			}, tweeted);
			clearInterval(intervalID);
		}else if(Math.floor(diffMinutes) === 0 && Math.floor(diffHours) === 0 && Math.floor(diffDays) === 1 && now < unixtime){
			T.post('statuses/update', 
			{
				status: mission + ' using the ' + rocket + ' rocket, launches from ' + location + ' in 24 hours. Exact time: ' + timeString + ' #SpaceX'
			}, tweeted);
			console.log("now=" + new Date(now*1000) + ", unixtime=" + new Date(unixtime*1000)
			+ ", difference=" + Math.floor(diffDays) + " days, " + Math.floor(diffHours) + ":" + Math.floor(diffMinutes) + ":" + Math.floor(diffSeconds));
			clearInterval(intervalID);
		}
		//console.log("now=" + new Date(now*1000) + ", unixtime=" + new Date(unixtime*1000) + ", difference=" + Math.floor(diffDays) + " days, " + Math.floor(diffHours) + ":" + Math.floor(diffMinutes) + ":" + Math.floor(diffSeconds));
	}, 60 * 1000); //every minute

	*/

}

function tweet(mission, rocket, location, date){
	console.log(mission, rocket, location, date);

	// every minute:
	let intervalID = setInterval(() => {
			
		// calculate diffs
		// let diffDays = timeDiff / (3600 * 24); // amount of days
		// let diffHours = (diffDays % 1) * 24; // amount of hours
		// let diffMinutes = (diffHours % 1 ) * 60; // amount of minutes
		// let diffSeconds = (diffMinutes % 1) * 60;

		// current time
		let now = new Date();
			
		// difference between launchtime and current time
		let timeDiff = launchTime - now;
		if(timeDiff < 0){
			clearInterval(intervalID);
		}


		let diffMins = timeDiff / (1000 * 60);


		if (Math.floor(diffMins) === (60 * 24 * 7)){
			// one week
			tweet(mission, rocket, location, data);
		} else if(Math.floor(diffMins) === (60 * 24)){
			// one day
			tweet(mission, rocket, location, data);
		} else if (Math.floor(diffMins) === (30)){
			// 30 minutes
			tweet(mission, rocket, location, data);
		} 
	}, 60 * 1000);

	
}

function tweeted(err, data, response) {
	if (err) {
		console.log("Error when tweeting: " + data + ", response: " + response);
	} else {
		console.log("Successful tweet: " + data);
	}
}
