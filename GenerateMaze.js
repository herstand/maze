function makeFilledArray(size, fn) {
  return Array(size).fill(0).map((n, i, arr) => arr[i] = fn())
}
function generateMaze(width = 81, height = 51, complexity = .75, density = .75) {
  var grid;
  var shape = [
    parseInt(height / 2) * 2 + 1,
    parseInt(width / 2) * 2 + 1
  ];
  complexity = parseInt(complexity * (5 * (shape[0] + shape[1])));
  density = parseInt(density * (parseInt(shape[0] / 2) * parseInt(shape[1] / 2)))

  grid = makeFilledArray(shape[0], () => Array(shape[1]).fill(0));

  //Make border wall
  grid[0].fill(1);
  grid[grid.length - 1].fill(1);
  grid.map((n,i,arr) => {
    n[0] = 1;
    n[arr[0].length - 1] = 1;
  });

  for (var i in Array(density).fill(0).map((n, i, arr) => arr[i] = i)) {
    let [x,y] = [
      (Math.ceil(Math.random()*parseInt(shape[1] / 2))) * 2,
      (Math.ceil(Math.random()*parseInt(shape[0] / 2))) * 2
    ];
    grid[y][x] = 1;
    for (var j in Array(complexity).fill(0).map((n, comInd, arr) => arr[comInd] = comInd)) {
      let neighbors = [];
      if (x > 1)              neighbors.push([y, x - 2]);
      if (x < shape[1] - 2)   neighbors.push([y, x + 2]);
      if (y > 1)              neighbors.push([y - 2, x]);
      if (y < shape[0] - 2)   neighbors.push([y + 2, x]);
      if (neighbors.length > 0) {
        let randNumber = Math.random();
        let [y_, x_] = neighbors[Math.ceil( (randNumber * (neighbors.length - 1)))];
        if (grid[y_][x_] === 0) {
          grid[y_][x_] = 1;
          grid[y_ + parseInt((y - y_) / 2)][x_ + parseInt((x - x_) / 2)] = 1;
          [x, y] = [x_, y_];
        }
      }
    }
  }
  // Set start
  grid[1][1] = 4;
  // Set exit
  grid[Math.floor(grid.length / 2)][Math.floor(grid[0].length / 2)] = 2;
  return grid;
}
