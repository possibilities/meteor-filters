var Filter = Filter || {};

// FilterHelpers

FilterHelpers = {
  appliesTo: function(methodName) {
    // Notice we're negating the whole this
    return !(
      // It's not in the `only` list
      (this.only && !_.contains(this.only, methodName))
        ||
      // Or it's on the `except` list
      (this.except && _.contains(this.except, methodName))
    );
  },  
  
  applyToMethods: function(methods) {
    var self = this;
    _.each(methods, function(method, methodName) {

      // Obey except/only on server (we figure out client at run time)
      if (Meteor.is_server && !self.appliesTo(methodName)) {
        return false;
      }

      // Bookkeeping
      self.registerForMethod(methodName);

      // Wrap original method
      var wrappedMethod = Filter._wrapHandler(method, self, methodName);
      if (wrappedMethod) {
        if (Meteor.is_server) {
          Meteor.default_server.method_handlers[methodName] = wrappedMethod;
        } else {
          Meteor[methodName] = wrappedMethod;
        }
      }
    });
  },
  registerForMethod: function(methodName) {
    Filter._registry = Filter._registry || {};
    Filter._registry[methodName] = Filter._registry[methodName] || {};
    Filter._registry[methodName].firstFilter = this._id;
    if (!Filter._registry[methodName].lastFilter) {
      Filter._registry[methodName].lastFilter = this._id;
    }
  },
  isLastForMethod: function(methodName) {
    if (Filter._registry && Filter._registry[methodName]) {
      return Filter._registry[methodName].lastFilter === this._id;
    }
  }
};

// Makes an array from a scalar unless it's undefined
Filter._makeArrayOrUndefined = function(val) {
  var arrayVal = val;
  if (!_.isUndefined(arrayVal) && !_.isArray(arrayVal)) {
    arrayVal = [arrayVal];
  }
  return arrayVal;
};

Filter._parseConfiguration = function(filters) {
  // Munge filter setup info so we can do cool shorthand configuration tricks
  var handler, next;
  var normalized = [];

  while (filter = filters.shift()) {
    next = filters.shift();
    // Allow passing in a filter handler followed by a configuration literal
    if (_.isFunction(filter) && !_.isUndefined(next) && !_.isFunction(next) && _.isUndefined(next['filter'])) {
      handler = filter;
      next['handler'] = handler;
      filter = next;
    } else {
      // Otherwise just put it back
      filters.unshift(next);
    }
    // Allow passing in a filter method without any configuration
    if (_.isFunction(filter)) {
      filter = { handler: filter };
    }
    // Allow scalar values for `except` and `only` configuration
    filter.except = Filter._makeArrayOrUndefined(filter.except);
    filter.only = Filter._makeArrayOrUndefined(filter.only);

    // Something to grab onto
    filter._id = Meteor.uuid();

    // Extend it
    _.extend(filter, FilterHelpers);

    // Ok, it's ready
    normalized.unshift(filter);
  }
  return normalized;
};

Filter._wrapHandler = function(handler, filter, name) {
  // TODO: this lives in multiple places
  var isDataRoute = /^\/\w*\/(insert|update|remove)$|^.*tinytest.*$/i;

  if (isDataRoute.test(name)) {
    return;
  }

  return function() {
    var returnValue, val, callback, methodName;
    var argumentsArray = _.toArray(arguments);

    // Get the current method name
    methodName = Meteor.is_server ? name : argumentsArray.shift();

    // Don't mess around w/ it if it's one of Meteor's magic data methods
    if (isDataRoute.test(methodName)) {
      return handler.apply(this, arguments);
    }

    // Obey except/only on client (we figure out server at startup)
    if (Meteor.is_client && !filter.appliesTo(methodName)) {
      return handler.apply(this, arguments);
    }

    // Shortcut to current filter
    var currentFilter = Filter._registry[name];
    // Build new context if this is the first filter in chain
    if (!currentFilter.context) {
      currentFilter.context = {};
      // A convenience method that we give to the filter for returning stuff
      currentFilter.context.next = function() {
        currentFilter.context.returnValue = _.toArray(arguments);
      };
    }
    
    // On the client we have to perform major surgery on
    // arguments before and after the filter runs
    // TODO: figure out how to do less at runtime
    if (Meteor.is_client) {
      
      // Hold onto the callback for later
      callback = argumentsArray.pop();
      // If it's not a function put it back
      if (!_.isFunction(callback)) {
        argumentsArray.push(callback);
      }

      // Add the `next` convenience method to the end of the 
      // filter's call arguments
      argumentsArray.push(currentFilter.context.next);

      // Run the filter finally!
      returnValue = filter.handler.apply(currentFilter.context, argumentsArray);

      // Get rid of next convenience method
      if (_.isFunction(callback)) {
        argumentsArray.splice(-2, 1);
      }

      // Figure out the results of the filter regardless of
      // how the results are returned
      val = (currentFilter.context.returnValue || returnValue);
      
      // If the results aren't an array make it so
      argumentsArray = Filter._makeArrayOrUndefined(val);

      // Put the callback back if there's one
      if (_.isFunction(callback)) {
        argumentsArray.push(callback);
      }

      // Get the method name back in front of the other arguments
      argumentsArray.unshift(methodName);
    } else {
      // Put `next` convenience method at the end the filter's call arguments
      argumentsArray.push(currentFilter.context.next);

      // Apply the filter
      returnValue = filter.handler.apply(currentFilter.context, argumentsArray);

      // Figure out the results of the filter regardless of
      // how the results are returned
      val = (currentFilter.context.returnValue || returnValue);
      // If the results aren't an array make it so
      argumentsArray = Filter._makeArrayOrUndefined(val);
    }

    // Get the result from the real wrapped method
    var ret = handler.apply(currentFilter.context, argumentsArray);

    // Clear the context if we're done
    if (filter.isLastForMethod(name)) {
      delete currentFilter.context;
    }

    // Wheh! Return the wrapped filter
    return ret;
  };
};
