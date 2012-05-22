// Filter Meteor.methods

// Cache original method
Meteor._original_methods = Meteor.methods;
Meteor.methods = function(methods) {

  // Wrap methods so we can hook into filters at run time
  Filter.prepareMethods(methods);
  
  return Meteor._original_methods.call(this, methods);
};

