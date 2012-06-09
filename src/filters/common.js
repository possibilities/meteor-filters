var Filter = { _registry: {} };

// Prepare target `Meteor.methods` for filtering
Filter.prepareMethods = function(methods) {
  var self = this;
  var methodObj;

  // Wrap methods so we can hook into filters at run time
  _.each(methods, function(method, methodName) {

    // Figure out where the wrapped method should be assigned
    methodObj = Meteor.is_server ? methods : Meteor;
  
    // Wrap method
    methodObj[methodName] = self._wrapMethod(method, methodName);
  });
};

// Apply the actual filters (at run time)
Filter.applyFilters = function(methodName, args) {
  var callback;
  var self = this;
  var filters = Filter._registry[methodName].filters;

  // On the client the call method name is dynamic
  var callMethod = Meteor.is_client ? args.shift() : methodName;

  // A method for catching return value from filter
  self.next = function next() {
    self._returnValue = _.toArray(arguments);
    return self._returnValue;
  };

  // On the client we need to mess around with args
  if (Meteor.is_client) {

    // Hold onto the callback for later
    callback = args.pop();

    // If it's not a function put it back
    if (!_.isFunction(callback))
      args.push(callback);

  }        

  // Put `next` convenience method at the end the filter's call arguments
  args.push(self.next);

  // Apply each filter
  _.each(filters, function(filter) {

    // If we're on the server we've know the filter applies, on the client
    // we have to check at runtime
    if (Meteor.is_client && !filter.appliesTo(callMethod))
      return;

    // Keep track of previous args in case filter returns nothing
    var beforeArgs = _.clone(args);

    args = filter.handler.apply(self, args);

    // Get next args from
    //    1) next() ret value, or
    //    2) filter ret value, or
    //    3) pass on the orignal args
    if (self._returnValue)
      args = self._returnValue;
    else
      args = _.isBoolean(args) ? args : (args || beforeArgs);

    // Clear out the previous value
    delete self._returnValue;

    // Make sure we have an array and not a scalar
    if (_.isArguments(args))
      args = _.toArray(args);

    // Make sure we have an array and not a scalar
    if (!_.isArray(args))
      args = [args];
  });

  // Get rid of `next` convenience method if it's still hanging around
  if (_.last(args) === self.next)
    args.pop();

  // On the client we need to undo the work on args we did eariler
  if (Meteor.is_client) {

    // Put the callback back if there's one
    if (_.isFunction(callback))
      args.push(callback);

    // Get the method name back in front of the other arguments
    args.unshift(callMethod);
  }

  // Return the args and self to be used by the target method
  return {
    args: args,
    context: self
  };
};

// Every time we add more method filters we need to push them 
// into the _filters so we can get them later
Filter.methods = function(filters) {
  this._filters = this._filters || [];
  this._filters.unshift(this._parseConfiguration(filters));
  this._filters = _.flatten(this._filters);
};

// Load the method's filters, we run this only the first time
// the method gets executed
Filter.loadFilters = function(methodName) {
  var self = this;

  // We haven't loaded this method's filters yet
  if (!self._registry[methodName]) {

    // Default registry entry
    self._registry[methodName] = self._registry[methodName] || {
      filters: []
    };

    // Add each method filter for the method to the registry
    _.each(self._filters, function(filter, index) {
      
      // If we're on the server we check that the filter should apply to method,
      // on the client we do this at runtime
      if (Meteor.is_client || filter.appliesTo(methodName))
        self._registry[methodName].filters.unshift(filter);

    });
  }
};

// Makes an array from a scalar unless it's undefined
Filter._makeArrayOrUndefined = function(val) {
  var arrayVal = val;
  if (_.isDefined(arrayVal) && !_.isArray(arrayVal))
    arrayVal = [arrayVal];

  return arrayVal;
};

// Instrument the method so that it loads and applies filters to
// itself at runtime.
Filter._wrapMethod = function _wrapMethod(method, methodName) {
  var self = this;

  // return wrapped method
  return function() {
    var args = _.toArray(arguments);
    var callMethod = Meteor.is_client ? _.first(args) : methodName;

    // Damn shame we have to do this here but I don't see any other
    // way to have tests not broken
    if (callMethod === 'tinytest/run')
      return method.apply(this, args);

    // If we haven't already, load the filters for this method
    self.loadFilters(methodName);
    
    // Do the actual business of running each filter
    var ret = self.applyFilters.call(this, methodName, args);
    
    // Run the original method with the filtered context and arguments
    return method.apply(ret.context, ret.args);
  };
};

// Munge filter setup info so we can do cool shorthand configuration tricks
Filter._parseConfiguration = function(filters) {
  var self = this;
  var handler, next;
  var normalized = [];
  filters = this._makeArrayOrUndefined(filters);

  while (filter = filters.shift()) {
    // Peek at the the next filter
    next = filters.shift();

    // Allow passing in a filter handler followed by a configuration literal
    if (_.isFunction(filter)
        && _.isDefined(next)
        && !_.isFunction(next)
        && _.isUndefined(next.filter)) {

      // Merge em'
      handler = filter;
      next.handler = handler;
      filter = next;

    // Otherwise just put it back
    } else {
      filters.unshift(next);
    }

    // Allow passing in a filter method without any configuration
    if (_.isFunction(filter))
      filter = { handler: filter };

    // Allow scalar values for `except` and `only` configuration
    filter.except = self._makeArrayOrUndefined(filter.except);
    filter.only = self._makeArrayOrUndefined(filter.only);

    // Extend it
    _.extend(filter, FilterHelpers);

    // Ok, it's ready
    normalized.unshift(filter);
  }

  return normalized;
};

// Helpers
FilterHelpers = {

  // Check if a filter aught to be applied to a method
  appliesTo: function(methodName) {

    // Notice we're negating the whole this
    return !(

      // It's not in the `only` list
      (this.only && !_.contains(this.only, methodName))
        ||
      // Or it's on the `except` list
      (this.except && _.contains(this.except, methodName))
    );
  }
};
