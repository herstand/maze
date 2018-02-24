function load(url) {
  var script = document.createElement("script");
  script.src = url;
  script.async = false;
  document.head.appendChild(script);  
}
load("Utilities.js");
load("GenerateMaze.js");
load("Direction.js");
load("Position.js");
load("Cell.js");
load("Maze.js");
load("Mover.js");
load("View.js");
load("main.js");
load("run.js");

