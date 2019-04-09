const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

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

let $ = jQuery = require('jquery')(window);

$.getJSON('https://api.spacexdata.com/v2/launches/next', function(data) {
	execute(data);
});


setInterval(function(){
	$.getJSON('https://api.spacexdata.com/v2/launches/next', function(data) {
		execute(data);
	});
}, 6 * 60 * 60 * 1000); //every 6 hours

function execute(data){
	console.log("getJSON function called");

	let mission = data.mission_name;
	let UTC = data.launch_date_utc;
	let local = data.launch_date_local;
	let rocket = data.rocket.rocket_name;
	let location = data.launch_site.site_name;

	let ymd = UTC.substring(0,10);
	let hour = UTC.substring(11, 13);
	let minute = UTC.substring(14, 16);

	let localymd = local.substring(0,10);
	let localhour = local.substring(11, 13);
	let localminute = local.substring(14, 16);

	let localtz = local.substring(19, 22);

	
	let intervalID = setInterval(function(){
		let now = Math.floor(Date.now()/1000); 
		let unixtime = data.launch_date_unix; 
		
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
}

function tweeted(err, data, response) {
	if (err) {
		console.log("Error when tweeting: " + data + ", response: " + response);
	} else {
		console.log("Successful tweet");
	}
}
