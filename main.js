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
    var [width,height,view,grid] = 
      [
        ...Array(2).fill(parseInt(url.searchParams.get("size"))), 
        View.getVIEW(url.searchParams.get("view")),
        url.searchParams.get("grid")
      ];
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
        view || View.HUMAN
      ),
      grid : 
        Utilities.decodeGrid(grid)
    };
  }

  function setupMaze(options) {
    prepareMaze();
    setupModel(options);
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
  function setupModel(options) {
    mover = new Mover(
      new Maze(
        options.grid || generateMaze(options.size.width, options.size.height), 
        new Position(1,1)
      )
    );
    window.history.pushState(
      {}, 
      '', 
      (new URL(window.location.href).pathname) + `?size=${options.size.width}&view=${options.view.name}&grid=${Utilities.encodeGrid(mover.maze.grid, mover.maze.EXIT_POSITION)}`);
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
        cellEl.setAttribute("data-position-x", x);
        cellEl.setAttribute("data-position-y", y);
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
            e.preventDefault();
            mover.position.onwardMove(Direction.UP);
            animateMove(mover.position, Direction.UP);
          } else if (e.key === "ArrowRight" && mover.canMove(Direction.RIGHT)) {
            mover.position.onwardMove(Direction.RIGHT);
            animateMove(mover.position, Direction.RIGHT);
          } else if (e.key === "ArrowDown" && mover.canMove(Direction.DOWN)) {
            e.preventDefault();
            mover.position.onwardMove(Direction.DOWN);
            animateMove(mover.position, Direction.DOWN);
          } else if (e.key === "ArrowLeft" && mover.canMove(Direction.LEFT)) {
            mover.position.onwardMove(Direction.LEFT);
            animateMove(mover.position, Direction.LEFT);
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
        hideMaze();
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
    document.getElementById("newMaze").addEventListener(
      "click",
      (e) => {
        window.history.pushState(
          {}, 
          '', 
          (new URL(window.location.href).pathname) + `?size=${document.getElementById("size").value}&view=${document.querySelector("input[name='view']:checked").value}`
        );
        setupMaze({
          size : {width : document.getElementById("size").value, height : document.getElementById("size").value}, 
          view : View.getVIEW(document.querySelector("[name='view']:checked").value),
          grid : null
        });
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
        setupMaze({
          size : {width : e.target.value, height : e.target.value}, 
          view : View.getVIEW(document.querySelector("[name='view']:checked").value),
          grid : null
        });
      }
    );
    Array.from(document.querySelectorAll("input[name='view']")).forEach((viewEl) => viewEl.addEventListener(
      "change",
      (e) => {
        e.target.blur();
        window.history.pushState(
          {}, 
          '', 
          (new URL(window.location.href).pathname) + `?size=${document.getElementById('size').value}&view=${e.target.value}&grid=${Utilities.encodeGrid(window.game.mover.maze.grid, mover.maze.EXIT_POSITION)}`
        );
        window.game.view = View.getVIEW(e.target.value);

        moverEl.classList.toggle("robot");
        moverEl.classList.toggle("human");
        if (View.getVIEW(e.target.value).is(View.ROBOT)) {
          hideMaze();
          updateFlashlight(null, mover.position);
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
      updateFlashlight(null, mover.position);
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
    if (document.getElementById("grid").classList.contains("onExit")) {
      document.getElementById("grid").classList.remove("onExit");
    }
  }

  async function findExitPathAndAnimate() {
    animating = true;
    findingExitPath.then(
      (exit) => animateRobot(), 
      (errorMsg) => console.error(errorMsg)
    );
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

  function updateFlashlight(previousPosition, currentPosition) {
    if (previousPosition) {
      mover.maze.runOnLocalGrid(
        (testPosition, currentPosition) =>
          !testPosition.occupiesSameSpace(currentPosition) && 
          !testPosition.occupiesSameSpace(mover.maze.EXIT_POSITION) && 
          document.querySelector(
            `td[data-position-x="${testPosition.x}"][data-position-y="${testPosition.y}"]`
          ).classList.add("previouslyLit")
        ,
        previousPosition,
        currentPosition
      );
    }
    
    mover.maze.runOnLocalGrid(
      (position) => 
        document.querySelector(
          `td[data-position-x="${position.x}"][data-position-y="${position.y}"]`
        ).classList.remove("unlit", "previouslyLit")
      ,
      currentPosition
    );
  }

  function stopRobot() {
    animating = false;
  }
  function isRobotStopped() {
    return !animating;
  }
  function playRobot() {

  }

  function reachedExit() {
    document.querySelector("#grid").classList.add("onExit");
  }
  function leftExit() {
    document.querySelector("#grid").classList.remove("onExit");
  }
  function whenFinishedAnimating(el) {
    return new Promise(
    (resolve, rejected) => 
      el.addEventListener(
        "transitionend",
        (e) => resolve(),
        {once : true}
      )
    );
  }


  function animateMove(position, DIRECTION) {
    var stylePositionProperty = "",
      stylePositionValue = 0;

    if (window.game.view.is(View.ROBOT)) {
      updateFlashlight(mover.position.peek(Direction.opposite(DIRECTION)), mover.position);
    }
    whenFinishedAnimating(moverEl).then(
      () => {
        if (window.game.mover.maze.isExit(position)) {
          reachedExit();
        } else if (window.game.mover.maze.isExit(position.peek(Direction.opposite(DIRECTION)))) {
          leftExit();
        }  
      }
    );

    switch(true) {
      case Direction.is(DIRECTION, Direction.RIGHT):
        stylePositionValue = cellSideLength;
      case Direction.is(DIRECTION, Direction.LEFT):
        stylePositionValue = stylePositionValue || -cellSideLength;
        stylePositionProperty = "left";  
        break;
      case Direction.is(DIRECTION, Direction.DOWN):
        stylePositionValue = cellSideLength;
      case Direction.is(DIRECTION, Direction.UP):
        stylePositionValue = stylePositionValue || -cellSideLength;
        stylePositionProperty = "top";
    }

    moverEl.style[stylePositionProperty] = 
      ((Number.parseInt(moverEl.style[stylePositionProperty]) || 0) + stylePositionValue) + "px";
  }

  function tryToAnimateRobot(moveCount) {
    try {
      let move = mover.exitPosition.moves[moveCount];
      if (moveCount < mover.exitPosition.moves.length) {
        mover.position.onwardMove(move);
        moverEl.addEventListener(
          "transitionend",
          () => {!isRobotStopped() && tryToAnimateRobot(moveCount+1)},
          {once: true}
        );
        animateMove(mover.position, move);
      } else {
        stopRobot();
      }
    } catch (e) {
      stopRobot();
      console.error(e);
    } 
  }

  function animateRobot() {
    hideMaze();
    updateFlashlight(null, mover.position);
    tryToAnimateRobot(0);
  }

  return {
    main : main
  }
})();