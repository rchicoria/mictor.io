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

      urinalUpdateDict["$set"] = {};

      var pipeline = [
        {$group: {_id: null, avg_time: {$avg: "$data.time_elapsed"}, max_time: {$max: "$data.time_elapsed"}, min_time: {$min: "$data.time_elapsed"}, avg_distance: {$avg: "$data.distance"}}}
      ];

      var result = Pees.aggregate(pipeline);
      try {
        metricsUpdateDict["$set"]["avg_time"] = result[0]["avg_time"];
        metricsUpdateDict["$set"]["max_time"] = result[0]["max_time"];
        metricsUpdateDict["$set"]["min_time"] = result[0]["min_time"];
        metricsUpdateDict["$set"]["avg_distance"] = result[0]["avg_distance"];
      } catch(err) {
        metricsUpdateDict["$set"]["avg_time"] = 0;
        metricsUpdateDict["$set"]["max_time"] = 0;
        metricsUpdateDict["$set"]["min_time"] = 0;
        metricsUpdateDict["$set"]["avg_distance"] = 0;
      }

      if(topic === 'mictor-io.start') {
        urinalUpdateDict["$set"]["occupied"] = true ;

        if(!jsonMessage.data.waiting_for_piss){
          metricsUpdateDict["$inc"] = {violations: 1}
        }
      } else if(topic === 'mictor-io.end') {
        urinalUpdateDict["$set"]["occupied"] = false;
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
