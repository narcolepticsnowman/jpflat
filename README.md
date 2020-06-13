## jpflat
Flatten objects or arrays to an object with no nested objects where the keys are json paths

Inflate objects from a flattened object back to a regular nested object

Any promises that are encountered will be resolved

To prevent traversal into certain types (i.e. Dates), pass an array of valueSerializers to flatten or valueDeserializers to inflate.

By default, Date objects are converted to the string: `DATE_${date.toISOString}`. The prefix is necessary for deserializing back to a date type. 

Dots in property names will be escaped with a backslash. i.e. 127.0.0.1 => 127\.0\.0\.1

### Basic Functionality

For example, an object like this:
```js
const foo = {
    name: 'bob',
    datas: {
        some: {
            foos: true
        },
        rayray: [ { nested: { rayray: [ true, false ] } } ],
    },
    nestedArrays: [[{date:new Date()}],[2],[3]]
}
```

Once sent through flatten
```js
const {flatten} = require('jpflat')
(async ()=>{
    let flatFoo = await flatten(foo)
})()
```

Becomes an object like this:
```js
flatFoo = {
            '$.name': 'bob',
            '$.datas.some.foos': true,
            '$.datas.rayray[0].nested.rayray[0]': true,
            '$.datas.rayray[0].nested.rayray[1]': false,
            '$.nestedArrays[1][0]': 2,
            '$.nestedArrays[2][0]': 3,
            '$.nestedArrays[0][0].date': 'DATE_2020-06-13T22:28:37.625Z'
          }
```

It can be converted back to it's original state like this:
```js
const {inflate} = require('jpflat')
(async ()=>{
    const foo = await inflate(flatFoo)
})()
```

These functions work the same for an array as the root element

```js
(async ()=>{
    const array = [1,{two:2},[[[3]]]]
    const flatArray = flatten(array)
    const inflatedArray = inflate(flatArray)
})()
```


### Custom Serialization/Deserialization of values
