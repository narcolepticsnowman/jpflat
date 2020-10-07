#!/usr/bin/env node
const { flatten, inflate } = require( './index.js' )
const assert = require( 'assert' )

const run = async() => {

    console.log( 'Test object root' )

    let now = new Date()
    const orig = {
        name: 'bob',
        datas: {
            some: {
                foos: true,
                arrays: [ 'arrays', [ [ 1, { arraysies: [ 'arrays', [ [ 1 ], [ 2 ], [ 3 ] ] ] } ], [ 2 ], [ 3 ] ] ]
            },
            rayray: [ { nested: { rayray: [ true, false ] } } ],
            stuff: -9

        },
        emptyObj: {},
        emptyArr: [],
        date: Promise.resolve( now ),
        '127.0.0.1': 'no place like home',
        'this.stuff': [ [ [ { 'is.deep': true } ] ] ],
        moData: [ 'arrays', [ 'and', [ 'arrays' ], [ 'andArrays', [ [ { number: 1 } ], [ 2 ], [ 3 ] ] ], [ 'andArrays' ] ] ]
    }

    const flat = await flatten( orig, {includeArrayLength: true} )
    console.log( flat )
    assert.strictEqual( Object.keys( flat ).length, 50 )
    assert.strictEqual( flat[ '$.emptyObj' ], orig.emptyObj )
    assert.strictEqual( flat[ '$.emptyArr' ], orig.emptyArr )
    assert.strictEqual( flat[ '$.127\\.0\\.0\\.1' ], orig[ '127.0.0.1' ] )
    assert.strictEqual( flat[ '$.this\\.stuff[0][0][0].is\\.deep' ], orig[ 'this.stuff' ][ 0 ][ 0 ][ 0 ][ 'is.deep' ] )
    assert.strictEqual( flat[ '$.name' ], orig.name )
    assert.strictEqual( flat[ '$.date' ], 'DATE_' + now.toISOString() )
    assert.strictEqual( flat[ '$.datas.some.foos' ], orig.datas.some.foos )
    assert.strictEqual( flat[ '$.datas.some.arrays[0]' ], orig.datas.some.arrays[ 0 ] )
    assert.strictEqual( flat[ '$.datas.some.arrays[1][0][1].arraysies[0]' ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 0 ] )
    assert.strictEqual( flat[ '$.datas.some.arrays[1][0][1].arraysies[1][0][0]' ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 0 ][ 0 ] )
    assert.strictEqual( flat[ '$.datas.some.arrays[1][0][1].arraysies[1][1][0]' ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 1 ][ 0 ] )
    assert.strictEqual( flat[ '$.datas.some.arrays[1][0][1].arraysies[1][2][0]' ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 2 ][ 0 ] )
    assert.strictEqual( flat[ '$.datas.some.arrays[1][0][0]' ], orig.datas.some.arrays[ 1 ][ 0 ][ 0 ] )
    assert.strictEqual( flat[ '$.datas.some.arrays[1][1][0]' ], orig.datas.some.arrays[ 1 ][ 1 ][ 0 ] )
    assert.strictEqual( flat[ '$.datas.some.arrays[1][2][0]' ], orig.datas.some.arrays[ 1 ][ 2 ][ 0 ] )
    assert.strictEqual( flat[ '$.datas.rayray[0].nested.rayray[0]' ], orig.datas.rayray[ 0 ].nested.rayray[ 0 ] )
    assert.strictEqual( flat[ '$.datas.rayray[0].nested.rayray[1]' ], orig.datas.rayray[ 0 ].nested.rayray[ 1 ] )
    assert.strictEqual( flat[ '$.datas.stuff' ], orig.datas.stuff )
    assert.strictEqual( flat[ '$.moData[0]' ], orig.moData[ 0 ] )
    assert.strictEqual( flat[ '$.moData[1][0]' ], orig.moData[ 1 ][ 0 ] )
    assert.strictEqual( flat[ '$.moData[1][1][0]' ], orig.moData[ 1 ][ 1 ][ 0 ] )
    assert.strictEqual( flat[ '$.moData[1][2][0]' ], orig.moData[ 1 ][ 2 ][ 0 ] )
    assert.strictEqual( flat[ '$.moData[1][2][1][0][0].number' ], orig.moData[ 1 ][ 2 ][ 1 ][ 0 ][ 0 ].number )
    assert.strictEqual( flat[ '$.moData[1][2][1][1][0]' ], orig.moData[ 1 ][ 2 ][ 1 ][ 1 ][ 0 ] )
    assert.strictEqual( flat[ '$.moData[1][2][1][2][0]' ], orig.moData[ 1 ][ 2 ][ 1 ][ 2 ][ 0 ] )
    assert.strictEqual( flat[ '$.moData[1][3][0]' ], orig.moData[ 1 ][ 3 ][ 0 ] )

    assert.strictEqual( flat['$.datas.some.arrays[1][0][1].arraysies[1][0].length'], 1 )
    assert.strictEqual( flat['$.datas.some.arrays[1][0][1].arraysies[1][1].length'], 1 )
    assert.strictEqual( flat['$.datas.some.arrays[1][0][1].arraysies[1][2].length'], 1 )
    assert.strictEqual( flat['$.datas.some.arrays[1][0][1].arraysies[1].length'], 3 )
    assert.strictEqual( flat['$.datas.some.arrays[1][0][1].arraysies.length'], 2 )
    assert.strictEqual( flat['$.datas.some.arrays[1][0].length'], 2 )
    assert.strictEqual( flat['$.datas.some.arrays[1][1].length'], 1 )
    assert.strictEqual( flat['$.datas.some.arrays[1][2].length'], 1 )
    assert.strictEqual( flat['$.datas.some.arrays[1].length'], 3 )
    assert.strictEqual( flat['$.datas.some.arrays.length'], 2 )
    assert.strictEqual( flat['$.datas.rayray[0].nested.rayray.length'], 2 )
    assert.strictEqual( flat['$.datas.rayray.length'], 1 )
    assert.strictEqual( flat['$.this\\.stuff[0][0].length'], 1 )
    assert.strictEqual( flat['$.this\\.stuff[0].length'], 1 )
    assert.strictEqual( flat['$.this\\.stuff.length'], 1 )
    assert.strictEqual( flat['$.moData[1][1].length'], 1 )
    assert.strictEqual( flat['$.moData[1][2][1][0].length'], 1 )
    assert.strictEqual( flat['$.moData[1][2][1][1].length'], 1 )
    assert.strictEqual( flat['$.moData[1][2][1][2].length'], 1 )
    assert.strictEqual( flat['$.moData[1][2][1].length'], 3 )
    assert.strictEqual( flat['$.moData[1][2].length'], 2 )
    assert.strictEqual( flat['$.moData[1][3].length'], 1 )
    assert.strictEqual( flat['$.moData[1].length'], 4 )
    assert.strictEqual( flat['$.moData.length'], 2 )


    const inflated = await inflate( flat )
    console.log( inflated )
    assert.strictEqual( inflated[ '127.0.0.1' ], orig[ '127.0.0.1' ] )
    assert.strictEqual( inflated.emptyObj, orig.emptyObj )
    assert.strictEqual( inflated.emptyArr, orig.emptyArr )
    assert.strictEqual( inflated[ 'this.stuff' ][ 0 ][ 0 ][ 0 ][ 'is.deep' ], orig[ 'this.stuff' ][ 0 ][ 0 ][ 0 ][ 'is.deep' ] )
    assert.strictEqual( inflated.name, orig.name )
    assert.strictEqual( inflated.date.getTime(), now.getTime() )
    assert.strictEqual( inflated.datas.some.foos, orig.datas.some.foos )
    assert.strictEqual( inflated.datas.some.arrays[ 0 ], orig.datas.some.arrays[ 0 ] )
    assert.strictEqual( inflated.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 0 ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 0 ] )
    assert.strictEqual( inflated.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 0 ][ 0 ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 0 ][ 0 ] )
    assert.strictEqual( inflated.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 1 ][ 0 ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 1 ][ 0 ] )
    assert.strictEqual( inflated.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 2 ][ 0 ], orig.datas.some.arrays[ 1 ][ 0 ][ 1 ].arraysies[ 1 ][ 2 ][ 0 ] )
    assert.strictEqual( inflated.datas.some.arrays[ 1 ][ 0 ][ 0 ], orig.datas.some.arrays[ 1 ][ 0 ][ 0 ] )
    assert.strictEqual( inflated.datas.some.arrays[ 1 ][ 1 ][ 0 ], orig.datas.some.arrays[ 1 ][ 1 ][ 0 ] )
    assert.strictEqual( inflated.datas.some.arrays[ 1 ][ 2 ][ 0 ], orig.datas.some.arrays[ 1 ][ 2 ][ 0 ] )
    assert.strictEqual( inflated.datas.rayray[ 0 ].nested.rayray[ 0 ], orig.datas.rayray[ 0 ].nested.rayray[ 0 ] )
    assert.strictEqual( inflated.datas.rayray[ 0 ].nested.rayray[ 1 ], orig.datas.rayray[ 0 ].nested.rayray[ 1 ] )
    assert.strictEqual( inflated.datas.stuff, orig.datas.stuff )
    assert.strictEqual( inflated.moData[ 0 ], orig.moData[ 0 ] )
    assert.strictEqual( inflated.moData[ 1 ][ 0 ], orig.moData[ 1 ][ 0 ] )
    assert.strictEqual( inflated.moData[ 1 ][ 1 ][ 0 ], orig.moData[ 1 ][ 1 ][ 0 ] )
    assert.strictEqual( inflated.moData[ 1 ][ 2 ][ 0 ], orig.moData[ 1 ][ 2 ][ 0 ] )
    assert.strictEqual( inflated.moData[ 1 ][ 2 ][ 1 ][ 0 ][ 0 ].number, orig.moData[ 1 ][ 2 ][ 1 ][ 0 ][ 0 ].number )
    assert.strictEqual( inflated.moData[ 1 ][ 2 ][ 1 ][ 1 ][ 0 ], orig.moData[ 1 ][ 2 ][ 1 ][ 1 ][ 0 ] )
    assert.strictEqual( inflated.moData[ 1 ][ 2 ][ 1 ][ 2 ][ 0 ], orig.moData[ 1 ][ 2 ][ 1 ][ 2 ][ 0 ] )
    assert.strictEqual( inflated.moData[ 1 ][ 3 ][ 0 ], orig.moData[ 1 ][ 3 ][ 0 ] )

    console.log( 'Test array root' )
    const array = [ 1, { two: 2 }, [ [ [ 3 ] ] ] ]

    array.foo = 'bar'

    const flatArray = await flatten( array, {includeArrayLength: true} )
    console.log( flatArray )

    assert.strictEqual( flatArray[ '$[0]' ], array[ 0 ] )
    assert.strictEqual( flatArray[ '$.foo' ], array.foo )
    assert.strictEqual( flatArray[ '$[1].two' ], array[ 1 ].two )
    assert.strictEqual( flatArray[ '$[2][0][0][0]' ], array[ 2 ][ 0 ][ 0 ][ 0 ] )
    assert.strictEqual( flatArray['$[2][0][0].length'], 1 )
    assert.strictEqual( flatArray['$[2][0].length'], 1 )
    assert.strictEqual( flatArray['$[2].length'], 1 )
    assert.strictEqual( flatArray['$.length'], 3 )

    const inflatedArray = await inflate( flatArray )
    console.log( inflatedArray )

    assert.strictEqual( inflatedArray.foo, array.foo )
    assert.strictEqual( inflatedArray[ 0 ], array[ 0 ] )
    assert.strictEqual( inflatedArray[ 1 ].two, array[ 1 ].two )
    assert.strictEqual( inflatedArray[ 2 ][ 0 ][ 0 ][ 0 ], array[ 2 ][ 0 ][ 0 ][ 0 ] )

}

run()
    .then( () => console.log( 'Tests passed successfully' ) )
    .catch( e => {
        console.error( 'Tests failed!\n' + e )
        process.exit( 1 )
    } )