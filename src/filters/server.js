Filter.methods = function(filters) {
  // If it's whitelisted and it's not blacklisted wrap the filter around the method
  var addFilter = function(filter) {
    _.extend(filter, FilterHelpers);
    _.each(Meteor.default_server.method_handlers, function(handler, methodName) {
      // Obey except/only on server (we figure out client at run time)
      if (Meteor.is_server && !filter.appliesTo(methodName)) {
        return false;
      }

      var wrappedMethod = Filter._wrapHandler(handler, filter, methodName);
      if (wrappedMethod) {
        Meteor.default_server.method_handlers[methodName] = wrappedMethod;
      }
    });
  };

  // Normalize and wrap Meteor methods with filters based on configuration
  filters = Filter._parseConfiguration(filters);
  _.each(filters, function (filter) {
    addFilter(filter);
  });
};
