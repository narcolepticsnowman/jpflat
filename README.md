## jpflat
Flatten objects to a single level where the keys are json paths

Inflate objects from a flattened object back to a regular nested object

For example, an object like this:
```js
const foo = {
    name: 'bob',
    datas: {
        some: {
            foos: true
        },
        rayray: [ { nested: { rayray: [ true, false ] } } ],
        stuff: -9

    },
    moData: ["arrays",["and",["arrays"],["andArrays",[[{number:1}],[2],[3]]],["andArrays"]]]
}
```

Once sent through the flattener like
```js
const {flatten} = require('jpflat')
const flatFoo = flatten(foo)
```

It becomes an object like this:
```js
flatFoo = {
  "name": "bob",
  "datas.some.foos": true,
  "datas.rayray[0].nested.rayray[0]": true,
  "datas.rayray[0].nested.rayray[1]": false,
  "datas.stuff": -9,
  "moData[0]": "arrays",
  "moData[1][0]": "and",
  "moData[1][1][0]": "arrays",
  "moData[1][2][0]": "andArrays",
  "moData[1][2][1][0][0].number": 1,
  "moData[1][2][1][1][0]": 2,
  "moData[1][2][1][2][0]": 3,
  "moData[1][3][0]": "andArrays"
}
```

It can be converted back to it's original state like this:
```js
const {inflate} = require('jpflat')
const foo = inflate(flatFoo)
```