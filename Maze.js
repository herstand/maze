class Maze {
  constructor(grid, startPosition = new Position(0,0)) {
    this.grid = grid;
    Object.defineProperty(this, "_START_POSITION", {
      value : startPosition,
      writable : false
    });
    Object.seal(this);
  }

  get START_POSITION() {
    return this._START_POSITION;
  }
  static is(SPOT1, SPOT2) {
    return +SPOT1 == +SPOT2; // 2 == {valueOf : () => 2}, +{valueOf : () => 2} == +{valueOf : () => 2}
  }
  static get START() {
    return {
      valueOf : () => 4,
      name : "START",
      toString : function() { return "S"; }
    }
  }
  static get EXIT() {
    return {
      valueOf : () => 2,
      name : "EXIT",
      toString : function() { return "E"; }
    };
  }
  static get WALL() {
    return {
      valueOf : () => 1,
      name : "WALL",
      toString : function() { return "W"; }
    };
  }
  static get OPEN() {
    return {
      valueOf : () => 0,
      name : "OPEN",
      toString : function() { return "O"; }
    };
  }
  get indexOfLastColumn() {
    return this.grid[0].length - 1;
  }
  get indexOfLastRow() {
    return this.grid.length - 1;
  }
  getValueAt(position) {
    var posVal = this.grid[position.y][position.x];
    if (Maze.is(posVal,Maze.START)) {
      return Maze.START;
    }else if (Maze.is(posVal,Maze.EXIT)) {
      return Maze.EXIT;
    } else if (Maze.is(posVal,Maze.WALL)) {
      return Maze.WALL;
    } else if (Maze.is(posVal,Maze.OPEN)) {
      return Maze.OPEN;
    } else {
      throw `ERROR: Unknown value ${posVal} at ${position} in ${this.grid}`;
    }
  }
  isExit(position) {
    return this.getValueAt(position).value === Maze.EXIT.value;
  }

  containsPosition(position) {
    return (
      position.x >= 0 &&
      position.x <= this.indexOfLastColumn &&
      position.y >= 0 &&
      position.y <= this.indexOfLastRow
    );
  }
  getDirectionOfPerimeterFrom(position) {
    if (!this.containsPosition(position.peek(Direction.UP))) {
      return Direction.UP;
    } else if (!this.containsPosition(position.peek(Direction.RIGHT))) {
      return Direction.RIGHT;
    } else if (!this.containsPosition(position.peek(Direction.DOWN))) {
      return Direction.DOWN;
    } else if (!this.containsPosition(position.peek(Direction.LEFT))) {
      return Direction.LEFT;
    }
  }
  toString() {
    return this.grid.reduce(
      (outputString, val, i, arr) =>
        outputString += `[${val.toString()}]` +
          ((arr.length > i + 1) ? "\n" : "")
      ,
      "");
  }
}