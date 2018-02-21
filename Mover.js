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

  whereIsTouchingExit() {
    return Direction.ALL().filter(
      DIRECTION => Maze.is(
        this.maze.getValueAt(this.position.peek(DIRECTION)),
        Maze.EXIT
      )
    );
  }
  hasFoundExit() {
    return Maze.is(this.maze.getValueAt(this.position), Maze.EXIT);
  }
  leaveMaze() {
    console.log(`Found exit at: ${this.position}`);
    this.exitPosition.imitate(this.position);
    Object.freeze(this.exitPosition);
    return true;
  }
  isValidPosition(position, visited) {
    return (
      this.maze.containsPosition(position) &&
      !Maze.is(this.maze.getValueAt(position), Maze.WALL) &&
      !visited.hasOwnProperty(position)
    );
  }
  canMove(DIRECTION, visited) {
    return this.isValidPosition(
      this.position.peek(DIRECTION), 
      visited
    );
  }

  reset() {
    this.position = this.maze.START_POSITION.getNewInstance();
    this.exitPosition = new Position(-1, -1);
  }

  chooseNextDirection(DIRECTIONS) {
    var randomIndex = -1,
    directionWeights = Array(DIRECTIONS.length).fill(0);
    if (
      this.position.x > Math.ceil(this.maze.grid[0].length / 2) && 
      DIRECTIONS.find(dir => dir.is(Direction.LEFT))
    ) {
      directionWeights[DIRECTIONS.findIndex(dir => dir.is(Direction.LEFT))] = .5;
    } else if (
      this.position.x <= Math.ceil(this.maze.grid[0].length / 2) &&
      DIRECTIONS.find(dir => dir.is(Direction.RIGHT))
    ) {
      directionWeights[DIRECTIONS.findIndex(dir => dir.is(Direction.RIGHT))] = .5;
    } 
    if (
      this.position.y > Math.ceil(this.maze.grid.length / 2) &&
      DIRECTIONS.find(dir => dir.is(Direction.UP))
    ) {
      directionWeights[DIRECTIONS.findIndex(dir => dir.is(Direction.UP))] = .5;
    } else if (
      this.position.y <= Math.ceil(this.maze.grid.length / 2) &&
      DIRECTIONS.find(dir => dir.is(Direction.DOWN))
    ) {
      directionWeights[DIRECTIONS.findIndex(dir => dir.is(Direction.DOWN))] = .5;
    }
    randomIndex = Utilities.weightedRandom(directionWeights);
    return DIRECTIONS[randomIndex];
  }

  findExitPath() {
    var visited = {};
    var moveTowardExit = DIRECTION => {
      this.position.onwardMove(DIRECTION);
      Object.defineProperty(visited, this.position.toString(), {}); 
    }
    var findExitRecursively = (DIRECTIONS = Direction.ALL()) => {
      if (DIRECTIONS.length > 0) {
        let DIRECTION = this.chooseNextDirection(DIRECTIONS);
        if (this.canMove(DIRECTION, visited)) {
          let exitDIRECTION = this.whereIsTouchingExit();
          if (exitDIRECTION.length) {
            moveTowardExit(exitDIRECTION[0]);
            return true;
          }
          moveTowardExit(DIRECTION);
          if (this.hasFoundExit()) {
            return true;
          } else {
            findExitRecursively();
            if (this.hasFoundExit()) {
              return true;
            } else {
              this.position.undoLastMove();
            }
          }
        }
        DIRECTIONS.splice(DIRECTIONS.indexOf(DIRECTION), 1);
        return findExitRecursively(DIRECTIONS);
      }
    }

    if (findExitRecursively()) {
      this.leaveMaze();
    }
  }
}
