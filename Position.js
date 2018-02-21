class Position {
  constructor(x = 0,y = 0,moves = []) {
    this.position = [x,y];
    this.moves = moves;
    Object.seal(this);
  }
  get x() {
    return this.position[0];
  }
  get y() {
    return this.position[1];
  }
  set x(newValue) {
    this.position[0] = newValue;
    return this;
  }
  set y(newValue) {
    this.position[1] = newValue;
    return this;
  }
  getAngleTo(position) {
    var heightOfAdj = this.y - position.y,
      widthOfOpp = this.x - position.x;
    return Math.atan2(widthOfOpp, heightOfAdj);
  }
  setPosition(x, y) {
    this.position[0] = x;
    this.position[1] = y;
    return this;
  }
  opposite(DIRECTION) {
    DIRECTION.value.forEach((n,i) => DIRECTION.value[i] = (DIRECTION.value[i] * -1));
    return DIRECTION;
  }
  undoLastMove() {
    this.move(this.opposite(this.moves.pop()));
    return this;
  }
  onwardMove(DIRECTION) {
    this.moves.push(DIRECTION);
    this.move(DIRECTION);
    return this;
  }
  move(DIRECTION) {
    this.position.forEach(function(n,i){ this.position[i] = n + DIRECTION.value[i] }, this);
  }
  peek(DIRECTION) {
    return this.getNewInstance().onwardMove(DIRECTION);
  }
  getNewInstance() {
    return new Position(
      this.x,
      this.y,
      Utilities.NewArrayInstance(this.moves)
    );
  }
  imitate(positionToImitate) {
    this.x = positionToImitate.x;
    this.y = positionToImitate.y;
    this.moves = Utilities.NewArrayInstance(positionToImitate.moves);
  }
  toString() {
    return `[${this.x},${this.y}]`;
  }
}