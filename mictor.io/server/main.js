import { Meteor } from 'meteor/meteor';
import { Pees } from '/imports/collections/pees'
import { Urinals } from '/imports/collections/urinals'

var urinalgorithm = function(input){
  var output = [];
  for(var i=0; i<input.length; i++){
    var myRandomValue = Math.random();
    if(myRandomValue > 0.5){
      output.push(i);
    }
  }

  return output;
}

var callAlgorithm = function(){
  var pees = Urinals.find({}, {sort: {"pos": 1}}).fetch();
  var algorithmInput = [];
  for(var i=0; i<pees.length; i++){
    var pee = pees[i];
    var input = 0;
    if(pee.occupied){
      input=1;
    }
    algorithmInput.push(input);
  }

  console.log(algorithmInput);

  var algorithmOutput = urinalgorithm(algorithmInput);
  console.log(algorithmOutput);
  console.log(Urinals.find({pos: 1 }).fetch());
  Urinals.update({pos: {"$nin": algorithmOutput }}, {"$set": {wating_for_piss: false}}, {multi: true});
  Urinals.update({pos: {"$in": algorithmOutput }}, {"$set": {wating_for_piss: true}}, {multi: true});
}

Meteor.startup(() => {
  const mqtt = require('mqtt');
  const MQTTClient = mqtt.connect('mqtt://localhost');

  MQTTClient.on('connect', () => {
    MQTTClient.subscribe('mictor-io.start');
    MQTTClient.subscribe('mictor-io.end');
  });

  MQTTClient.on('message', Meteor.bindEnvironment(function(topic, message){
      var jsonMessage = JSON.parse(message.toString())
      if(topic === 'mictor-io.start') {
        Urinals.update(
          {id: jsonMessage.frame_id},
          {
            $set: { occupied: true },
          });
        callAlgorithm();
      } else if(topic === 'mictor-io.end') {
        Urinals.update(
          {id: jsonMessage.frame_id},
          {
            $set: { occupied: false },
          });
        Pees.insert(jsonMessage);
        callAlgorithm();
      }
    })
  );
});
