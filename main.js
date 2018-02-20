var mazeSideLength;
var grid;
var maze;
var mover;
var moverEl;
var cellSideLength;
var moverSideLength;
var moverEl;

function main () {
  document.getElementById("animateExitPath").addEventListener(
    "click",
    () => {
      resetMoverEl();
      findExitPathAndAnimate()
    }
  );
  document.getElementById("size").addEventListener(
    "change",
    (e) => {
      if (e.target.value % 2 === 0) {
        e.target.value = parseInt(e.target.value) + 1;
      }
      setupPage(parseInt(e.target.value) + 2);
    }
  );
  setupPage();
}
function setupPage(size = 20) {
  document.getElementById("size").setAttribute("disabled", "true");
  mazeSideLength = size;
  grid = generateMaze(mazeSideLength, mazeSideLength);
  maze = new Maze(grid, new Position(1,1));
  mover = new Mover(maze);
  cellSideLength = 2400/(mazeSideLength * 4);
  moverSideLength = Math.floor(cellSideLength * .7);
  if (document.querySelector("#grid table")) {
    document.querySelector("#grid table").remove();
  }
  if (moverEl) {
    moverEl.remove();
  }
  document.getElementById("grid").appendChild(makeGridEl());
  document.getElementById("size").removeAttribute("disabled");
}
function centeredPosition(el) {
  return ((cellSideLength / 2) - parseInt(moverSideLength / 2));
}
function createMover() {
  moverEl = moverEl = document.createElement("span");
  moverEl.classList.add("mover");
  moverEl.style.width = moverSideLength + "px";
  moverEl.style.height = moverSideLength + "px";
  moverEl.style.top = (maze.START_POSITION.y * cellSideLength + centeredPosition(moverEl)) + "px";
  moverEl.style.left = (maze.START_POSITION.x * cellSideLength + centeredPosition(moverEl)) + "px";
  document.querySelector("#grid").appendChild(moverEl);
  return moverEl;
}
function resetMoverEl() {
  moverEl.style.top = (maze.START_POSITION.y * cellSideLength + centeredPosition(moverEl)) + "px";
  moverEl.style.left = (maze.START_POSITION.x * cellSideLength + centeredPosition(moverEl)) + "px";
}

function makeGridEl() {
  var gridEl = document.createElement("table");
  var gridPositionChecker = maze.START_POSITION.getNewInstance();
  maze.grid.forEach((row, y) => {
    var rowEl = document.createElement("tr");
    row.forEach((cell, x) => {
      var cellEl = document.createElement("td");
      cellEl.style.width = cellSideLength + "px";
      cellEl.style.height = cellSideLength + "px";
      gridPositionChecker.setPosition(x,y);
      var posVal = maze.getValueAt(gridPositionChecker);
      cellEl.setAttribute("data-position", `${x}-${y}`);
      if (Maze.is(posVal, Maze.WALL)) {
        cellEl.classList.add("wall");
      } else if (Maze.is(posVal, Maze.EXIT)) {
        cellEl.classList.add("exit");
      } else if (Maze.is(posVal, Maze.START)) {
        cellEl.classList.add("start");
      }
      rowEl.appendChild(cellEl);
    });
    gridEl.appendChild(rowEl);
  });
  moverEl = createMover();
  return gridEl;
}

function findExitPathAndAnimate() {
  if (!mover.maze.containsPosition(mover.exitPosition)) {
    mover.reset();
    mover.findExitPath();
  }
  animateMoves();
}

function addValueToPositionProperty(el, positionProperty, value) {
  var oldValue = Number.parseInt(el.style[positionProperty]);
  var valueString = ((oldValue ? oldValue : 0) + value) + "px";
  el.style[positionProperty] = valueString;
}
function animateMove(el, DIRECTION) {
  var property = "top";
  var value = 0;
  if (DIRECTION.is(Direction.RIGHT)) {
    property = "left";
    value = cellSideLength;
  } else if (DIRECTION.is(Direction.DOWN)) {
    property = "top";
    value = cellSideLength;
  } else if (DIRECTION.is(Direction.LEFT)) {
    property = "left";
    value = -cellSideLength;
  } else if (DIRECTION.is(Direction.UP)) {
    property = "top";
    value = -cellSideLength;
  }
  addValueToPositionProperty(el, property, value);
}

function displayMover() {
  var interval = window.setInterval(() => {
    if (
      moverEl.style.left !== (mover.position.x * cellSideLength + centeredPosition(moverEl)) + "px" ||
      moverEl.style.top !== (mover.position.y * cellSideLength + centeredPosition(moverEl)) + "px"
    ) {
      [moverEl.style.top, moverEl.style.left] =
        [
          (mover.position.y * cellSideLength + centeredPosition(moverEl)) + "px",
          (mover.position.x * cellSideLength + centeredPosition(moverEl)) + "px"
        ];
    }
    if (maze.containsPosition(mover.exitPosition)) {
      console.log("Found exit");
      window.clearInterval(interval);
    }
  }, 50);
}

function animateMoves() {
  var animatedMover,
    moveCount = 0,
    interval;
  animatedMover = new Mover(maze);
  interval = window.setInterval(() => {
    try {
      let move = mover.position.moves[moveCount];
      if (moveCount < mover.position.moves.length) {
        animateMove(moverEl, move);
        animatedMover.position.onwardMove(move);
      } else {
        window.clearInterval(interval);
      }
      moveCount += 1;
    } catch (e) {
      window.clearInterval(interval);
      console.error(e);
    }
  }, 100);
}

function animateExit() {
  var animatedMover,
    moveCount = 0,
    interval;
  animatedMover = new Mover(maze);
  interval = window.setInterval(() => {
    try {
      let move = mover.exitPosition.moves[moveCount];
      if (moveCount < mover.exitPosition.moves.length) {
        animateMove(moverEl, move);
        animatedMover.position.onwardMove(move);
      } else {
        animateMove(moverEl, maze.getDirectionOfPerimeterFrom(animatedMover.position));
        window.clearInterval(interval);
      }
      moveCount += 1;
    } catch (e) {
      window.clearInterval(interval);
      console.error(e);
    }
  }, 100);
}
