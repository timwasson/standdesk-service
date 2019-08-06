# StandDesk Service
Service for the StandDesk raising and lowering via the Raspberry Pi

This project is based off of the hard work by timwasson (https://github.com/timwasson/standdesk-service) and has been updated to work with some updated utilities since some packages with NPM have become defunct. I will be posting some more detailed information soon to show exactly how to get yours to be functional.

Work in progress for automating and configuring a StandDesk with scheduling of days, hours, standing time, sitting time, and hard-wired up/down buttons as well as a distance sensor. 

Works independently or in conjunction with the StandDesk Chrome extension.

View it in action here: https://www.youtube.com/watch?v=hS-JJ-VIoWI

# Software Install
Currently, this project is working for myself and a co-worker on a RaspberryPi 2 running (as of May 2019). Node.js version 8. This has proven to be important since some of the modules are outdated which doesn't allow for a newer version of Node to be used. This has been tested to work with Debian Buster as of 8/2019.

### I always like to start with an updated version of everything so...
```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get dist-upgrade
```
## Installation

### 1) Install Node v. 8.16.0 following the instructions on the nodesource.com webpage
```
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```
### 2) Install WiringPi

```
sudo apt-get install wiringpi
```

### 3) Install NPM
```
sudo apt-get update
sudo apt-get install npm
```
### 4) Confirm NPM version. This should show 5.8.0
```
npm -v
```
### 5) Confirm Node version. This should show 8.16.0
```
sudo node -v
```
### 6) Git the project
```
git clone https://github.com/ukypayne/standdesk-service.git
```

## Testing

After you have installed everything, you should be able to launch the project.
```
cd /standdesk-service/
sudo node index.js
```
If this has run successfully, you should see a similar output.
```
sudo node index.js
grabbed configuration | 8 | 35 | ["1","2","3","4","5"]
Example app listening at http://:::3000
1 | 15 | 2 | 755 | 1652 | 1543
Time Remaining: 00:34:59 | Distance: 72.98103448275862 | Currently: sit | Paused: false
1 | 15 | 2 | 755 | 1652 | 1543
Time Remaining: 00:34:58 | Distance: 73.844 | Currently: sit | Paused: false
1 | 15 | 2 | 755 | 1652 | 1543
Time Remaining: 00:34:57 | Distance: 72.98103448275862 | Currently: sit | Paused: false
1 | 15 | 2 | 755 | 1652 | 1543
Time Remaining: 00:34:56 | Distance: 74.69348275862069 | Currently: sit | Paused: false
```
You can navigate to the webpage by going to xx.x.x.x:3000.
![Image of Webpage](/images/standdesk_Web.png)
From here you can adjust the config by changing any of the settings and pressing "Update Settings".
You can also trigger the desk to move Up or Down by clicking the large Green/Red buttons.
*Currently the Pause/unpause buttons do not work.*

## API 

There are a few different pages you can have to trigger different settings. You can pull all the information by navigating to the following pages. I was not the original author of this program so I do not know much of how any of this works, other than that it was built in the original program. I have used the pause and unpause pages on my computer so that when I login, my desk unpauses the timer (since I am at my desk), and when my computer is locked because I walk away, it pauses the timer so the desk won't move without me being there.

Address | Function | Example
------------ | ------------- | -------------
x.x.x.x:3000/ | Shows GUI of web controls | ![Image of Webpage](/images/standdesk_Web.png)
x.x.x.x:3000/status | Lists all information from the app. | {"timeRemain":2100,"distance":73.85479310344827,"paused":false}
x.x.x.x:3000/up | Triggers simulation of the "up" command (Green Button) | {"sitStand":"stand"}
x.x.x.x:3000/down | Triggers simulation of the "down" command (Red Button) | {"sitStand":"stand"}
x.x.x.x:3000/pause | Triggers the timer to pause | {"paused":"yes"}
x.x.x.x:3000/unpause | Triggers the timer to resume | {"paused":"no"}

## Start as a Service
To have the standdesk program run as a service on boot, follow the instructions below.

1) Open a terminal prompt:

```
cd /etc/systemd/system/
```

