const dateSerializer = {
    canSerialize: ( o ) => o instanceof Date,
    serialize: ( date ) => 'DATE_' + date.toISOString()
}
const dateDeserializer = {
    canDeserialize: ( o ) => typeof o === 'string' && o.startsWith( 'DATE_' ),
    deserialize: ( date ) => new Date( date.slice( 'DATE_'.length ) )
}
module.exports = {
    /**
     * Flatten an object to a single level where the keys are json paths
     * @param obj The object to flatten
     * @param valueSerializers Serializers to convert objects to a terminal value. For instance, Date => string.
     *  See dateSerializer for an example of a serializer
     * @returns Object A new flatter, and possibly shinier, object
     */
    async flatten( obj, valueSerializers = [ dateSerializer ] ) {
        const paths = {}
        await fillPathValuePairs( obj, '$', paths, valueSerializers )
        return paths
    },

    /**
     * inflate an object back to nested objects and arrays
     *
     * @param pathValuePairs
     * @param valueDeserializers Deserializers to convert values to objects. For instance, string => Date.
     *  See dateDeserializer for an example of a deserializer
     */
    async inflate( pathValuePairs, valueDeserializers = [ dateDeserializer ] ) {
        let paths = Object.keys( pathValuePairs )

        const newGuy = isArrayProp( paths[ 0 ].split( '.' )[ 0 ] ) ? [] : {}

        await Promise.all( paths.map( k => putPath( k, newGuy, pathValuePairs[ k ], valueDeserializers ) ) )
        return newGuy
    },
    /**
     * A date to string serializer
     */
    dateSerializer,
    /**
     * A string to date deserializer
     */
    dateDeserializer
}


const fillPathValuePairs = async( current, currPath, paths, valueSerializers ) => {
    let next = current instanceof Promise ? await current : current
    for( let serializer of valueSerializers ) {
        if( serializer && serializer.canSerialize && serializer.canSerialize( next ) ) {
            next = await serializer.serialize( next )
        }
    }
    if( Array.isArray( next ) ) {
        next.forEach( ( n, i ) =>
                          fillPathValuePairs(
                              n,
                              `${currPath}[${i}]`,
                              paths,
                              valueSerializers ) )
    } else if( next && typeof next === 'object' ) {
        Object.keys( next )
              .forEach(
                  k =>
                      fillPathValuePairs(
                          next[ k ],
                          currPath ? currPath + '.' + escapePropertyName(k) : escapePropertyName( k ),
                          paths,
                          valueSerializers
                      )
              )
    } else {
        paths[ currPath ] = next
    }
}

let escapeCharacters = /(?<!\\)\./g
let unescapeCharacters = /\\\./g
let splitPath = /(?<!\\)\./g

const escapePropertyName = ( key ) => key.replace( escapeCharacters, '\\.' )

const unescapePropertyName = ( key ) => key.replace( unescapeCharacters, '.' )

const targetArray = ( indices, first ) => {
    if( indices.length > 1 )
        return indices.slice( 0, -1 )
                      .reduce(
                          ( arr, ind ) => {
                              if( !arr[ ind ] ) arr[ ind ] = []
                              return arr[ ind ]
                          },
                          first
                      )
    else
        return first
}

const parseArrayProp = ( parent, prop ) => {
    let indMarker = prop.indexOf( '[' )
    let indices = prop.slice( indMarker + 1, prop.length - 1 ).split( '][' )
    let propName = unescapePropertyName( prop.slice( 0, indMarker ) )
    if( propName !== '$' && !Array.isArray( parent[ propName ] ) )
        parent[ propName ] = []
    return {
        targetArray: targetArray( indices, propName === '$' ? parent : parent[ propName ] ),
        lastInd: indices[ indices.length - 1 ]
    }
}

const isArrayProp = ( prop ) => prop.endsWith( ']' )

const putPath = async( path, obj, val, valueDeserializers ) => {
    const parts = path.split( splitPath )

    const parentPaths = parts.slice( 0, parts.length - 1 ).map( unescapePropertyName )

    const getOrCreate = ( parent, prop, i ) => {
        if( prop === '$' )
            return parent
        else if( prop.endsWith( ']' ) ) {
            const { targetArray, lastInd } = parseArrayProp( parent, prop )
            if( !targetArray[ lastInd ] )
                targetArray[ lastInd ] = {}
            return targetArray[ lastInd ]
        } else if( !parent[ prop ] ) {
            parent[ prop ] = {}
            return parent[ prop ]
        } else {
            return parent[ prop ]
        }
    }

    let resolvedVal = await val
    for( let deserializer of valueDeserializers ) {
        if( deserializer.canDeserialize( resolvedVal ) ) {
            resolvedVal = await deserializer.deserialize( resolvedVal )
        }
    }

    let prop =unescapePropertyName( parts.slice( -1 )[ 0 ])
    const parent = parentPaths.reduce( getOrCreate, obj ) || obj
    if( isArrayProp( prop ) ) {
        const { targetArray, lastInd } = parseArrayProp( parent, prop )
        targetArray[ lastInd ] = resolvedVal
    } else {
        parent[ prop ] = resolvedVal
    }
}