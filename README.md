## jpflat
Flatten objects or arrays to an object with no nested objects where the keys are json paths by default 

Inflate objects from a flattened object back to a regular nested object

Any promises that are encountered will be resolved

To prevent traversal into certain types (i.e. Dates), pass an array of valueSerializers to flatten or valueDeserializers to inflate.

Path generation can be customized to whatever scheme fits your needs.

By default, Date objects are converted to the string: `DATE_${date.toISOString}`. The prefix is necessary for deserializing back to a date type. 

Dots in property names will be escaped with a backslash. i.e. 127.0.0.1 => 127\\.0\\.0\\.1

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

In some cases you may want to avoid traversing an object and instead convert the object or array to a value. 

For instance, Dates being converted to iso strings.

To use this feature, pass an array of serializers to the flatten method or an array of deserializers to the inflate method.

A serializer must implement two methods, canSerialize and serialize. Async functions are supported.

CanSerialize should return a boolean to determine if this value can be handled.
serialize should return the serialized value.

Serialize is called before traversing object keys so complex objects can be converted to simple values.

The pathParts are provided for reference in cases where information is stored in the keys

```js

const serializer = {
    canSerialize: (pathParts, o)=> o instanceof Date,
    serialize: (pathParts, date) => `DATE_${date.toISOString()}`,
    continue: true
}

(async ()=>{
    const inflatedArray = flatten(flat, [serializer])
})()

```

the reference to pathParts is the actual working array for the recursive traversal, thus you can modify the path objects
here along with the value before it's written to the result.

If a path is modified, you will need to use a custom pathExpander to undo the modifications to ensure deserialization works.

Likewise, a deserializer must implement two methods, canDeserialize and deserialize

```js

const deserializer = {
    canDeserialize: (path, s)=> s.startsWith('DATE_'),
    deserialize: (path, date) => `DATE_${date.toISOString()}`,
    continue: false
}

(async ()=>{
    const inflatedArray = inflate(flat, [deserializer])
})()

```

The continue property determines if this serializer should be the final serializer for the value, or if other serializers
are allowed to serialize the produced value. This is useful for chaining serializations. 

### Custom Serialization/Deserialization of paths

To specify a custom way to generate paths for each value, pass a function as the third argument to flatten or inflate.

These functions are called the pathReducer and pathExpander.

During flattening, the current path is represented as an array of objects, each with two properties: key and isInd

```js
{
    key: 'foo',
    isInd: false
}
```

The key is the property name or index of the current part of the path, and isInd specifies whether the key represents an array index or object property.

The first element in the array is always the root element represenation of 

```js
{
    key: '$',
    isInd: false
}
```

The pathReducer should take this array of property objects and convert them to a single path.

The expand function undoes this operation, it takes a single path and expands it back to the array of objects
representing the path.

The following rule must always hold (assume == is deep equals by value equality not reference equality)
```js
let pathParts = [
    {key:'$', isInd: false},
    {key:'foo', isInd: false},
    {key:'0', isInd: true}
]
pathParts == expand( reduce( pathParts ) )
```

