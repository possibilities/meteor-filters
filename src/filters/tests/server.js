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
  
  var testResult = Meteor.call('testMethodDefinedInFuture', 'mcfly');
  test.equal(testResult, 'mcflyDelorianFunk');
});
