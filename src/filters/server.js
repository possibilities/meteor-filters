Filter.methods = function(filters) {
  var self = this;
  // Cache them so we can apply them to `Meteor.methods` defined in the future
  this._filters = this._filters || [];

  // Normalize and wrap Meteor methods with filters based on configuration
  filters = Filter._parseConfiguration(filters);
  _.each(filters, function(filter) {
    // Cache it
    self._filters.push(filter);
    // Apply it
    filter.applyToMethods(Meteor.default_server.method_handlers);
  });
};

// Apply to `Meteor.methods` that were defined after the filters were added
var originalMethods = Meteor.methods;
Meteor.methods = function(methods) {
  var result = originalMethods.apply(this, arguments);

  if (Filter._filters) {
    _.each(Filter._filters, function(filter) {
      filter.applyToMethods(methods);
    });
  }

  return result;
};
