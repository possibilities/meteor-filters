Filter.methods = function(filters) {
  // Normalize and wrap Meteor methods with filters based on configuration
  filters = Filter._parseConfiguration(filters);
  _.each(filters, function (filter) {
    // Apply to `call` and `apply`
    filter.applyToMethods({
      call: Meteor.call,
      apply: Meteor.apply
    });
  });
};
