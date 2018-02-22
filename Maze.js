class Maze {
  constructor(grid, startPosition = new Position(0,0)) {
    this.grid = grid;
    Object.defineProperty(this, "START_POSITION", {
      value : startPosition,
      writable : false
    });
    Object.defineProperty(this, "EXIT_POSITION", {
      value : this.loadEXIT_POSITION(),
      writable : false
    });
    Object.seal(this);
  }

  loadEXIT_POSITION() {
    var exit;
    this.grid.some((row, y) => {
      let x = row.findIndex(value => Cell.CELL(value).is(Cell.EXIT));
      if (x !== -1) {
        exit = new Position(x,y);
        return true;
      } 
    });
    return exit;
  }
  
  get indexOfLastColumn() {
    return this.grid[0].length - 1;
  }
  get indexOfLastRow() {
    return this.grid.length - 1;
  }
  getValueAt(position) {
    var cellValue = this.grid[position.y][position.x];
    if (Cell.CELL(cellValue).is(Cell.START)) {
      return Cell.START;
    }else if (Cell.CELL(cellValue).is(Cell.EXIT)) {
      return Cell.EXIT;
    } else if (Cell.CELL(cellValue).is(Cell.WALL)) {
      return Cell.WALL;
    } else if (Cell.CELL(cellValue).is(Cell.OPEN)) {
      return Cell.OPEN;
    } else {
      throw `ERROR: Unknown value ${cellValue} at ${position} in ${this.grid}`;
    }
  }
  isExit(position) {
    return this.getValueAt(position).value === Cell.EXIT.value;
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
  //TODO
  getDirectionTowardExit(position) {
    var angleToExit = position.getAngleTo(this.EXIT_POSITION);
    if (angleToExit >= 90) {
      
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
