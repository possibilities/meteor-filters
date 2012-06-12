# Middleware Filters for Meteor

Middleware filters for Meteor.methods and friends

## What problem does this solve?

The whole point of this library is to avoid boilerplate code and duplication. Let's say you have some `Meteor.methods` that looks like this:

    Meteor.methods({

      // I hope my bank is more secure than this!
      withdraw: function(bankAccountNumber, amount) {
        if (!bankAccountNumber) {
          throw Meteor.Error(500, "Gotta have an account number silly!");
        }
        // etc...
      },

      // Save some money fool!
      deposit: function(bankAccountNumber, amount) {
        if (!bankAccountNumber) {
          throw Meteor.Error(500, "Gotta have an account number silly!");
        }
        // etc...
      }
    });

And on the client you're calling withdraw like:

    var bankAccountNumber = Session.get('bankAccountNumber');
    Meteor.call('withdraw', bankAccountNumber, 1);

And somewhere else on the client you're calling deposit like:    

    var bankAccountNumber = Session.get('bankAccountNumber');
    Meteor.call('deposit', bankAccountNumber, 2);

Lots of boilerplate. Lots of duplication. Right?

## The filter solution!

When you write and apply a filter your server code becomes:

    Meteor.methods({

      withdraw: function(amount) {
        // etc...
      },

      deposit: function(amount) {
        // etc...
      }
    });

And your client code becomes:

    Meteor.call('withdraw', 1);
    Meteor.call('deposit', 2);

Nice, eh?

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
      var countForPerson = Counts.findOne({ name: name })
      if (countForPerson) {
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

If you only have one filter just slap it in there in all it's scalar glory

    Filter.methods(howdyFilter);

    Filter.methods({ handler: howdyFilter, only: 'southernMethod' });

### Call handlers

Being able to apply filters to `Meteor.methods` that do common work is helpful but sometimes you'll find that when you're making calls from the client using `Meteor.call` and `Meteor.apply` you end up with boilerplate code that prepares the arguments. Call handlers help by letting you define this behavior as a filter that gets applied when you invoke `Meteor.call` and `Meteor.apply`. Think of the bank example where every `Meteor.call` needs the to get the bank account number from the environment and every `Meteor.method` needs to verify the account number. Your filter setup might look like this:

    Filter.methods([
      {
        handler: verifyAccountNumber,
        callHandler: prependAccountNumberToArguments
      }
    ]);

Some libraries, like session management or analytics, for example, can use this feature to add transparent functionality to all (or some) functionality by adding arguments with a call handler and removing them with the method handler before they reach the actual `Meteor.method`.

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

Returning nothing causes the current filter's arguments to be passed on as-is making these equivalent:

    var myFilter4 = function(a, b, c) {
      // do something!
    };

    var myFilter5 = function(a, b, c) {
      // do something!
      return _.toArray(arguments);
    };

## TODO

Think more about client side method stubs, right now it's a problem because we're using Filter.methods to filter Meteor.call/apply

Make the examples suck a lot less
