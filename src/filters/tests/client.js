// Tests

var addFunkFilter = function(funk, next) {
  this.next("funkyFunkyFunk" + funk);
};

Filter.methods([
  addFunkFilter, { only: 'testMethod' }
]);

testAsyncMulti("filters - client", [
  function(test, expect) {
    // Should apply client and server side filters
    var ensureValueIsFiltered = expect(function(err, result) {
      test.equal(result, 'funkyFunkyFunkIsTheRealFuffFunk');
    });
    Meteor.call('testMethod', 'IsTheReal', ensureValueIsFiltered);
  },
  function(test, expect) {
    // Just make sure you it can be called without a callback
    var result = Meteor.call('testMethod', 'IsTheReal');
    test.isUndefined(result);
  },

  // Make sure it doesn't get wrapped because it's not on the `only` list
  function(test, expect) {
    Meteor.call('echoArgument', 'NoWrap!', expect(function(err, result) {
      test.equal(result, 'NoWrap!');
    }));
  }
]);
