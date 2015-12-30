var express = require('express');
var usonic = require('r-pi-usonic');
var app = express();
var gpio = require('gpio');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

// Establish variables for desk distance, status and timer
var distance, sitStand, timer;

// Get desk config
var appConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));

//var standDuration = parseInt(appConfig.standDuration);
//var sitDuration = parseInt(appConfig.sitDuration);

var standDuration = 120;
var sitDuration = 100;

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
      sitStand = 'sit';
      timer = sitDuration;
    } else {
      sitStand = 'stand';
      timer = standDuration;
    }
  }
});

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
// End pin export

setInterval(function(){
  // Ensure sitting/standing is set properly by checking distance
  if(distance < 72) {
    sitStand = 'sit';
  } else {
    sitStand = 'stand';
  }
  // Only run this on certain days and certain times
  var today = new Date();
  // Don't run on the weekends (6 and 0) or before/after certain hours (8 and 5)
  //if(today.getDay() !=6 && today.getDay() != 0 && today.getHours() >= 8 && today.getHours() <= 17) {
    timer--;
    console.log("Time Remaining: " + timer + " | Distance: " + distance + " | Currently: " + sitStand);
    if(sitStand == 'stand' && timer == 0) {
      down.set(1);
      up.set(0);
  
      timer = sitDuration;
      sitStand = 'sit';
    } else if(sitStand == 'sit' && timer == 0) {
      down.set(0);
      up.set(1);
      
      timer = standDuration;
      sitStand = 'stand';
    }
  //}
}, 
// 1 minute
1000
);

app.get('/', function (req, res) {
  res.render('index', { 
    title: 'StandDesk Manager', 
    message: 'StandDesk Settings',
    sitDuration: sitDuration,
    standDuration: standDuration
  });
});

app.get('/up', function (req, res) {
  // Send back JSON
  var foo = {sitStand:'stand'};
  var jsonString = JSON.stringify(foo);
  res.send(jsonString);
  
  // Set GPIO to stand
  down.set(0);
  up.set(1);
});

app.get('/down', function (req, res) {
  // Send back JSON
  var foo = {sitStand:'sit'};
  var jsonString = JSON.stringify(foo);
  res.send(jsonString);
  
  // Set GPIO to sit
  down.set(1);
  up.set(0);
});

app.get('/status', function (req, res) {
  var foo = {status:sitStand, timeRemain:timer,distance:distance};
  var jsonString = JSON.stringify(foo);
  res.send(jsonString);
});

app.post('/save',function(req,res){
  var data=req.body.data;
  console.log(JSON.stringify(req.body));
  fs.writeFile("config.json", JSON.stringify(req.body), function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  });
  res.end("yes");
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  
  console.log('Example app listening at http://%s:%s', host, port);
});