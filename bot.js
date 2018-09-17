console.log("The bot is starting");

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
 
server.listen(server_port, server_ip_address, function () {
  console.log( "Listening on " + server_ip_address + ", port " + server_port )
});


let Twit = require('twit');
let config = require('./config');
let T = new Twit(config);

let jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

let $ = jQuery = require('jquery')(window);


setInterval(function(){
	$.getJSON('https://api.spacexdata.com/v2/launches/next', function(data) {
		execute(data);
	}, 6 * 60 * 60 * 1000);
}

function execute(data){
	mission = data.mission_name;
	UTC = data.launch_date_utc;
	local = data.launch_date_local;
	rocket = data.rocket.rocket_name;
	location = data.launch_site.site_name_long;

	ymd = UTC.substring(0,10);
	hour = UTC.substring(11, 13);
	minute = UTC.substring(14, 16);

	localymd = local.substring(0,10);
	localhour = local.substring(11, 13);
	localminute = local.substring(14, 16);
	
	intervalID = setInterval(post(), 60 * 1000);
}

function post(){
		let now = Math.floor(Date.now()/1000000); //milliseconds / 1000000 = minutes
		let unixtime = Math.floor(data.launch_date_unix/1000); //seconds / 1000 = minutes
		if(now === unixtime - 30){
			T.post('statuses/update', 
			{
				status: 'Next mission: ' + mission + ' using the ' + rocket + ' rocket, launches in 30 minutes. Exact time: ' + ymd + ' at ' + hour + ':' + minute + ' UTC, '
				+ localymd + ' at ' + localhour + ':' + localminute + ' local time. #SpaceX'
			})
			clearInterval(intervalID);
		}
		console.log("now=" + now + ", unixtime=" + unixtime);
}

