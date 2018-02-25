class View {
  static viewFunctions() {
    return {
      is : function(VIEW) {
        return this.name === VIEW.name
      }
    }
  }
  static createVIEW(name, value) {
    var VIEW = Object.create(View.viewFunctions(), {
      "value" : {
       "value" : value,
       "enumerable" : true,
       "writable" : false
      },
      "name" : {
        "value" : name,
       "enumerable" : true,
       "writable" : false
      }
    });
    return VIEW;
  }
  static get HUMAN() {
    return View.createVIEW("human", 0);
  }
  static get ROBOT() {
    return View.createVIEW("robot", 1);
  }
  static exists(viewValue) {
    return View.ALL().some(n => n.value === viewValue);
  }
  static getVIEW(viewName) {
    return viewName && View.ALL().find(n => n.name === viewName.toLowerCase());
  }
  static ALL() {
    return Object.values(Object.getOwnPropertyDescriptors(View)).filter(
      (fn) => 
        typeof fn.get === "function" && fn.name !== "ALL"
    ).map(
      n => n = n.get()
    );
  }
}