#!/usr/bin/env node

var request = require('request');
var colors = require('colors');
var program = require('commander');
var ProgressBar = require('progress');
var events = require('events');
var util = require('util');
var eventEmitter = new events.EventEmitter();
var settings = require('./settings');

var ses = settings.session;
var uri = settings.endpoint;

var Spyeye = function(email) {
  this.email = email;
}
Spyeye.prototype = {

  getToken: function() {
    var self = this;
    request(ses + this.email, function(error, response, data) {
      if (error) {
        console.log("ERROR " + error);
      };
      var data_token = JSON.parse(data);
      eventEmitter.emit('TOKEN', data_token.session_token, self);
    });
  },
  getData: function(token, self) {
    var options = {
      url: uri + self.email,
      headers: { 'X-Session-Token': token }
    }
    request(options, function(error, response, body) {
      var info = JSON.parse(body);
      eventEmitter.emit('READY', true);
      self.displayResult(info);
    });
  },
  displayResult: function(data) {
    if (data.error_code) {
      console.log("Rate limit exceeded".red);
      return;
    }
    console.log("\n");
    console.log("------------------------------------------------".green);
    console.log("--------------------RESULTS---------------------".green);
    console.log("------------------------------------------------".green + "\n");
    console.log("Personal info: ".green + "\n");
    console.log("Full name: ".cyan + data.contact.first_name + " " + data.contact.last_name);
    console.log("Nickname: ".cyan + data.contact.friendly_name);
    console.log("Location: ".cyan + data.contact.location);
    console.log("Organisations ".cyan + data.contact.organisation.title);

    console.log( "\n" + "Work:".green + "\n");
    for (var i = data.contact.occupations.length - 1; i >= 0; i--) {
      console.log(data.contact.occupations[i].job_title + " @ ".cyan + data.contact.occupations[i].company);
    };

    console.log( "\n" + "Person images ".green + "\n");
    for (var images = data.contact.images.length - 1; images >= 0; images--) {
      console.log(data.contact.images[images].service + " - " + data.contact.images[images].url);
    };

    console.log( "\n" + "Social media ".green + "\n");
    for (var member = data.contact.memberships.length - 1; member >= 0; member--) {
      console.log("Member in ".green + data.contact.memberships[member].site_name);
      console.log(" -username ".cyan + data.contact.memberships[member].username);
      console.log(" -profle ".cyan + data.contact.memberships[member].profile_url);
    };
    console.log("\n");
  }
}

program
  .version(require('./package.json').version)

program
  .command('find [email]')
  .description('Find by email address.')
  .action(function(email, options) {
    console.log("Searching for %s", email);

    var spy = new Spyeye(email);
    spy.getToken();
    eventEmitter.on('TOKEN', spy.getData);
    var bar = new ProgressBar('..Gathering data. (took :elapsed seconds)' , { total: 500 });

    eventEmitter.on('READY', function(value) {
      bar.complete = value;
    });

    var timer = setInterval(function () {
      bar.tick();
      if (bar.complete) {
        console.log("\n");
        clearInterval(timer);
      }
    }, 100);

});

program.parse(process.argv);
