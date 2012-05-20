Filter.methods = function(filters) {
  // If it's whitelisted and it's not blacklisted wrap the filter around the method
  var addFilter = function(filter) {
    // Extend it
    _.extend(filter, FilterHelpers);

    // Apply to `call` and `apply`
    filter.applyToMethods({
      call: Meteor.call,
      apply: Meteor.apply
    });
  };

  // Normalize and wrap Meteor methods with filters based on configuration
  filters = Filter._parseConfiguration(filters);
  _.each(filters, function (filter) {
    addFilter(filter);
  });
};
