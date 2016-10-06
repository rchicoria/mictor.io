import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  const Pees = new Mongo.Collection('pees');

  Pees.before.insert(function (userId, doc) {
    doc.createdAt = Date.now();
  });

  const mqtt = require('mqtt');
  const MQTTClient = mqtt.connect('mqtt://localhost');

  MQTTClient.on('connect', () => {
    MQTTClient.subscribe('mictor-io.start');
    MQTTClient.subscribe('mictor-io.end');
  });

  MQTTClient.on('message', Meteor.bindEnvironment(function(topic, message){
      if(topic === 'mictor-io.start') {
      } else if(topic === 'mictor-io.end') {
          Pees.insert(JSON.parse(message.toString()));
      }
    })
  );
});
