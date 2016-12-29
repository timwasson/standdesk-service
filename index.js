var express = require('express');
var usonic = require('r-pi-usonic');
var app = express();
var gpio = require('gpio');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

// Establish variables for desk distance, status, configuration, and timer
var distance, sitStand, timer, appConfig, standDuration, sitDuration, activeHourStart, activeMinuteStart, activeHourStop, activeMinuteStop, startTime, stopTime;
var activeDays = [];
var pausedVal = false;

// Get desk config
function getConfig() {
  appConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));
  standDuration = parseInt(appConfig.standDuration);
  sitDuration = parseInt(appConfig.sitDuration);
  activeHourStart = parseInt(appConfig.activeHourStart);
  activeMinuteStart = parseInt(appConfig.activeMinuteStart);
  activeHourStop = parseInt(appConfig.activeHourStop);
  activeMinuteStop = parseInt(appConfig.activeMinuteStop);
  
  startTime = parseInt(activeHourStart + "" + activeMinuteStart);
  stopTime = parseInt(activeHourStop + "" + activeMinuteStop);
  
  //Darn special characters
  activeDays = JSON.stringify(appConfig["activeDays[]"]);
  
  console.log("grabbed configuration | " + standDuration + " | " + sitDuration + " | " + activeDays);
}

getConfig();

var SecondsTohhmmss = function(totalSeconds) {
  var hours   = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
  var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

  // round seconds
  seconds = Math.round(seconds * 100) / 100

  var result = (hours < 10 ? "0" + hours : hours);
      result += ":" + (minutes < 10 ? "0" + minutes : minutes);
      result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
  return result;
}

// Initialize the distance sensor
usonic.init(function (error) {
  if (error) {
    console.log(error);
  } else {
    var sensor = usonic.createSensor(23, 27, 1000);
    distance = sensor();
    setInterval(function() {
      distance = sensor();
    }, 500);
    if(distance < 72) {
      timer = sitDuration * 60;
    } else {
      timer = standDuration * 60;
    }
  }
});

// Function for outputting month 
var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

// Set up jade templating engine
app.set('view engine', 'jade');
app.set('views', 'views');

// Set up express and the bodyParser to save desk configuration
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Exporting GPIO pins
var power = gpio.export(2, {
   direction: 'in',
   interval: 200
});
var up = gpio.export(3, {
   direction: 'out',
   interval: 200
});

var down = gpio.export(4, {
   direction: 'out',
   interval: 200
});

// Hardware button presses
var upButtonPress = gpio.export(22, {
   direction: 'in',
   interval: 200
});
var downButtonPress = gpio.export(17, {
   direction: 'in',
   interval: 200
});
// End pin export
setInterval(function(){
  // Ensure sitting/standing is set properly by checking distance
  if(distance < 72) {
    sitStand = 'sit';
  } else if (distance > 113) {
    sitStand = 'stand';
  } else {
    sitStand = 'moving';
  }
  // Only run this on certain days and certain times
  var today = new Date();
  var rightNow = parseInt(today.getHours() + "" + today.getMinutes());

  console.log(today.getDay() + " | " + today.getHours() + " | " + activeDays.indexOf(today.getDay()) + " | " + startTime + " | " + stopTime + " | " + rightNow);
      
  if(activeDays.indexOf(today.getDay()) != -1 && rightNow >= startTime && rightNow <= stopTime && pausedVal == false) {
    timer--;
    // Brute force
    if (timer <= 0) { timer = 0; }
    console.log("Time Remaining: " + SecondsTohhmmss(timer) + " | Distance: " + distance + " | Currently: " + sitStand + " | Paused: " + pausedVal);
    
    if(sitStand == 'stand' && timer == 0) {
      downPress();
  
      timer = sitDuration * 60;
    
    } else if(sitStand == 'sit' && timer == 0) {
      upPress();
      
      timer = standDuration * 60;
    }
  }
}, 
// 1 second
1000
);

function downPress() {
  down.set(1);
  up.set(0);
  sitStand = 'moving';
  setTimeout(function() {
    down.set(0);
  }, 1000);
}

function upPress() {
  down.set(0);
  up.set(1);
  sitStand = 'moving';
  setTimeout(function() {
    up.set(0);
  }, 1000);
}

downButtonPress.on("change", function() {
  if(downButtonPress.value == 1) {
    downPress();
  }
});

upButtonPress.on("change", function() {
  if(upButtonPress.value == 1) {
    upPress();
  }
})

app.get('/', function (req, res) {
  res.render('index', { 
    title: 'StandDesk Manager', 
    message: 'StandDesk Settings',
    sitDuration: sitDuration,
    standDuration: standDuration,
    activeDays: activeDays,
    activeHourStart: activeHourStart,
    activeMinuteStart: activeMinuteStart,
    activeHourStop: activeHourStop,
    activeMinuteStop: activeMinuteStop
  });
});

app.get('/up', function (req, res) {
  // Send back JSON
  var foo = {sitStand:'stand'};
  var jsonString = JSON.stringify(foo);
  res.send(jsonString);
  
  upPress();
});

app.get('/down', function (req, res) {
  // Send back JSON
  var foo = {sitStand:'sit'};
  var jsonString = JSON.stringify(foo);
  res.send(jsonString);
  
  downPress();
});

app.get('/pause', function (req, res) {
  // Send back JSON
  var foo = {paused:'yes'};
  var jsonString = JSON.stringify(foo);
  
  pausedVal = true;

  res.send(jsonString);
});

app.get('/unpause', function (req, res) {
  // Send back JSON
  var foo = {paused:'no'};
  var jsonString = JSON.stringify(foo);
  
  pausedVal = false;

  res.send(jsonString);
});

app.get('/status', function (req, res) {
  var foo = {status:sitStand, timeRemain:timer,distance:distance,paused:pausedVal};
  var jsonString = JSON.stringify(foo);
  res.send(jsonString);
});

app.post('/save',function(req,res){
  var data=req.body.data;
  console.log(JSON.stringify(req.body));
  fs.writeFile("config.json", JSON.stringify(req.body), function(err) {
    if(err) {
      return console.log(err);
    } else {
      getConfig();
      console.log("The file was saved!");
    }
  });
  res.end("yes");
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  
  console.log('Example app listening at http://%s:%s', host, port);
});