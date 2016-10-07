# mictor.io

## Introduction

An AirBnB for urinals at public toilets

## Description

What does it do?

mictor.io is a cloud based platform for managing public urinals usage. Based on the popular paper "The Urinal Problem" [1], mictor.io relies on a set of wireless modules places at each urinal to sense when a urinal is being used. Furthermore it uses an intuitive color system to tell the user which urinal to use by means of a color LED. Finnay a web-based app provides analytics with several metrics including:

  * Time spent at urinal (average, max, min)
  * Average distance from urinal
  * Most/least used urinal
  * Number of algorithm violations
  * Time of the day with most/least urinal usages

What's the audience?

Everyone who hates going to a crowded toilet! It's particularly useful for event managers (keep your toilet goers happy) and people who are particularly concerned about their privacy when using a urinal.

What technologies did we use?

Hardware
* ESP8266 running NodeMCU [2]
* HCSR04 Ultrasonic Raging Sensor
* MQTT for communication

Software
* Meteor + HTML + CSS
* Mosquitto for MQTT communication

## Team

 * Gonçalo Cabrita - Hardware (http://pixels.camp/goncabrita)
 * Henrique Macedo - Design/Front-end (http://pixels.camp/henriquemacedo)
 * Ricardo Cabrita - Hardware/Algorithm (http://pixels.camp/ricardocabrita)
 * Rui Chicória - Back-end (http://pixels.camp/rchicoria)

## Code repository

Hardware: http://github.com/rchicoria/mictor.io-firmware  
Software: https://github.com/rchicoria/mictor.io  
Live Preview: http://104.236.192.113:3000

[1]: http://people.scs.carleton.ca/~kranakis/Papers/urinal.pdf
[2]: http://www.nodemcu.com
