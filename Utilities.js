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
  static capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}