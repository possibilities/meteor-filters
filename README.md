# Middleware filters for Meteor.methods

Middleware for `Meteor.methods`.

## Demo

[Check it out](http://filters.meteor.com/)

Kinda pointless, just exercises the code. See code for demo below.

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
