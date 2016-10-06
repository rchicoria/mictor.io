import { Meteor } from 'meteor/meteor';
import { Pees } from '/imports/collections/pees'
import { Urinals } from '/imports/collections/urinals'

Meteor.startup(() => {
  const mqtt = require('mqtt');
  const MQTTClient = mqtt.connect('mqtt://localhost');

  MQTTClient.on('connect', () => {
    MQTTClient.subscribe('mictor-io.start');
    MQTTClient.subscribe('mictor-io.end');
  });

  MQTTClient.on('message', Meteor.bindEnvironment(function(topic, message){
      var jsonMessage = JSON.parse(message.toString())
      console.log(topic);
      if(topic === 'mictor-io.start') {
        console.log(jsonMessage.frame_id);
        Urinals.update(
          {id: jsonMessage.frame_id},
          {
            $set: { occupied: true },
          });
      } else if(topic === 'mictor-io.end') {
        Urinals.update(
          {id: jsonMessage.frame_id},
          {
            $set: { occupied: false },
          });
        Pees.insert(jsonMessage);
      }
    })
  );
});
