class Utilities {
  static NewArrayInstance(arr) {
    return JSON.parse(JSON.stringify(arr));
  }
  static ifTrueThenRunNext(...functionList) {
    return functionList.every(
      function(booleanReturnFunction){
        return booleanReturnFunction.call(this);
      },
      this
    );
  }
  static runAll(obj, ...args) {
    args.forEach(fnObj => obj[fnObj.fn](...fnObj.args));
  }
  static capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  static triangularNumber(value) {
    var abs = Math.abs(value);
    return ((abs / 2) * (abs + 1)) * (abs / value) || 0;
  }
  static weightedRandom(weightedList) {
    var sum = 0,
      r = Math.random();
    for (let i in weightedList) {
      sum += weightedList[i];
      if (r <= sum) return i;
    }
    return 0;
  }
  // Only encode walls and open spaces
  static makeBinary(cellValue) {
    return Cell.CELL(cellValue).is(Cell.WALL) ? Cell.WALL.valueOf() : Cell.OPEN.valueOf();
  }

  static get encoding() {
    return {
      alphabet : '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'.split('').sort().join(''),
      binaryAlphabet : "01",
      get charToDec (){
        return Utilities.encoding.alphabet.split("").reduce(
          (charToDecAccumulator,n,i) => 
            Object.defineProperty(charToDecAccumulator, n, {"value" : i})
          , 
          {}
      )},
      get BASE (){ return this.alphabet.length; }
    };
  }
  static encodeInt(num, alphabet = Utilities.encoding.alphabet, BASE_BITS = 6) {
    var log = Math.log2(num),
      BASE = alphabet.length,
      length,
      chars,
      i;
    if (Math.pow(2, Math.round(log)) === num) {
      log += 1;
    }
    length = Math.max(1, Math.ceil(log / BASE_BITS));

    chars = new Array(length);
    i = chars.length - 1
    while (num > 0) {
      chars[i--] = alphabet[num % BASE];
      num = Math.floor(num / BASE);
    }
    while (i >= 0) {
      chars[i--] = alphabet[0];
    }
    return chars.join('');
  }

  static decodeToInt(string) {
    var num = 0;
    for (let i = 0; i < string.length; i++) {
      num = num * Utilities.encoding.BASE + Utilities.encoding.charToDec[string[i]]; 
    }
    return num;
  }

  static encodeGrid(grid,start,exit) {
    if (grid === null) {
      return null;
    }
    return `${start.x},${start.y},${exit.x},${exit.y},` + grid.reduce(
      (tableEncoding, row) =>
        tableEncoding.concat(
          Utilities.encodeInt(
            row.reduce(
              (rowEncoding,cell,i) =>
                rowEncoding + (Utilities.makeBinary(cell) * 2) ** (row.length - i - 1)
              ,
              0
            )
          )
        )
        ,
        []
    ).join(",");
  }

  static decodeGrid(gridEncoding) {
    if (gridEncoding === null) {
      return null;
    }
    gridEncoding = gridEncoding.split(",");
    var startX = gridEncoding.shift();
    var startY = gridEncoding.shift();
    var exitX = gridEncoding.shift();
    var exitY = gridEncoding.shift();
    var grid = gridEncoding.map(
      (encodedRow, row_i, arr) =>
        arr[row_i] = 
          Utilities.encodeInt(
            Utilities.decodeToInt(encodedRow), 
            Utilities.encoding.binaryAlphabet,
            1
          ).split("").map(n => parseInt(n))
     );
     grid[startY][startX] = Cell.START.valueOf();
     grid[exitY][exitX] = Cell.EXIT.valueOf();
     return grid;
  }
}