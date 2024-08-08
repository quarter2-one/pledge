var Pledge = require("../pledge");
var assert = require("assert");
var taste = require("taste-test");
var tasteTest = new taste.Test();

function timeout(fn, arsgA, time) {
  time = time || 500;
  setTimeout(function () {
    return fn.apply(fn, arsgA);
  }, time);
}

var getPledges = function () {
  var time = 1500;
  var p = function (index) {
    return new Pledge(function (res, rej) {
      time = time - index * 1;
      timeout(res, [index], time);
    });
  };

  var pledges = [];
  for (var i = 10; i < 20; i++) {
    pledges.push(p(i));
  }
  return pledges;
};

tasteTest.describe({
  "Pledge.js": {
    "can resolve to then": function (done) {
      var pledge = new Pledge(function (resolve, reject) {
        timeout(resolve);
      }).then(function () {
        done();
      });
      pledge();
    },
    "can reject to catch": function (done) {
      var pledge = new Pledge(function (resolve, reject) {
        timeout(reject);
      })
        .then(function () {
          done(new Error("it's feeling rejected"));
        })
        .catch(function (val) {
          done();
        });
      pledge();
    },
    "can resolve directly (without calling promise's main function)": function (done) {
      var pledge = new Pledge(function (resolve, reject) {
        throw new Error("Pledge main function should not be called.");
        done();
      }).then(function () {
        done();
      });
      pledge.resolve();
    },
    "can reject directly (without calling promise's main function)": function (done) {
      var pledge = new Pledge(function (resolve, reject) {
        throw new Error("Pledge main function should not be called.");
        done();
      }).then(function () {
        done();
      });
      pledge.reject();
    },
    "can span multiple lines": function (done) {
      var pledge = new Pledge(function (resolve, reject) {
        timeout(resolve);
      });

      pledge.then(function () {
        done();
      });
      pledge();
    },
    "can pass mutilple arguments through to chained 'then's": function (done) {
      var plus = function (args) {
        ++args[0];
        ++args[1];
        return args;
      };
      var pledge = new Pledge(function (resolve, reject, arg1, arg2) {
        timeout(resolve, [arg1, arg2]);
      })
        .then(plus)
        .then(plus)
        .then(function (args) {
          var msg = "Arguments are now being oassed through.";
          assert(args[0] === 4, msg);
          assert(args[1] === 6, msg);
          done();
        });
      pledge(2, 4);
    },

    "Multiple Pledge - All": function (done) {
      var pledges = getPledges();
      var all = Pledge.all(pledges).then(function (vals) {
        assert(pledges.length === vals.length, "Not all pledges returned a value.");
        done();
      });
      all();
    },

    "Multiple Pledge - Race": function (done) {
      var pledges = [
        new Pledge(function (res, rej) {
          setTimeout(function () {
            res("A");
          }, 250);
        }),
        new Pledge(function (res, rej) {
          setTimeout(function () {
            res("B");
          }, 230);
        }),
      ];
      var all = Pledge.race(pledges).then(function (val) {
        assert(val === "B", "The faster pledge did not get gold!");
        done();
      });
      all();
    },

    "Multiple Pledge - Race to fail": function (done) {
      var pledges = [
        new Pledge(function (res, rej) {
          setTimeout(function () {
            rej("A");
          }, 250);
        }),
        new Pledge(function (res, rej) {
          setTimeout(function () {
            rej("B");
          }, 230);
        }),
      ];
      var all = Pledge.race(pledges);
      all.catch(function (val) {
        assert(val === "B", "The faster pledge did not win at being rejected!");
        done();
      });
      all();
    },
  },
});
