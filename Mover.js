class Mover {
  constructor(maze) {
    this.maze = maze;
    this.reset();
    Object.seal(this);
  }
  get position() {
    return this._position;
  }
  set position(position) {
    this._position = position;
  }

  hasVisitedPosition(position) {
    return this.visited.hasOwnProperty(position);
  }
  flagPositionAsVisited() {
    return Object.defineProperty(this.visited, this.position.toString(), {});
  }
  whereIsTouchingExit() {
    return Direction.ALL().filter(
      DIRECTION => Maze.is(
        this.maze.getValueAt(this.position.peek(DIRECTION)),
        Maze.EXIT
      )
    );
  }
  hasFoundExit() {
    if (Maze.is(this.maze.getValueAt(this.position), Maze.EXIT)) {
      return true;
    } else {
      var DIRECTION = this.whereIsTouchingExit();
      if (DIRECTION.length) {
        this.moveTowardExit(DIRECTION[0]);
        return true;
      } else {
        return false;
      }
    }
  }
  leaveMaze() {
    console.log(`Found exit at: ${this.position}`);
    this.exitPosition.imitate(this.position);
    Object.freeze(this.exitPosition);
    return true;
  }
  isValidPosition(position) {
    return (
      this.maze.containsPosition(position) &&
      !Maze.is(this.maze.getValueAt(position), Maze.WALL) &&
      !this.hasVisitedPosition(position)
    );
  }
  isInValidPosition() {
    return this.isValidPosition(this.position);
  }
  canMove(DIRECTION) {
    return this.isValidPosition(
      this.position.peek(DIRECTION)
    );
  }
  moveTowardExit(DIRECTION) {
    this.position.onwardMove(DIRECTION);
    this.flagPositionAsVisited();
  }
  reset() {
    this.position = this.maze.START_POSITION.getNewInstance();
    this.exitPosition = new Position(-1, -1);
    this.visited = {};
    this.findingExit = false;
    Object.defineProperty(this.visited, this.position.toString(), {});
  }

  chooseNextDirection(DIRECTIONS) {
    var randomIndex = Utilities.weightedRandom(Array(DIRECTIONS.length).fill(1/DIRECTIONS.length));

    return DIRECTIONS[randomIndex];
  }
  findExitRecursively(DIRECTIONS = Direction.ALL()) {
    if (DIRECTIONS.length > 0) {
      let DIRECTION = this.chooseNextDirection(DIRECTIONS);
      if (this.canMove(DIRECTION)) {
        this.moveTowardExit(DIRECTION);
        if (this.hasFoundExit()) {
          return true;
        } else {
          this.findExitRecursively();
          if (this.hasFoundExit()) {
            return true;
          } else {
            this.position.undoLastMove();
          }
        }
      }
      DIRECTIONS.splice(DIRECTIONS.indexOf(DIRECTION), 1);
      return this.findExitRecursively(DIRECTIONS);
    }
  }
  findExitPath() {
    this.findingExit = true;
    if (this.findExitRecursively()) {
      this.leaveMaze();
      this.findingExit = false;
    }
  }
}
