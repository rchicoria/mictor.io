import { Meteor } from 'meteor/meteor';
import { Pees } from '/imports/collections/pees'
import { Urinals } from '/imports/collections/urinals'
import { Metrics } from '/imports/collections/metrics'

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

  var algorithmOutput = urinalgorithm(algorithmInput);
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
      var jsonMessage = JSON.parse(message.toString());

      var now = new Date();
      var minDate = new Date(now - 3 * 60*1000);
      var peesCount = Pees.find({createdAt: {"$gt": minDate}}).count();

      var metricsUpdateDict = {};
      var urinalUpdateDict = {};

      if(peesCount > 10){
        metricsUpdateDict["$set"] = {ok: false};
      } else {
        metricsUpdateDict["$set"] = {ok: true};
      }

      if(topic === 'mictor-io.start') {
        urinalUpdateDict["$set"] = { occupied: true };

        if(!jsonMessage.data.waiting_for_piss){
          metricsUpdateDict["$inc"] = {violations: 1}
        }
      } else if(topic === 'mictor-io.end') {
        urinalUpdateDict["$set"] = { occupied: false };
        Pees.insert(jsonMessage);
      }

      Metrics.update({}, metricsUpdateDict);
      Urinals.update(
        {id: jsonMessage.frame_id},
        urinalUpdateDict
      );
      callAlgorithm();
    })
  );
});
