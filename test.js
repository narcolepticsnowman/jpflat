#!/usr/bin/env node
const {flatten, inflate} = require('./index.js')
const assert = (expected,actual)=>{
    if(expected !== actual){
        throw new Error(`expected did not equal actual.\n  expected: ${expected}\n  actual: ${actual}`)
    }
}

const run = async ()=> {

    console.log( "Test object root" )

    let now = new Date()
    const orig = {
        name: 'bob',
        datas: {
            some: {
                foos: true,
                arrays: [ "arrays", [ [ 1, { arraysies: [ "arrays", [ [ 1 ], [ 2 ], [ 3 ] ] ] } ], [ 2 ], [ 3 ] ] ],
            },
            rayray: [ { nested: { rayray: [ true, false ] } } ],
            stuff: -9

        },
        date: Promise.resolve(now),
        '127.0.0.1':'no place like home',
        'this.stuff': [[[{'is.deep':true}]]],
        moData: [ "arrays", [ "and", [ "arrays" ], [ "andArrays", [ [ { number: 1 } ], [ 2 ], [ 3 ] ] ], [ "andArrays" ] ] ]
    }

    const flat = await flatten( orig )
    console.log( flat )
    assert( Object.keys( flat ).length, 24 )
    assert( flat[ '$.127\\.0\\.0\\.1' ], orig[ '127.0.0.1' ] )
    assert( flat[ '$.this\\.stuff[0][0][0].is\\.deep' ], orig[ 'this.stuff' ][ 0 ][ 0 ][ 0 ][ 'is.deep' ] )
    assert( flat[ '$.name' ], orig.name )
    assert( flat[ '$.date' ], "DATE_"+now.toISOString() )
    assert( flat[ '$.datas.some.foos' ], orig.datas.some.foos )
    assert( flat[ '$.datas.some.arrays[0]' ], orig.datas.some.arrays[ 0 ] )
    assert( flat[ '$.datas.some.arrays[1][0][1].arraysies[0]' ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 0 ] )
    assert( flat[ '$.datas.some.arrays[1][0][1].arraysies[1][0][0]' ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 0 ][ 0 ] )
    assert( flat[ '$.datas.some.arrays[1][0][1].arraysies[1][1][0]' ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 1 ][ 0 ] )
    assert( flat[ '$.datas.some.arrays[1][0][1].arraysies[1][2][0]' ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 2 ][ 0 ] )
    assert( flat[ '$.datas.some.arrays[1][0][0]' ], orig.datas.some.arrays[ 1 ][ 0 ][ 0 ] )
    assert( flat[ '$.datas.some.arrays[1][1][0]' ], orig.datas.some.arrays[ 1 ][ 1 ][ 0 ] )
    assert( flat[ '$.datas.some.arrays[1][2][0]' ], orig.datas.some.arrays[ 1 ][ 2 ][ 0 ] )
    assert( flat[ '$.datas.rayray[0].nested.rayray[0]' ], orig.datas.rayray[ 0 ].nested.rayray[ 0 ] )
    assert( flat[ '$.datas.rayray[0].nested.rayray[1]' ], orig.datas.rayray[ 0 ].nested.rayray[ 1 ] )
    assert( flat[ '$.datas.stuff' ], orig.datas.stuff )
    assert( flat[ '$.moData[0]' ], orig.moData[ 0 ] )
    assert( flat[ '$.moData[1][0]' ], orig.moData[ 1 ][ 0 ] )
    assert( flat[ '$.moData[1][1][0]' ], orig.moData[ 1 ][ 1 ][ 0 ] )
    assert( flat[ '$.moData[1][2][0]' ], orig.moData[ 1 ][ 2 ][ 0 ] )
    assert( flat[ '$.moData[1][2][1][0][0].number' ], orig.moData[ 1 ][ 2 ][ 1 ][ 0 ][ 0 ].number )
    assert( flat[ '$.moData[1][2][1][1][0]' ], orig.moData[ 1 ][ 2 ][ 1 ][ 1 ][ 0 ] )
    assert( flat[ '$.moData[1][2][1][2][0]' ], orig.moData[ 1 ][ 2 ][ 1 ][ 2 ][ 0 ] )
    assert( flat[ '$.moData[1][3][0]' ], orig.moData[ 1 ][ 3 ][ 0 ] )

    const inflated = await inflate( flat )
    console.log( inflated )
    assert( inflated["127.0.0.1"], orig["127.0.0.1"])
    assert( inflated['this.stuff'][0][0][0]['is.deep'], orig['this.stuff'][0][0][0]['is.deep'])
    assert( inflated.name, orig.name )
    assert( inflated.date.getTime(), now.getTime() )
    assert( inflated.datas.some.foos, orig.datas.some.foos )
    assert( inflated.datas.some.arrays[ 0 ], orig.datas.some.arrays[ 0 ] )
    assert( inflated.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 0 ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 0 ] )
    assert( inflated.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 0 ][ 0 ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 0 ][ 0 ] )
    assert( inflated.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 1 ][ 0 ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 1 ][ 0 ] )
    assert( inflated.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 2 ][ 0 ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 2 ][ 0 ] )
    assert( inflated.datas.some.arrays[ 1 ][ 0 ][ 0 ], orig.datas.some.arrays[ 1 ][ 0 ][ 0 ] )
    assert( inflated.datas.some.arrays[ 1 ][ 1 ][ 0 ], orig.datas.some.arrays[ 1 ][ 1 ][ 0 ] )
    assert( inflated.datas.some.arrays[ 1 ][ 2 ][ 0 ], orig.datas.some.arrays[ 1 ][ 2 ][ 0 ] )
    assert( inflated.datas.rayray[ 0 ].nested.rayray[ 0 ], orig.datas.rayray[ 0 ].nested.rayray[ 0 ] )
    assert( inflated.datas.rayray[ 0 ].nested.rayray[ 1 ], orig.datas.rayray[ 0 ].nested.rayray[ 1 ] )
    assert( inflated.datas.stuff, orig.datas.stuff )
    assert( inflated.moData[ 0 ], orig.moData[ 0 ] )
    assert( inflated.moData[ 1 ][ 0 ], orig.moData[ 1 ][ 0 ] )
    assert( inflated.moData[ 1 ][ 1 ][ 0 ], orig.moData[ 1 ][ 1 ][ 0 ] )
    assert( inflated.moData[ 1 ][ 2 ][ 0 ], orig.moData[ 1 ][ 2 ][ 0 ] )
    assert( inflated.moData[ 1 ][ 2 ][ 1 ][ 0 ][ 0 ].number, orig.moData[ 1 ][ 2 ][ 1 ][ 0 ][ 0 ].number )
    assert( inflated.moData[ 1 ][ 2 ][ 1 ][ 1 ][ 0 ], orig.moData[ 1 ][ 2 ][ 1 ][ 1 ][ 0 ] )
    assert( inflated.moData[ 1 ][ 2 ][ 1 ][ 2 ][ 0 ], orig.moData[ 1 ][ 2 ][ 1 ][ 2 ][ 0 ] )
    assert( inflated.moData[ 1 ][ 3 ][ 0 ], orig.moData[ 1 ][ 3 ][ 0 ] )

    console.log( "Test array root" )
    const array = [ 1, { two: 2 }, [ [ [ 3 ] ] ] ]

    const flatArray = await flatten( array )
    console.log( flatArray )

    assert( flatArray[ '$[0]' ], array[ 0 ] )
    assert( flatArray[ '$[1].two' ], array[ 1 ].two )
    assert( flatArray[ '$[2][0][0][0]' ], array[ 2 ][ 0 ][ 0 ][ 0 ] )

    const inflatedArray = await inflate( flatArray )
    console.log( inflatedArray )

    assert( inflatedArray[ 0 ], array[ 0 ] )
    assert( inflatedArray[ 1 ].two, array[ 1 ].two )
    assert( inflatedArray[ 2 ][ 0 ][ 0 ][ 0 ], array[ 2 ][ 0 ][ 0 ][ 0 ] )

}

run().then(()=>console.log( "Tests passed successfully" ))