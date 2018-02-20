class Direction {
  static get RIGHT() {
    return {
      name : "right",
      value: [1,0],
      is : function(DIRECTION) {
        return this.name === DIRECTION.name
       }
     };
  }
  static get DOWN() {
    return {
      name : "down",
      value: [0,1],
      is : function(DIRECTION) {
        return this.name === DIRECTION.name
       }
     };
  }
  static get LEFT() {
    return {
      name : "left",
      value: [-1,0],
      is : function(DIRECTION) {
        return this.name === DIRECTION.name
       }
     };
  }
  static get UP() {
    return {
      name : "up",
      value: [0,-1],
      is : function(DIRECTION) {
        return this.name === DIRECTION.name
       }
     };
  }
  static is(DIRECTION1, DIRECTION2) {
    return DIRECTION1.name === DIRECTION2.name;
  }
  static getDIRECTION(direction) {
    var DIRECTIONS = Direction.ALL;
    return DIRECTIONS[DIRECTIONS.indexOf(direction)];
  }
  static ALL() {
    return Object.values(Object.getOwnPropertyDescriptors(Direction)).filter(
      (fn) => (
        typeof fn.get === "function" &&
        fn.name !== "ALL"
      )
    ).map(
      (n, i, arr) => n = n.get()
    );
  }
}
