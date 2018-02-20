class Direction {
  static directionFunctions() {
    return {
      is : function(DIRECTION) {
        return this.name === DIRECTION.name
      }
    }
  }
  static createDIRECTION(name, value) {
    var DIRECTION = Object.create(Direction.directionFunctions(), {
      "value" : {
       "value" : value,
       "enumerable" : true,
       "writable" : false
      },
      "name" : {
        "value" : name,
       "enumerable" : true,
       "writable" : false
      }
    });
    return DIRECTION;
  }
  static get RIGHT() {
    return Direction.createDIRECTION("right", [1,0]);
  }
  static get DOWN() {
    return Direction.createDIRECTION("down", [0,1]);
  }
  static get LEFT() {
     return Direction.createDIRECTION("left", [-1,0]);
  }
  static get UP() {
     return Direction.createDIRECTION("up", [0,-1]);
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
