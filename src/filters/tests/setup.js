var testMethod = function(funk) {
  return funk + 'Funk';
};

Meteor.methods({
  testMethod: testMethod,
  testMethodCallsNext: testMethod,
  testMethodReturnsNext: testMethod,
  testMethodReturnsArguments: testMethod,
  testMethodMultiFilters: testMethod,
  echoArgument: function(funk) {
    return funk;
  }
});

var testFilter = function(funk) {
  return funk + 'Fuff';
};

var testFilterCallsNext = function(funk, next) {
  next(funk + 'Buff');
};

var testFilterReturnsNext = function(funk, next) {
  return next(funk + 'Puff');
};

var testFilterReturnsArguments = function(funk, next) {
  return funk + 'Duff';
};

var testFilterForMethodDefinedInFuture = function(funk, next) {
  return funk + 'Delorian';
};

var testFilterMultiFilters1 = function(funk, next) {
  return funk + '1';
};
var testFilterMultiFilters2 = function(funk, next) {
  return funk + '2';
};
var testFilterMultiFilters3 = function(funk, next) {
  return funk + '3';
};

Filter.methods([
  testFilter, { only: 'testMethod' },
  testFilterCallsNext, { only: 'testMethodCallsNext' },
  testFilterReturnsNext, { only: 'testMethodReturnsNext' },
  testFilterReturnsArguments, { only: 'testMethodReturnsArguments' },
  testFilterMultiFilters1, { only: 'testMethodMultiFilters' },
  testFilterMultiFilters2, { only: 'testMethodMultiFilters' },
  testFilterMultiFilters3, { only: 'testMethodMultiFilters' },
  testFilterForMethodDefinedInFuture, { only: 'testMethodDefinedInFuture' }
]);

Meteor.methods({
  testMethodDefinedInFuture: testMethod
});
