# pledge

## Furniture polish. Also, not a promise - a pledge. Different but the same.

### Usage

Simple example

```
 var pledge = new Pledge(function (resolve, reject) {
    timeout(resolve);
}).then(function () {
    done();
});
pledge();
```

Can reject to catch

```
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
```

Can resolve directly (without calling promise's main function).

```
var pledge = new Pledge(function (resolve, reject) {
    throw new Error("Pledge main function should not be called.");
}).then(function () {
    done();
});
pledge.resolve();
```

Can reject directly (without calling promise's main function)

```
var pledge = new Pledge(function (resolve, reject) {
    throw new Error("Pledge main function should not be called.");
    done();
}).then(function () {
    done();
});
pledge.reject();

```

Can span multiple lines.

```
var pledge = new Pledge(function (resolve, reject) {
    timeout(resolve);
});

pledge.then(function () {
    done();
});
pledge();
```

Can pass mutilple arguments through to chained 'then's...

```
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
```

Multiple Pledge - All

```
var pledges = getPledges();
var all = Pledge.all(pledges).then(function (vals) {
    assert(pledges.length === vals.length, "Not all pledges returned a value.");
    done();
});
all();
```

Multiple Pledge - Race

```
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
```

Multiple Pledge - Race to fail

```
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
```
