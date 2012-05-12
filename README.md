# Middleware Filters for Meteor

Filters for Meteor.methods on the server and Meteor.call and Meteor.apply on the client.

[Check out the demo!](http://filters.meteor.com/)

The demo is pointless... just exercises the code. See code for demo below.

## Installation

First download it and add it to your Meteor packages

Now add it to your app

    meteor add filters

## Usage

### Setup your `Meteor.methods`, nothing new!

    Meteor.methods({
      echoMike: function(text) {
        return text;
      },
      echoRebecca: function(text) {
        return text;
      },
      echoYngwie: function(text) {
        return text;
      }
    });

### Next, define some filters

    var helloFilter = function(name) {
      return '<strong>Hello</strong> ' + name + '!';
    };

    var howdyFilter = function(name) {
      return '<strong>Howdy</strong> ' + name + '!';
    };

    var countFilter = function(name) {
      var person = Counts.findOne({ name: name })
      if (person) {
        Counts.update({ name: name }, { $inc: { count: 1 } })
      } else {
        Counts.insert({ name: name, count: 1 })
      }
      return name;
    };

### Finally, configure `Meteor.methods` to use your filters

    Filter.methods([
      countFilter,
      helloFilter, { only: 'echoYngwie' },
      howdyFilter, { only: 'echoRebecca' }
    ]);

    // Or like this if you prefer
    // Filter.methods([
    //   { handler: countFilter },
    //   { handler: helloFilter, only: 'echoYngwie' },
    //   { handler: howdyFilter, only: 'echoRebecca' }
    // ]);
