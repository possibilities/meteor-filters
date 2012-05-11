Filter.methods = function(filters) {
  // If it's whitelisted and it's not blacklisted wrap the filter around the method
  var addFilter = function(filter) {
    _.each(['call', 'apply'], function(methodName) {
      var oldMethod = Meteor[methodName];
      var wrappedMethod = Filter._wrapHandler(oldMethod, filter, methodName);
      if (wrappedMethod) {
        Meteor[methodName] = wrappedMethod;
      }
    });
  };

  // Normalize and wrap Meteor methods with filters based on configuration
  filters = Filter._parseConfiguration(filters);
  _.each(filters, function (filter) {
    addFilter(filter);
  });
};
