// Subscriptions

Meteor.subscribe('counts');

// Setup

Meteor.startup(function() {
  Session.set('echoName');
});

// Template helpers

Template.filtersDemo.echoedName = function () {
  return Session.get('echoName');
};

Template.filtersDemo.counts = function () {
  return Counts.find({}).fetch();
};

// Events

Template.filtersDemo.events = {
  'click input' : function (e) {
    var person = $(e.target).attr('id');
    Meteor.call('echo' + person, person, function(err, name) {
      if (!err) {
        Session.set('echoName', name);
        $('.echoed').show();
        Meteor.setTimeout(function() {
          $('.echoed').fadeOut('fast');
        }, 1500);
      }
    });
  }
};
