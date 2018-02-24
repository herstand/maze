class Utilities {
  static NewArrayInstance(arr) {
    return JSON.parse(JSON.stringify(arr));
  }
  static ifTrueThenRunNext(...functionList) {
    return functionList.every(
      function(booleanReturnFunction){
        return booleanReturnFunction.call(this);
      },
      this
    );
  }
  static runAll(obj, ...args) {
    args.forEach(fnObj => obj[fnObj.fn](...fnObj.args));
  }
  static capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  static triangularNumber(value) {
    var abs = Math.abs(value);
    return ((abs / 2) * (abs + 1)) * (abs / value) || 0;
  }
  static weightedRandom(weightedList) {
    var sum = 0,
      r = Math.random();
    for (let i in weightedList) {
      sum += weightedList[i];
      if (r <= sum) return i;
    }
    return 0;
  }
}