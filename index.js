var express = require('express');
var app = express();
var gpio = require('gpio');
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');

app.set('view engine', 'jade');
app.set('views', 'views');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));

/* NOTE: SASS is compiled with compass outside of node.js now  */

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

var appConfig = JSON.parse(fs.readFileSync('config.json', 'utf8'));

var standDuration = parseInt(appConfig.sitDuration);
var sitDuration = parseInt(appConfig.standDuration);

// Set the timer at zero and force a stand
var timer = 0;
var sitStand = 'stand';

setInterval(function(){
  // Only run this on certain days and certain times
  var today = new Date();
  // Don't run on the weekends (6 and 0) or before/after certain hours (8 and 5)
  if(today.getDay() !=6 && today.getDay() != 0 && today.getHours() >= 8 && today.getHours() <= 17) {
    timer++;
    console.log("time: " + timer);
    if(sitStand == 'stand' && timer >= standDuration) {
      down.set(1);
      up.set(0);
  
      timer = 0;
      sitStand = 'sit';
    } else if(sitStand == 'sit' && timer >= sitDuration) {
      down.set(0);
      up.set(1);
      
      timer = 0;
      sitStand = 'stand';
    }
  }
}, 
// 1 minute
60000
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
  var foo = {sitStand:'stand'};
  var jsonString = JSON.stringify(foo);
  res.send(jsonString);
  
  // Set GPIO to sit
  down.set(1);
  up.set(0);
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