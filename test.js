#!/usr/bin/env node
const {flatten, inflate} = require('./index.js')
const assert = (expected,actual)=>{
    if(expected !== actual){
        throw new Error(`expected did not equal actual.\n  expected: ${expected}\n  actual: ${actual}`)
    }
}

console.log("Test object root")

const orig = {
    name: 'bob',
    datas: {
        some: {
            foos: true,
            arrays: ["arrays",[[1,{arraysies: ["arrays",[[1],[2],[3]]]}],[2],[3]]],
        },
        rayray: [ { nested: { rayray: [ true, false ] } } ],
        stuff: -9

    },
    moData: ["arrays",["and",["arrays"],["andArrays",[[{number:1}],[2],[3]]],["andArrays"]]]
}

const flat = flatten(orig)
console.log(flat)
assert(Object.keys(flat).length, 21)

assert(flat['$.name'], orig.name)
assert(flat['$.datas.some.foos'], orig.datas.some.foos)
assert(flat['$.datas.some.arrays[0]'], orig.datas.some.arrays[0])
assert(flat['$.datas.some.arrays[1][0][1].arraysies[0]'], orig.datas.some.arrays[1][0][1].arraysies[0])
assert(flat['$.datas.some.arrays[1][0][1].arraysies[1][0][0]'], orig.datas.some.arrays[1][0][1].arraysies[1][0][0])
assert(flat['$.datas.some.arrays[1][0][1].arraysies[1][1][0]'], orig.datas.some.arrays[1][0][1].arraysies[1][1][0])
assert(flat['$.datas.some.arrays[1][0][1].arraysies[1][2][0]'], orig.datas.some.arrays[1][0][1].arraysies[1][2][0])
assert(flat['$.datas.some.arrays[1][0][0]'], orig.datas.some.arrays[1][0][0])
assert(flat['$.datas.some.arrays[1][1][0]'], orig.datas.some.arrays[1][1][0])
assert(flat['$.datas.some.arrays[1][2][0]'], orig.datas.some.arrays[1][2][0])
assert(flat['$.datas.rayray[0].nested.rayray[0]'], orig.datas.rayray[0].nested.rayray[0])
assert(flat['$.datas.rayray[0].nested.rayray[1]'], orig.datas.rayray[0].nested.rayray[1])
assert(flat['$.datas.stuff'], orig.datas.stuff)
assert(flat['$.moData[0]'], orig.moData[0])
assert(flat['$.moData[1][0]'], orig.moData[1][0])
assert(flat['$.moData[1][1][0]'], orig.moData[1][1][0])
assert(flat['$.moData[1][2][0]'], orig.moData[1][2][0])
assert(flat['$.moData[1][2][1][0][0].number'], orig.moData[1][2][1][0][0].number)
assert(flat['$.moData[1][2][1][1][0]'], orig.moData[1][2][1][1][0])
assert(flat['$.moData[1][2][1][2][0]'], orig.moData[1][2][1][2][0])
assert(flat['$.moData[1][3][0]'], orig.moData[1][3][0])

const inflated = inflate(flat)
console.log(inflated)
assert(inflated.name, orig.name)
assert(inflated.datas.some.foos, orig.datas.some.foos)
assert(inflated.datas.some.arrays[0], orig.datas.some.arrays[0])
assert(inflated.datas.some.arrays[1][0][1].arraysies[0], orig.datas.some.arrays[1][0][1].arraysies[0])
assert(inflated.datas.some.arrays[1][0][1].arraysies[1][0][0], orig.datas.some.arrays[1][0][1].arraysies[1][0][0])
assert(inflated.datas.some.arrays[1][0][1].arraysies[1][1][0], orig.datas.some.arrays[1][0][1].arraysies[1][1][0])
assert(inflated.datas.some.arrays[1][0][1].arraysies[1][2][0], orig.datas.some.arrays[1][0][1].arraysies[1][2][0])
assert(inflated.datas.some.arrays[1][0][0], orig.datas.some.arrays[1][0][0])
assert(inflated.datas.some.arrays[1][1][0], orig.datas.some.arrays[1][1][0])
assert(inflated.datas.some.arrays[1][2][0], orig.datas.some.arrays[1][2][0])
assert(inflated.datas.rayray[0].nested.rayray[0], orig.datas.rayray[0].nested.rayray[0])
assert(inflated.datas.rayray[0].nested.rayray[1], orig.datas.rayray[0].nested.rayray[1])
assert(inflated.datas.stuff, orig.datas.stuff)
assert(inflated.moData[0], orig.moData[0])
assert(inflated.moData[1][0], orig.moData[1][0])
assert(inflated.moData[1][1][0], orig.moData[1][1][0])
assert(inflated.moData[1][2][0], orig.moData[1][2][0])
assert(inflated.moData[1][2][1][0][0].number, orig.moData[1][2][1][0][0].number)
assert(inflated.moData[1][2][1][1][0], orig.moData[1][2][1][1][0])
assert(inflated.moData[1][2][1][2][0], orig.moData[1][2][1][2][0])
assert(inflated.moData[1][3][0], orig.moData[1][3][0])

console.log("Test array root")
const array = [1,{two:2},[[[3]]]]

const flatArray = flatten(array)
console.log(flatArray)

assert(flatArray['$[0]'], array[0])
assert(flatArray['$[1].two'], array[1].two)
assert(flatArray['$[2][0][0][0]'], array[2][0][0][0])

const inflatedArray = inflate(flatArray)
console.log(inflatedArray)

assert(inflatedArray[0], array[0])
assert(inflatedArray[1].two, array[1].two)
assert(inflatedArray[2][0][0][0], array[2][0][0][0])

console.log("Tests passed successfully")