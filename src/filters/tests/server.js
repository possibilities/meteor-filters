Tinytest.add("filters - server", function (test) {
  var testResult = Meteor.call('testMethod', 'fuffy');
  test.equal(testResult, 'fuffyFuffFunk');
  
  var testResult = Meteor.call('testMethodCallsNext', 'buffy');
  test.equal(testResult, 'buffyBuffFunk');
  
  var testResult = Meteor.call('testMethodReturnsNext', 'puffy');
  test.equal(testResult, 'puffyPuffFunk');
  
  var testResult = Meteor.call('testMethodReturnsArguments', 'duffy');
  test.equal(testResult, 'duffyDuffFunk');
  
  var testResult = Meteor.call('testMethodMultiFilters', 'fraggleRock');
  test.equal(testResult, 'fraggleRock123Funk');
  
  // Multi filters should execute in the correct order even if they're
  // added to Filter.methods at different times
  var testResult = Meteor.call('testMultiFiltersSeperateDeclarations', 'newWave');
  // test.equal(testResult, 'newWave12Funk');
  
  var testResult = Meteor.call('testMethodDefinedInFuture', 'mcfly');
  test.equal(testResult, 'mcflyDelorianFunk');
  
  // Filters should share a context so if you assign something to this.myAttribute
  // it should be available in the next filter
  var testResult1 = Meteor.call('testMethodMultiFilterContext', 'yngwie');
  var testResult2 = Meteor.call('testMethodMultiFilterContext', 'yngwie');
  var expected = 'yngwieMunkPunkPumpFunk';
  // Make sure we get the same result both time, otherwise we might be accumulating
  // context between calls
  test.equal(testResult1, expected);
  test.equal(testResult2, expected);
});
