import { Meteor } from 'meteor/meteor';
import { Pees } from '/imports/collections/pees'
import { Urinals } from '/imports/collections/urinals'
import { Metrics } from '/imports/collections/metrics'

var urinalgorithm = function (n, urinal_array){
  var max_uri = [];
  var max_dist = 0;
  var tot_dist = [];
  var left_d = 0;
  var right_d = 0;
  var i = 0;

  for(i = 0; i < n; i++){
    //console.log('Urinal ', i)
    //left side
    if(urinal_array[i] == 0){ //only compute distance for vacant urinols
      if(i == 0){
        left_d = n-1;
        //console.log('Left distance', left_d);
        //first urinol left distance is max distance
      }else{
        for(l = i-1; l > -1; l--){
            if(urinal_array[l] == 1){ //is occupied
              left_d = i-l-1;
              //console.log('Left distance', left_d);
              break;
            }
            if(l == 0){
              left_d = i;
              //console.log('Left distance', left_d);
            }
        }
      }
      //right side
      if(i == n-1){
        right_d = n-1;
        //console.log('Right distance', right_d);
        //last urinol right distance is max distance
      }else{
        for(r = i+1; r < n; r++){
            if(urinal_array[r] == 1){ //is occupied
              right_d = r-1-i;
              //console.log('Right distance', right_d);
              break;
            }
            if(r == n-1){
              right_d = n-1-i;
              //console.log('Right distance', right_d);
            }
        }
      }
    }
    if(right_d == 0 || left_d == 0){ //if its next to someone
      tot_dist.push(0);
    }else {
      tot_dist.push(right_d+left_d);
      if (tot_dist[i] > max_dist){
        max_uri = [];
        max_uri.push(i);
        max_dist = tot_dist[i];
      }else if(tot_dist[i] == max_dist && max_dist != 0){
        max_uri.push(i);
      }
    }
    //console.log('total distance ', tot_dist[i])
    left_d = 0;
    right_d = 0;
  }

  if(max_dist == 0){ //saturated situation
    max_uri = [];
    for(i = 0; i < n; i++){
      if(urinal_array[i] == 0){
        max_uri.push(i);
      }
    }
  } //returns all vacant urinols as best option
  return max_uri;

}

Meteor.startup(() => {
  Meteor.publish('urinals', function urinalsPublication() {
    return Urinals.find();
  });

  Meteor.publish('metrics', function metricsPublication() {
    return Metrics.find();
  });

  const mqtt = require('mqtt');
  const MQTTClient = mqtt.connect('mqtt://localhost');

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

    var algorithmOutput = urinalgorithm(algorithmInput.length, algorithmInput);

    for(var i=0; i<pees.length; i++){
      var pee = pees[i];
      var status = "go_away";
      if(algorithmOutput.indexOf(pee.pos) != -1){
        status = "piss_here";
      }
      MQTTClient.publish('mictor-io.node.'+pee.id, JSON.stringify({
        "status": status
      }));
    }

    Urinals.update({pos: {"$nin": algorithmOutput }}, {"$set": {wating_for_piss: false}}, {multi: true});
    Urinals.update({pos: {"$in": algorithmOutput }}, {"$set": {wating_for_piss: true}}, {multi: true});
  }

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
        {
          $group: {_id: null, avg_time: {$avg: "$data.time_elapsed"}, max_time: {$max: "$data.time_elapsed"}, min_time: {$min: "$data.time_elapsed"}, avg_distance: {$avg: "$data.distance"}}
        }
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

  setInterval(Meteor.bindEnvironment(function(){
    var pipeline = [
      {
        $group: {_id: {$hour:"$createdAt"}, "total":{$avg: "$data.time_elapsed"}}
      },
      {
        $sort: {_id: 1}
      }
    ];
    var result = Pees.aggregate(pipeline);

    var rushHourChartData = [];
    for(var i=0; i<24; i++){
      try {
        rushHourChartData.push(result[i]["total"]);
      } catch(error){
        rushHourChartData.push(0);
      }
    }

    Metrics.update({}, {"$set": {"rush_hour_chart": rushHourChartData}})
  }), 60*1000);
});