2) Create a new file by typing:
```
sudo nano standdesk.service
```
3) Copy-paste the information below into the text file you are making and then save by pressing ctrl-X and confirming that you would like to save changes.
```
[Unit]
Description=Standdesk Service

[Service]
ExecStart=/usr/bin/sudo /usr/local/bin/node /home/pi/standdesk-service/
Restart=always
User=root
# Note Debian/Ubuntu uses 'nogroup', RHEL/Fedora uses 'nobody'
Environment=PATH=/usr/bin:/usr/local/bin
Environment=NODE_ENV=production
WorkingDirectory=/home/pi/standdesk-service/

[Install]
WantedBy=multi-user.target
```
4) Give permissions to the service file
```
sudo chmod 644 /etc/systemd/system/standdesk.service
```
5) Test that the service will run by running:
```
sudo systemctl start standdesk.service
```
6) Check that the service is actually running:
```
sudo systemctl status standdesk.service
```
It should output something like:
```
standdesk.service - Standdesk
   Loaded: loaded (/etc/systemd/system/standdesk.service; enabled; vendor preset
   Active: active (running) since Mon 2019-08-05 16:04:03 EDT; 13s ago
 Main PID: 4355 (sudo)
    Tasks: 11 (limit: 4915)
   CGroup: /system.slice/standdesk.service
           tq4355 /usr/bin/sudo /usr/local/bin/node /home/pi/standdesk-s
           mq4363 /usr/local/bin/node /home/pi/standdesk-service-master/

Aug 05 16:04:12 Bi-Pi sudo[4355]: 1 | 16 | 2 | 755 | 1652 | 1604
Aug 05 16:04:12 Bi-Pi sudo[4355]: Time Remaining: 00:34:53 | Distance: 72.9945 |
Aug 05 16:04:13 Bi-Pi sudo[4355]: 1 | 16 | 2 | 755 | 1652 | 1604
Aug 05 16:04:13 Bi-Pi sudo[4355]: Time Remaining: 00:34:52 | Distance: 74.228344
Aug 05 16:04:14 Bi-Pi sudo[4355]: 1 | 16 | 2 | 755 | 1652 | 1604
Aug 05 16:04:14 Bi-Pi sudo[4355]: Time Remaining: 00:34:51 | Distance: 73.416551
Aug 05 16:04:15 Bi-Pi sudo[4355]: 1 | 16 | 2 | 755 | 1652 | 1604
Aug 05 16:04:15 Bi-Pi sudo[4355]: Time Remaining: 00:34:50 | Distance: 73.833224
Aug 05 16:04:16 Bi-Pi sudo[4355]: 1 | 16 | 2 | 755 | 1652 | 1604
Aug 05 16:04:16 Bi-Pi sudo[4355]: Time Remaining: 00:34:49 | Distance: 73.841293
lines 1-19/19 (END)
```
*Press Ctrl + C to exit.*

7) Stop the service by running:
 ```
sudo systemctl stop standdesk.service
```
8) Use the enable command to make sure the service starts with the system.
```
sudo systemctl enable standdesk.service
```
9) Reboot the machine and see if the service ran successfully
```
sudo reboot now
```
*When the program starts, it will trigger the relays for a split second. This is an easy way to tell if the program is running. You can also navigate to the webpage.*

## Other config changes
There are a number of hard coded values in the index.js file. Most things are decently easy to find and manipulate if needed, but here is a short list of those values.

* upButtonPress = gpio.export (22
* downButtonPress = gpio.export (17
* sit distance threashold is sitStand = 'sit' (By default this is < 78 cm)
* stand distance threashold is sitStand = 'stand' (By default this is > 88 cm)
* if the sitStand value is not in this window, the desk registers as 'moving'
* function downPress ...... the value of 6900 represents the length to simulate the button press. This is 6.9 seconds.
* function upPress ...... the value of 6900 represents the length to simulate the button press. This is 6.9 seconds.
* The title on the webpage name can be adjusted by changing the value of
```
"title: 'Billy\'s StandDesk Manager', 
message: 'Billy\'s StandDesk Settings'
```
* Currently, the buttons that load on the IP:3000 webpage have a direct reference to an IP hard coded. You will need to change these to correlate to your IP. Go to the */public/js/* directory and edit *js.js* and edit all references to 10.164.116.27
```
 $("button#upPress").on("click", function() {
    $.ajax("http://10.164.116.27:3000/up");  });
  $("button#downPress").on("click", function() {
    $.ajax("http://10.164.116.27:3000/down");
  $("button#Pause").on("click", function() {
    $.ajax("http://10.164.116.27:3000/pause");  });
  $("button#unPause").on("click", function() {
    $.ajax("http://10.164.116.27:3000/unpause");  });
```
# Hardware Install
Hardware includes a RPi 2, a 2 channel Relay board, and a HC-SR04 Ultrasonic Sensor module, and a 1k ohm resistor. I also added a perfboard to make the setup more contained. The Relay board simulates an up and a down button press that connects directly to my standing desk. My desk is made by Steelcase (don't have the exact model) and includes the motor and control circuit with a spare switch connector. I terminated a CAT6 cable into the spare jack and found which wires I needed to simulate the button being pressed for Up & Down.

*The RJ45 jack on the side represents the connector that my desk uses to connect to the control module. Pin 1 is the ground for my setup, and pins 4 & 5 are the up/down.*

![Image of Circuit](/images/Standdesk_bb.png)


