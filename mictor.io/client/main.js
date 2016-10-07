import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Urinals } from '/imports/collections/urinals';
import { Metrics } from '/imports/collections/metrics';

import './main.html';

Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveVar();
  Meteor.subscribe('urinals');
  Meteor.subscribe('metrics');
});

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
    return Math.round(this.avg_time);
  },
  minTime() {
    return Math.round(this.min_time);
  },
  maxTime() {
    return Math.round(this.max_time);
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

// TOP URINAL
var barChartData = {
	labels : ["Urinal #1","Urinal #2","Urinal #3","Urinal #4","Urinal #5","Urinal #6"],
	datasets : [
		{
			fillColor : "rgba(19,192,149,.1)",
			strokeColor : "rgba(19,192,149,.2)",
			data : ["2","4","3","5","9","4"],
		}
	]
}

Template.rushhour.onRendered(function () {
  function initLineChart(data){
    return {
      labels : ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"],
      datasets : [
        {
          fillColor : "rgba(59,76,85,.4)",
          strokeColor : "rgba(59,76,85,1)",
          data: data
        },
      ]
    }
  };

  var lineChart = null;
  var ctx = document.getElementById("affluence_chart").getContext("2d");

  var chartData = Metrics.findOne().rush_hour_chart;

  var affluence_chart_data = initLineChart(chartData);

  lineChart = new Chart(ctx).Line(affluence_chart_data, {
		responsive: true,
    showScale: false,
    showTooltips: false,
    pointDot: false,
	});

  setInterval(function(){
    var chartData = Metrics.findOne().rush_hour_chart;

    var affluence_chart_data = initLineChart(chartData);
    lineChart.destroy();
    lineChart = new Chart(ctx).Line(affluence_chart_data, {
  		responsive: true,
      showScale: false,
      showTooltips: false,
      pointDot: false,
  	});
    console.log("AGAIN");
  }, 60*1000);
});


window.onload = function(){
  //var ctx = document.getElementById("affluence_chart").getContext("2d");
	var ctx2 = document.getElementById("top_urinal").getContext("2d");

  console.log(Metrics.findOne({}));

  // var affluence_chart_data = {
  // 	labels : ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"],
  // 	datasets : [
  //     {
  //       fillColor : "rgba(59,76,85,.4)",
  //       strokeColor : "rgba(59,76,85,1)",
  //       data: Metrics.findOne({}).rush_hour_chart
  //     },
  // 	]
  // }

  // window.myLine = new Chart(ctx).Line(affluence_chart_data, {
	// 	responsive: true,
  //   showScale: false,
  //   showTooltips: false,
  //   pointDot: false,
	// });

  window.myBar = new Chart(ctx2).Bar(barChartData, {
		responsive : true,
    showScale: false,
    showTooltips: false,
	});
}
