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
    return Direction.ALL().find(
      DIRECTION => 
        Cell.CELL(
          this.maze.getValueAt(this.position.peek(DIRECTION))
        ).is(Cell.EXIT)
    );
  }
  hasFoundExit() {
    return Cell.CELL(this.maze.getValueAt(this.position)).is(Cell.EXIT);
  }
  leaveMaze() {
    console.log(`Found exit at: ${this.position}`);
    this.exitPosition.imitate(this.position);
    Object.freeze(this.exitPosition);
    this.position.imitate(this.maze.START_POSITION);
    return true;
  }

  isValidPosition(position) {
    return (
      this.maze.containsPosition(position) &&
      !Cell.CELL(this.maze.getValueAt(position)).is(Cell.WALL)
    );
  }
  canMove(DIRECTION) {
    return this.isValidPosition(
      this.position.peek(DIRECTION)
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
      this.position.x > this.maze.EXIT_POSITION.x && 
      DIRECTIONS.find(dir => dir.is(Direction.LEFT))
    ) {
      directionWeights[DIRECTIONS.findIndex(dir => dir.is(Direction.LEFT))] = 
        (this.position.y === this.maze.EXIT_POSITION.y) ? 1 :.5;
    } else if (
      this.position.x < this.maze.EXIT_POSITION.x &&
      DIRECTIONS.find(dir => dir.is(Direction.RIGHT))
    ) {
      directionWeights[DIRECTIONS.findIndex(dir => dir.is(Direction.RIGHT))] = 
        (this.position.y === this.maze.EXIT_POSITION.y) ? 1 :.5;
    } 
    if (
      this.position.y > this.maze.EXIT_POSITION.y &&
      DIRECTIONS.find(dir => dir.is(Direction.UP))
    ) {
      directionWeights[DIRECTIONS.findIndex(dir => dir.is(Direction.UP))] = 
        (this.position.x === this.maze.EXIT_POSITION.x) ? 1 :.5;
    } else if (
      this.position.y < this.maze.EXIT_POSITION.y &&
      DIRECTIONS.find(dir => dir.is(Direction.DOWN))
    ) {
      directionWeights[DIRECTIONS.findIndex(dir => dir.is(Direction.DOWN))] = 
        (this.position.x === this.maze.EXIT_POSITION.x) ? 1 :.5;
    } 
    randomIndex = Utilities.weightedRandom(directionWeights);
    return DIRECTIONS[randomIndex];
  }

  findExitPath_Async() {
    return new Promise(
      (resolve, reject) => {
        if (this.findExitPath()) {
          this.leaveMaze();
          resolve(this.exitPosition);
        } else {
          reject("No exit position found!");
        }
      }
    );
  }

  findExitPath() {
    var visited = Object.create(Object.prototype, { [this.maze.START_POSITION] : {"enumerable" : true}}),
      moveTowardExit = (DIRECTION) => {
        this.position.onwardMove(DIRECTION);
        if (visited.hasOwnProperty(this.position)) {
          throw new Error("Robot attempted to visit previously visited cell.");
        }
        Object.defineProperty(visited, this.position.toString(), {"configurable" : true, "enumerable" : true}); 
      },
      isValidPosition = (position, visited) => {
        return !visited.hasOwnProperty(position);
      },
      canMove = (DIRECTION, visited) => {
        return this.canMove(DIRECTION) && isValidPosition(this.position.peek(DIRECTION), visited);
      },
      undoLastMove = () => {
        delete visited[this.position.toString()];
        this.position.undoLastMove();
      }
    var findExitRecursively = (DIRECTIONS = Direction.ALL()) => {
      if (DIRECTIONS.length > 0) {
        let DIRECTION = this.chooseNextDirection(DIRECTIONS);
        if (canMove(DIRECTION, visited)) {
          let exitDIRECTION;
          if (exitDIRECTION = this.whereIsTouchingExit()) {
            moveTowardExit(exitDIRECTION);
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
              undoLastMove();
            }
          }
        }
        DIRECTIONS.splice(DIRECTIONS.indexOf(DIRECTION), 1);
        return findExitRecursively(DIRECTIONS);
      }
    }
    return findExitRecursively();
  }

}
