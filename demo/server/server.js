// Setup

Meteor.startup(function() {
  if (Counts.find({}).count() === 0) {
    Counts.insert({ name: 'Mike', count: 0 });
    Counts.insert({ name: 'Yngwie', count: 0 });
    Counts.insert({ name: 'Rebecca', count: 0 });
  }
});

// Publish data

Meteor.publish('counts', function () {
  return Counts.find({});
});

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

Filter.methods([
  countFilter,
  helloFilter, { only: 'echoYngwie' },
  howdyFilter, { only: 'echoRebecca' }
]);
