var express = require('express');
var app = express();
var gpio = require("gpio");

// Calling export with a pin number will export that header and return a gpio header instance
var power = gpio.export(2, {
   // When you export a pin, the default direction is out. This allows you to set
   // the pin value to either LOW or HIGH (3.3V) from your program.
   direction: 'in',

   // set the time interval (ms) between each read when watching for value changes
   // note: this is default to 100, setting value too low will cause high CPU usage
   interval: 200,

   // Due to the asynchronous nature of exporting a header, you may not be able to
   // read or write to the header right away. Place your logic in this ready
   // function to guarantee everything will get fired properly
   ready: function() {
   }
});
var up = gpio.export(3, {
   direction: 'out',

   interval: 200,

   ready: function() {
   }
});

var down = gpio.export(4, {
   direction: 'out',

   interval: 200,

   ready: function() {
   }
});

//down.set(0);
//up.set(1);

app.get('/', function (req, res) {
  res.send('Hello World!');
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

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});