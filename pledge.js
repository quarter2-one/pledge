var andThen = require("./andThen.js");

function Pledge(fn) {
  var A = function (args, index) {
    return [].slice.call(args, index || 0);
  };
  var fOut = function () {
    argsA = [fOut.resolve, fOut.reject].concat(A(arguments));
    return fn.apply(null, argsA);
  };
  fOut.then = function (fnS) {
    fOut.resolve = fOut.resolve.andThen(fnS, A(arguments, 1));
    return fOut;
  };
  fOut.catch = function (fn) {
    fOut.reject = fOut.reject.andThen(fn);
    return fOut;
  };
  fOut.resolve = function () {
    var rtn = [undefined, arguments[0], arguments];
    var lngth = Math.min(arguments.length, 2); /* Index. */
    return rtn[lngth];
  };
  fOut.reject = fOut.resolve;
  fOut.resolve.andThen = andThen;
  fOut.reject.andThen = andThen;

  return fOut;
}

Pledge.all = function (pA) {
  var vals = [];
  var resolveFn = function (resolve, val) {
    if (vals.push(val) === pA.length) resolve(vals);
  };
  var rejectFn = function (reject, val) {
    reject(val);
  };
  return multipledge(pA, resolveFn, rejectFn).then(function (val) {
    return vals;
  });
};

Pledge.race = function (pA) {
  var racewon = 0;
  var resolveFn = function (action, val) {
    if (!racewon++) action(val);
  };
  return multipledge(pA, resolveFn, resolveFn);
};

function multipledge(pA, then, cattch) {
  return new Pledge(function (resolve, reject) {
    pA.forEach(function (plej) {
      plej.then(then.bind(null, resolve));
      plej.catch(cattch.bind(null, reject));
      plej();
    });
  });
}

module.exports = Pledge;
