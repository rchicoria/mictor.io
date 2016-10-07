import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Urinals } from '/imports/collections/urinals';
import { Metrics } from '/imports/collections/metrics';

import './main.html';

Template.body.helpers({
  urinals() {
    return Urinals.find({});
  },
  metrics() {
    return Metrics.findOne({})
  }
});

Template.time.helpers({
  averageTime() {
    return Math.round(this.avg_time/1000);
  },
  minTime() {
    return Math.round(this.min_time/1000);
  },
  maxTime() {
    return Math.round(this.max_time/1000);
  },
})

Template.distance.helpers({
  avgDistance() {
    console.log("COISAS");
    return Math.round(this.avg_distance*100);
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
