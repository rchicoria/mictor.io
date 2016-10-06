import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Urinals } from '/imports/collections/urinals'
import { Metrics } from '/imports/collections/metrics'


import './main.html';

Template.body.helpers({
  urinals() {
    return Urinals.find({});
  },
  metrics() {
    return Metrics.findOne({})
  }
});
//
// Template.urinal.helpers({
//   occupied() {
//     return Template.instance().counter.get();
//   },
// });
//
// Template.urinal.events({
//   'click button'(event, instance) {
//     // increment the counter when button is clicked
//     instance.counter.set(instance.counter.get() + 1);
//   },
// });
