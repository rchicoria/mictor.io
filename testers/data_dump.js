const mqtt = require('mqtt');
// const MQTTClient = mqtt.connect('mqtt://104.236.192.113');
const MQTTClient = mqtt.connect('mqtt://localhost');
var pissingMin = 5000;
var pissingMax = 30000;

var sleepingMin = 1000;
var sleepingMax = 5000;

var distanceMin = 0.05;
var distanceMax = 0.15;

var minHour = 0;
var maxHour = 23;

var minMin = 0;
var maxMin = 59;

var rand = function(min, max){
  return Math.random() * (max - min) + min;
}

var endCallback = function(id, pissingTime){
  console.log("END "+id);


  var hour = Math.round(rand(minHour, maxHour));
  if(hour < 10){
    hour = "0"+hour;
  }

  var min = Math.round(rand(minMin, maxMin));
  if(min < 10){
    min = "0"+min;
  }

  MQTTClient.publish('mictor-io.end', JSON.stringify({
    "frame_id": id,
    "data": {
      "distance": rand(distanceMin, distanceMax),
      "time_elapsed": pissingTime
    },
    "createdAt": "2016-10-07T"+hour+":"+min
  }));
  //setTimeout(startCallback, rand(sleepingMin, sleepingMax), id);
}

// var startCallback = function(id){
//   console.log("START "+id);
//
//   var myRandomValue = Math.random();
//   var violated = false;
//   if(myRandomValue > 0.7){
//     violated = true;
//   }
//
//   MQTTClient.publish('mictor-io.start', JSON.stringify({
//     "frame_id": id,
//     "data": {
//       "waiting_for_piss": !violated
//     }
//   }));
//   var pissingTime = rand(pissingMin, pissingMax);
//   setTimeout(endCallback, pissingTime, id, pissingTime);
// }

var test = function(){
  for(var i=0; i<500; i++){
    var pissingTime = rand(pissingMin, pissingMax);
    var id = "urinol"+Math.round(rand(1,6));
    endCallback(id, pissingTime);
  }
}

MQTTClient.on('connect', () => {
  test();
});
