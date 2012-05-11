Filter.methods = function(filters) {
  // If it's whitelisted and it's not blacklisted wrap the filter around the method
  var addFilter = function(filter) {
    _.each(Meteor.default_server.method_handlers, function(handler, methodName) {
      // Don't add the filter if...

      // Obey except/only
      // TODO: similar client logic in common
      if (
        Meteor.is_server
          &&
        (
          // It's not in the `only` list
          (filter.only && !_.contains(filter.only, methodName))
            ||
          // Or it's on the `except` list
          (filter.except && _.contains(filter.except, methodName))
        )
      ) {
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
