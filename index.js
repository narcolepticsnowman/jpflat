module.exports = {
    /**
     * Flatten an object to a single level where the keys are json paths
     * @param obj The object to flatten
     * @returns Object A new flatter, and possibly shinier, object
     */
    flatten: ( obj ) => {
        const paths = {}
        getPathValuePairs( obj, '$', paths )
        return paths
    },

    /**
     * inflate an object back to nested objects and arrays
     * @param pathValuePairs
     */
    inflate( pathValuePairs ) {
        let paths = Object.keys( pathValuePairs )

        const newGuy = isArrayProp( paths[ 0 ].split( '.' )[ 0 ] ) ? [] : {}
        paths.forEach( k => putPath( k, newGuy, pathValuePairs[ k ] ) )
        return newGuy
    }
}

const getPathValuePairs = ( next, currPath, paths ) => {
    if( Array.isArray( next ) ) {
        next.forEach( ( n, i ) => getPathValuePairs( n, `${currPath}[${i}]`, paths ) )
    } else if( next && typeof next === 'object' ) {
        Object.keys( next )
              .forEach(
                  k =>
                      getPathValuePairs(
                          next[ k ],
                          currPath ? currPath + '.' + k : k,
                          paths
                      )
              )
    } else {
        paths[ currPath ] = next
    }
}

const getLastArray = ( indices, first ) =>
    indices.length > 1
    ? indices.slice( 0, -1 )
             .reduce(
                 ( arr, ind ) => {
                     if( !arr[ ind ] ) arr[ ind ] = []
                     return arr[ ind ]
                 },
                 first
             )
    : first

const arrayProp = ( parent, prop ) => {
    let indMarker = prop.indexOf( '[' )
    let indices = prop.slice( indMarker + 1, prop.length - 1 ).split( '][' )
    let propName = prop.slice( 0, indMarker )
    if( propName !== '$' && !Array.isArray( parent[ propName ] ) )
        parent[ propName ] = []
    return {
        lastArray: getLastArray( indices, propName === '$' ? parent : parent[ propName ] ),
        lastInd: indices[ indices.length - 1 ]
    }
}

const isArrayProp = ( prop ) => prop.endsWith( ']' )

const putPath = ( path, obj, val ) => {
    const parts = path.split( '.' )

    const parentPaths = parts.slice( 0, parts.length - 1 )

    const getOrCreate = ( parent, prop, i ) => {
        if( prop === '$' )
            return parent
        else if( prop.endsWith( ']' ) ) {
            const { lastArray, lastInd } = arrayProp( parent, prop )
            if( !lastArray[ lastInd ] )
                lastArray[ lastInd ] = {}
            return lastArray[ lastInd ]
        } else if( !parent[ prop ] ) {
            parent[ prop ] = {}
            return parent[ prop ]
        } else {
            return parent[ prop ]
        }
    }

    let prop = parts.slice( -1 )[ 0 ]
    const parent = parentPaths.reduce( getOrCreate, obj ) || obj
    if( isArrayProp( prop ) ) {
        const { lastArray, lastInd } = arrayProp( parent, prop )
        lastArray[ lastInd ] = val
    } else {
        parent[ prop ] = val
    }
}