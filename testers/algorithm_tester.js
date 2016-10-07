const mqtt = require('mqtt');
// const MQTTClient = mqtt.connect('mqtt://104.236.192.113');
const MQTTClient = mqtt.connect('mqtt://localhost');
var pissingMin = 5000;
var pissingMax = 30000;

var sleepingMin = 1000;
var sleepingMax = 5000;

var distanceMin = 0.05;
var distanceMax = 0.15;

var rand = function(min, max){
  return Math.random() * (max - min) + min;
}

var endCallback = function(id, pissingTime){
  console.log("END "+id);
  MQTTClient.publish('mictor-io.end', JSON.stringify({
    "frame_id": id,
    "data": {
      "distance": rand(distanceMin, distanceMax),
      "time_elapsed": pissingTime
    }
  }));
  setTimeout(startCallback, 5000);
}

var startCallback = function(){
  var myId = "mictor1"//"mictor"+Math.round(rand(1,6));

  console.log("START "+myId);

  var myRandomValue = Math.random();
  var violated = false;
  if(myRandomValue > 0.7){
    violated = true;
  }


  MQTTClient.publish('mictor-io.start', JSON.stringify({
    "frame_id": myId,
    "data": {
      "waiting_for_piss": !violated
    }
  }));
  var pissingTime = rand(pissingMin, pissingMax);
  setTimeout(endCallback, 5000, myId, pissingTime);
}

var test = function(){
  startCallback();
}

MQTTClient.on('connect', () => {
  test();
});
