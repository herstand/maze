"use strict";
var game = (function(){
  var mover = null;
  var robot = null;
  var view = null;
  var moverEl = null;
  var cellSideLength = 0;
  var moverSideLength = 0;
  var startLocation = null;
  var animateRobotInterval = null;
  var mazeScale = ((window.innerWidth > 0) ? window.innerWidth : screen.width) + 1000;
  var findingExitPath = null;
  var animating = false;
  var gridIsBuilt = false;

  function main (){
    setupMaze(
      initializeModelProperties()
    );
    return {mover: mover, view: view};
  }

  function initializeModelProperties() {
    var url = new URL(window.location.href);
    var [width,height,view] = [...Array(2).fill(parseInt(url.searchParams.get("size"))), View.getVIEW(url.searchParams.get("view"))];
    if (
      (
        url.searchParams.get("size") &&
        (
          isNaN(width) || 
          width < parseInt(document.getElementById("size").min) ||
          width > parseInt(document.getElementById("size").max)
        )
      )
      || 
      (
        url.searchParams.get("view") &&
        typeof View.exists(view) === "undefined"
      ) 
    ) {
      alert(`Invalid options: 'size ${width}' and 'view ${view}`); 
      window.location.href = "/";
    }
    return {
      size : {
        width : width || document.getElementById("size").value,
        height : height || document.getElementById("size").value
      },
      view : 
      (
        view || View.getVIEW(document.querySelector("[name='view']:checked").value)
      )
    };
  }

  function setupMaze(options) {
    prepareMaze();
    setupModel(options.size);
    setupViewProperties(options.view);
    makeGridEl();
    cleanupMazeSetup();

    findingExitPath = mover.findExitPath_Async();
  }
  function resetMaze() {
    stopRobot();
    document.getElementById("grid").classList.remove("onExit");
    Utilities.runAll(
      document.createRange(),
      {fn: "selectNodeContents",args: [document.querySelector("#grid table")]},
      {fn: "deleteContents", args:[]}
    );
    moverEl.remove();
  }
  function initializeMaze() {
    document.getElementById("grid").appendChild(document.createElement("table"));
    setupEventListeners();
  }
  function prepareMaze() {
    if (gridIsBuilt) {
      resetMaze();
    } else {
      initializeMaze();
    }
    document.getElementById("size").setAttribute("disabled", "true");
    document.getElementById("animateExitPath").setAttribute("disabled", "true");
  }
  function setupModel(size) {
    mover = new Mover(
      new Maze(
        generateMaze(size.width, size.height), 
        new Position(1,1)
      )
    );
  }
  function setupViewProperties(_view) {
    cellSideLength = Math.floor(mazeScale/(mover.maze.grid[0].length * 4));
    moverSideLength = Math.floor(cellSideLength * .7);
    startLocation = {
      x :
        mover.maze.START_POSITION.x * cellSideLength + parseInt((cellSideLength / 2) - (moverSideLength / 2)),
      y :
        mover.maze.START_POSITION.y * cellSideLength + parseInt((cellSideLength / 2) - (moverSideLength / 2))
    }
    view = _view;
    document.getElementById("size").value = mover.maze.grid.length;
    document.getElementById(view.name).checked = "checked";
  }
  function makeGridEl() {
    var gridPositionChecker = mover.maze.START_POSITION.getNewInstance();

    mover.maze.grid.forEach((row, y) => {
      var rowEl = document.createElement("tr");
      row.forEach((cell, x) => {
        var cellEl = document.createElement("td");
        cellEl.style.width = cellSideLength + "px";
        cellEl.style.height = cellSideLength + "px";
        gridPositionChecker.setPosition(x,y);
        var cellValue = mover.maze.getValueAt(gridPositionChecker);
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
      document.querySelector("#grid table").appendChild(rowEl);
    });

    moverEl = document.createElement("span");
    moverEl.classList.add("mover");
    moverEl.classList.add(view.name);
    [moverEl.style.width, moverEl.style.height, moverEl.style.top, moverEl.style.left] = 
      [...Array(2).fill(moverSideLength + "px"), startLocation.y + "px", startLocation.x + "px"];
    document.querySelector("#grid").appendChild(moverEl);
  }
  function setupEventListeners() {
    document.addEventListener(
      "keydown", (e) => {
        if (!animating) {
          if (e.key === "ArrowUp" && mover.canMove(Direction.UP)) {
            mover.position.onwardMove(Direction.UP);
            animateMove(moverEl, Direction.UP);
          } else if (e.key === "ArrowRight" && mover.canMove(Direction.RIGHT)) {
            mover.position.onwardMove(Direction.RIGHT);
            animateMove(moverEl, Direction.RIGHT);
          } else if (e.key === "ArrowDown" && mover.canMove(Direction.DOWN)) {
            mover.position.onwardMove(Direction.DOWN);
            animateMove(moverEl, Direction.DOWN);
          } else if (e.key === "ArrowLeft" && mover.canMove(Direction.LEFT)) {
            mover.position.onwardMove(Direction.LEFT);
            animateMove(moverEl, Direction.LEFT);
          }
        }
      }
    );
    document.getElementById("animateExitPath").addEventListener(
      "click",
      () => {
        stopRobot();
        window.game.view = View.ROBOT;
        resetMoverEl();
        moverEl.classList.remove("human");
        moverEl.classList.add("robot");
        document.getElementById("human").removeAttribute("checked");
        document.getElementById("robot").checked = "checked";
        findExitPathAndAnimate()
      }
    );
    document.getElementById("resetView").addEventListener(
      "click",
      () => {
        stopRobot();
        document.getElementById("human").checked = true;
        window.game.view = View.HUMAN;
        moverEl.classList.remove("robot");
        moverEl.classList.add("human");
        showMaze();
        resetMoverEl();
      }
    );
    document.getElementById("size").addEventListener(
      "change",
      (e) => {
        window.history.pushState(
          {}, 
          '', 
          (new URL(window.location.href).pathname) + `?size=${e.target.value}&view=${document.querySelector("input[name='view']:checked").value}`
        );
        setupMaze({size : {width : e.target.value, height : e.target.value}, view : View.getVIEW(document.querySelector("[name='view']:checked").value)});
      }
    );
    Array.from(document.querySelectorAll("input[name='view']")).forEach((viewEl) => viewEl.addEventListener(
      "change",
      (e) => {
        e.target.blur();
        window.history.pushState(
          {}, 
          '', 
          (new URL(window.location.href).pathname) + `?size=${document.getElementById('size').value}&view=${e.target.value}`
        );
        window.game.view = View.getVIEW(e.target.value);

        moverEl.classList.toggle("robot");
        moverEl.classList.toggle("human");
        if (View.getVIEW(e.target.value).is(View.ROBOT)) {
          hideMaze();
          updateFlashlight(mover.position.x,mover.position.y);
        } else { //HUMAN
          showMaze();
        }
      }
    ));
  }
  function cleanupMazeSetup() {
    document.getElementById("size").removeAttribute("disabled");
    document.getElementById("animateExitPath").removeAttribute("disabled");
    if (view.is(View.ROBOT)) {
      hideMaze();
      updateFlashlight(mover.position.x, mover.position.y);
    }
    gridIsBuilt = true;
  }

  function getStartLocation() {
    return {
      x : 
        mover.maze.START_POSITION.x * cellSideLength + parseInt((cellSideLength / 2) - (moverSideLength / 2)),
      y : 
        mover.maze.START_POSITION.y * cellSideLength + parseInt((cellSideLength / 2) - (moverSideLength / 2))
    }
  }

  function resetMoverEl() {
    mover.position.setPosition(mover.maze.START_POSITION.x, mover.maze.START_POSITION.y);
    moverEl.style.top = startLocation.y + "px";
    moverEl.style.left = startLocation.x + "px";
  }

  async function findExitPathAndAnimate() {
    animating = true;
    findingExitPath.then(
      (exit) => animateRobot(), 
      (errorMsg) => console.error(errorMsg)
    );
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
    window.setTimeout(shadowLight, 500, document.querySelectorAll("td.lit:not(.exit)"));
    document.querySelector(`td[data-position="${mover.maze.EXIT_POSITION.x}-${mover.maze.EXIT_POSITION.y}"]`).classList.remove("unlit");
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

  function stopRobot() {
    window.clearInterval(animateRobotInterval);
  }
  function playRobot() {

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
    if (window.game.view.is(View.ROBOT)) {
      updateFlashlight(mover.position.x, mover.position.y);
    }
    if (mover.position.x === mover.maze.EXIT_POSITION.x && mover.position.y === mover.maze.EXIT_POSITION.y) {
      document.querySelector("#grid").classList.add("onExit");
    } else if (document.querySelector("#grid.onExit")) {
      document.querySelector("#grid.onExit").classList.remove("onExit");
    }
  }

  function animateRobot() {
    var moveCount = 0;
    hideMaze();
    updateFlashlight(mover.position.x, mover.position.y);
    
    animateRobotInterval = window.setInterval(() => {
      try {
        let move = mover.exitPosition.moves[moveCount];
        if (moveCount < mover.exitPosition.moves.length) {
          mover.position.onwardMove(move);
          animateMove(moverEl, move);
        } else {
          stopRobot();
          animating = false;
        }
        moveCount += 1;
      } catch (e) {
        stopRobot();
        console.error(e);
      }
    }, 300);
  }

  return {
    main : main
  }
})();