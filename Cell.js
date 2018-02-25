var Cell = (function(cellTypes){

class Cell {
  static cellFunctions() {
    return {
      is : function(CELL) {
        return Object.is(+this,+CELL);
      }
    }
  }
  static createCELL(value) {
    return Object.create(Cell.cellFunctions(), {
      "valueOf" : {
       "value" : () => parseInt(value),
       "enumerable" : true,
       "writable" : false
      },
      "name" : {
        "value" : cellTypes[value],
       "enumerable" : true,
       "writable" : false
      }
    });
  }
  static CELL(value) {
    return typeof value === "number" ? Cell.createCELL(value) : value;
  }
}

Object.entries(cellTypes).forEach(([value,name]) => Cell[name] = Cell.createCELL(value));

return Cell;

})({4 : "START", 2 : "EXIT", 1 : "WALL", 0 : "OPEN"});