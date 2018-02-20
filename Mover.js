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
  hasFoundExit() {
    return Maze.is(this.maze.getValueAt(this.position), Maze.EXIT);
  }
  leaveMaze() {
    console.log(`Found exit at: ${this.position}`);
    this.exitPosition.imitate(this.position);
    Object.freeze(this.exitedPosition);
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
    Object.defineProperty(this.visited, this.position.toString(), {});
  }

  findExitPath(DIRECTIONS = Direction.ALL()) {
    var randomIndex = Math.floor(Math.random() * DIRECTIONS.length);
    if (this.hasFoundExit()) {
      this.leaveMaze();
    } else if (DIRECTIONS.length > 0) {
      if (this.canMove(DIRECTIONS[randomIndex])) {
        this.moveTowardExit(DIRECTIONS[randomIndex]);
        if (this.hasFoundExit()) {
          this.leaveMaze();
        } else {
          this.findExitPath();
          if (this.hasFoundExit()) {
            this.leaveMaze();
          } else {
            this.position.undoLastMove();
          }
        }
      }
      DIRECTIONS.splice(randomIndex, 1);
      this.findExitPath(DIRECTIONS);
    }
  }
}