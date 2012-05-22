# Middleware Filters for Meteor

Filters for `Meteor.methods` on the server and `Meteor.call` and `Meteor.apply` on the client.

## Summary

TODO

## Usage

### Server-side

Setup your `Meteor.methods`, nothing new!

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

Next, define some filters

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

Finally, configure `Meteor.methods` to use your filters

    Or like this if you prefer
    Filter.methods([
      { handler: countFilter },
      { handler: helloFilter, only: 'echoYngwie' },
      { handler: howdyFilter, only: 'echoRebecca' }
    ]);

Or if you prefer you can use this *sexier*(?) syntax

    Filter.methods([
      countFilter,
      helloFilter, { only: 'echoYngwie' },
      howdyFilter, { only: 'echoRebecca' }
    ]);

If you have just one filter just slap it in there in all it's scalar glory

    Filter.methods(howdyFilter);

    Filter.methods({ handler: howdyFilter, only: 'southernMethod' });

### Client-side

TODO

### Writing filters (client or server)

#### Return values

When you write a filter the idea is that it receives the arguments intended for the target `Meteor.method` and then it either passes those arguments to the next filter and eventually to the target `Meteor.method`. `Filter.methods` is very flexible about how how the next filter is called, these are all equivalent:

    var myFilter1 = function(a, b, c) {
      // do something!
      return [a, b, c];
    };

    var myFilter2 = function(a, b, c, next) {
      // do something!
      next(a, b, c);
    };

    var myFilter3 = function(a, b, c, next) {
      // do something!
      return next(a, b, c);
    };

If you return nothing causes the current filters arguments to be passed on as-is making these equivalent:

    var myFilter4 = function(a, b, c) {
      // do something!
    };

    var myFilter5 = function(a, b, c) {
      // do something!
      return _.toArray(arguments);
    };
