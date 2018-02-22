var mazeSideLength;
var grid;
var maze;
var mover;
var moverEl;
var cellSideLength;
var moverSideLength;
var moverEl;
var animateMovesInterval;
var mazeScale = ((window.innerWidth > 0) ? window.innerWidth : screen.width) + 1000;
var VIEW = {HUMAN : 0, ROBOT : 1, get : function(view) {return this[view];}};
window.view = VIEW.HUMAN;
var animating = false;

function main () {
  document.getElementById("animateExitPath").addEventListener(
    "click",
    () => {
      document.querySelector("#robot").click();
      window.clearInterval(animateMovesInterval);
      resetMoverEl();
      findExitPathAndAnimate()
    }
  );
  document.getElementById("resetView").addEventListener(
    "click",
    () => {
      document.querySelector("#human").click();
      window.clearInterval(animateMovesInterval);
      resetMoverEl();
    }
  );
  document.getElementById("size").addEventListener(
    "change",
    (e) => {
      setupPage(parseInt(e.target.value));
    }
  );
  Array.from(document.querySelectorAll("input[name='view']")).forEach((view) => view.addEventListener(
    "change",
    (e) => {
      window.view = VIEW.get(e.target.value);
      if (window.view === VIEW.ROBOT && !document.querySelector(".unlit")) {
        window.setTimeout(hideMaze,300);
      }
      if (window.view === VIEW.HUMAN && document.querySelector(".unlit")) {
        window.setTimeout(showMaze,300);
      }
    }
  ));
  setupPage();
}
function setupPage(size = document.getElementById("size").value) {
  document.getElementById("size").setAttribute("disabled", "true");

  mazeSideLength = size;
  grid = generateMaze(mazeSideLength, mazeSideLength);
  maze = new Maze(grid, new Position(1,1));
  mover = new Mover(maze);

  cellSideLength = Math.floor(mazeScale/(mazeSideLength * 4));
  moverSideLength = Math.floor(cellSideLength * .7);
  if (document.querySelector("#grid table")) {
    document.querySelector("#grid table").remove();
  }
  if (moverEl) {
    moverEl.remove();
  }
  window.clearInterval(animateMovesInterval);
  document.getElementById("grid").appendChild(makeGridEl());
  document.getElementById("size").removeAttribute("disabled");
  window.setTimeout(
    () => {
      document.getElementById("animateExitPath").setAttribute("disabled", "true");
      mover.findExitPath();
      document.getElementById("animateExitPath").removeAttribute("disabled");
   },
  10);
}
function centeredPosition(el) {
  return parseInt((cellSideLength / 2) - (moverSideLength / 2));
}
function createMover() {
  moverEl = document.createElement("span");
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
      var cellValue = maze.getValueAt(gridPositionChecker);
      cellEl.setAttribute("data-position", `${x}-${y}`);
      if (Cell.CELL(cellValue).is(Cell.WALL)) {
        cellEl.classList.add("wall");
      } else if (Cell.CELL(cellValue).is(Cell.EXIT)) {
        cellEl.classList.add("exit");
      } else if (Cell.CELL(cellValue).is(Cell.START)) {
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
  animating = true;
  if (!mover.maze.containsPosition(mover.exitPosition)) {
    mover.reset();
    mover.findExitPath();
  }
  window.setTimeout(animateMoves,500);
}

function addValueToPositionProperty(el, positionProperty, value) {
  var oldValue = Number.parseInt(el.style[positionProperty]);
  var valueString = ((oldValue ? oldValue : 0) + value) + "px";
  el.style[positionProperty] = valueString;
}
function hideMaze(){
  Array.from(document.querySelectorAll("td:not(.exit)")).forEach(
    td => {
      td.classList.remove("lit"); 
      td.classList.remove("previouslyLit"); 
      td.classList.add("unlit"); 
    }
  );
}
function showMaze(){
  Array.from(document.querySelectorAll("td:not(.exit)")).forEach(
    td => {
      td.classList.remove("previouslyLit"); 
      td.classList.remove("unlit"); 
      td.classList.add("lit"); 
    }
  );
}
function shadowLight(litCells) {
  Array.from(litCells).forEach(
    td => {
      td.classList.remove("lit"); 
      td.classList.add("previouslyLit");
    }
  );
}
function updateFlashlight(x,y) {
  window.setTimeout(shadowLight, 500, document.querySelectorAll("td.lit"));
  document.querySelector(`td[data-position="${maze.EXIT_POSITION.x}-${maze.EXIT_POSITION.y}"]`).classList.remove("unlit");
  document.querySelector(`td[data-position="${x}-${y}"]`).classList.remove("unlit");
  document.querySelector(`td[data-position="${x + 1}-${y}"]`).classList.remove("unlit");
  document.querySelector(`td[data-position="${x - 1}-${y}"]`).classList.remove("unlit");
  document.querySelector(`td[data-position="${x}-${y + 1}"]`).classList.remove("unlit");
  document.querySelector(`td[data-position="${x}-${y - 1}"]`).classList.remove("unlit");

  document.querySelector(`td[data-position="${x}-${y}"]`).classList.add("lit");
  document.querySelector(`td[data-position="${x + 1}-${y}"]`).classList.add("lit");
  document.querySelector(`td[data-position="${x - 1}-${y}"]`).classList.add("lit");
  document.querySelector(`td[data-position="${x}-${y + 1}"]`).classList.add("lit");
  document.querySelector(`td[data-position="${x}-${y - 1}"]`).classList.add("lit");
}
function animateMove(el, DIRECTION) {
  var property = "top";
  var value = 0;
  if (Direction.is(DIRECTION, Direction.RIGHT)) {
    property = "left";
    value = cellSideLength;
  } else if (Direction.is(DIRECTION, Direction.DOWN)) {
    property = "top";
    value = cellSideLength;
  } else if (Direction.is(DIRECTION, Direction.LEFT)) {
    property = "left";
    value = -cellSideLength;
  } else if (Direction.is(DIRECTION, Direction.UP)) {
    property = "top";
    value = -cellSideLength;
  }
  addValueToPositionProperty(el, property, value);
}

function animateMoves() {
  var animatedMover,
    moveCount = 0;
  animatedMover = new Mover(maze);
  if (window.view === VIEW.ROBOT) {
    hideMaze();
  }
  animateMovesInterval = window.setInterval(() => {
    try {
      let move = mover.exitPosition.moves[moveCount];
      if (moveCount < mover.exitPosition.moves.length) {
        animateMove(moverEl, move);
        animatedMover.position.onwardMove(move);
        if (view === VIEW.ROBOT) {
          updateFlashlight(animatedMover.position.x, animatedMover.position.y);
        }
      } else {
        window.clearInterval(animateMovesInterval);
        animating = false;
      }
      moveCount += 1;
    } catch (e) {
      window.clearInterval(animateMovesInterval);
      console.error(e);
    }
  }, 300);
}
