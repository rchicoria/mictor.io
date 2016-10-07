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
  averageDistance() {
    return Math.round(this.avg_distance*100);
  }
});

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

// AFFLUENCE CHART
var lineChartData = {
	labels : ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"],
	datasets : [
    {
      fillColor : "rgba(59,76,85,.4)",
      strokeColor : "rgba(59,76,85,1)",
      data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56],
    },
	]
}

window.onload = function(){
	var ctx = document.getElementById("canvas").getContext("2d");
	window.myLine = new Chart(ctx).Line(lineChartData, {
		responsive: true,
    showScale: false,
    showTooltips: false,
    pointDot: false,
	});
}
