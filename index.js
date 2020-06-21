const dateSerializer = {
    canSerialize: ( pathParts, o ) => o instanceof Date,
    serialize: ( pathParts, date ) => 'DATE_' + date.toISOString()
}
const dateDeserializer = {
    canDeserialize: ( path, o ) => typeof o === 'string' && o.startsWith( 'DATE_' ),
    deserialize: ( path, date ) => new Date( date.slice( 'DATE_'.length ) )
}

const escapeCharacters = /(?<!\\)([.[\]])/g
const escapePropertyName = ( key ) => key.replace( escapeCharacters, ( match, $1 ) => '\\' + $1 )

let pathSerializer = {
    reduce: ( parts, value, obj ) => parts.reduce( ( path, part ) => {
        let k = typeof part.key === 'string' ? escapePropertyName( part.key ) : part.key
        if( part.isInd ) {
            return path + '[' + k + ']'
        } else {
            return path ? path + '.' + k : k
        }
    }, '' ),
    expand: ( path, value, pathValuePairs ) => {
        let parts = []
        let part = []
        let last = null

        for( let c of path ) {
            if( last !== '\\' && ( ( last !== ']' && ( c === '.' || c === '[' ) ) || c === ']' ) ) {
                parts.push( {
                                key: c === ']' ? parseInt( part.join( '' ) ) : part.join( '' ),
                                isInd: c === ']'
                            } )
                part = []
            } else if( last === '\\' || ( c !== '\\' && c !== '[' && c !== '.' && c !== ']' ) ) {
                part.push( c )
            }

            last = c
        }
        if( part.length !== 0 ) {
            parts.push( {
                            key: last === ']' ? parseInt( part.join( '' ) ) : part.join( '' ),
                            isInd: last === ']'
                        } )
        }
        return parts
    }
}

const fillPathValuePairs = async( current, pathParts, result, valueSerializers ) => {
    let next = current instanceof Promise ? await current : current
    for( let serializer of valueSerializers ) {
        if( serializer && serializer.canSerialize && serializer.canSerialize( pathParts, next ) ) {
            next = await serializer.serialize( pathParts, next )
            if( !serializer.continue )
                break
        }
    }
    if( next && typeof next === 'object' ) {
        Object.keys( next )
              .forEach(
                  k =>
                      fillPathValuePairs(
                          next[ k ],
                          pathParts.concat( { key: k, isInd: Array.isArray(next) && !isNaN(k) } ),
                          result,
                          valueSerializers
                      )
              )
    } else {
        result[ pathSerializer.reduce( pathParts ) ] = next
    }
}

let deserialize = async function( val, valueDeserializers, path ) {
    let resolvedVal = await val
    for( let deserializer of valueDeserializers ) {
        if( deserializer.canDeserialize( path, resolvedVal ) ) {
            resolvedVal = await deserializer.deserialize( path, resolvedVal )
            if( !deserializer.continue )
                break
        }
    }
    return resolvedVal
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
        await fillPathValuePairs( obj, [ { key: '$', isInd: false } ], paths, valueSerializers )
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
        let rootIsArray = false
        return ( await Promise.all(
            Object.keys( pathValuePairs )
                  .map( async path => {
                      let value = await deserialize( pathValuePairs[ path ], valueDeserializers, path )
                      let parts = pathSerializer.expand( path, value, pathValuePairs )
                      if( parts.length > 1 && parts[ 1 ].isInd ) rootIsArray = true
                      return { value, parts }
                  } )
        ) ).reduce(
            ( newGuy, { value, parts } ) => {
                parts.reduce(
                    ( current, prop, i ) => {
                        if( i === parts.length - 1 )
                            current[ prop.key ] = value
                        else
                            return prop.key === '$' ? current :
                                   current[ prop.key ] || ( current[ prop.key ] = parts[ i + 1 ].isInd ? [] : {} )
                    },
                    newGuy
                )
                return newGuy
            },
            rootIsArray ? [] : {}
        )
    },
    /**
     * overwrite the default path reducer to customize the way paths are constructed.
     *
     * The path serializer is an object with two functions, reduce and expand.
     * The reduce function receives three arguments, an array of objects representing parts of the path to the value, the value at the path, and the object being flattened.
     * The property objects have the following shape:
     *  {
     *      key: 'foo', //The property name or index of the current part of the path,
     *      isInd: false //whether the key represents an array index or object property
     *  }
     *
     *  The expand function undoes the reduce function. It takes a string, a value, and the object being inflated, then returns an array of objects equivalent to the array
     *  that was passed in to reduce.
     *
     *  The following rule must always hold (assume == is deep equals by value equality not reference equality)
     *  let pathParts = [{key:'$',isInd: false},{key:'foo',isInd: false},{key:'0',isInd: true}]
     *  pathParts == expand(reduce(pathParts))
     */
    setPathSerializer( serializer ) {
        if( !serializer ) throw Error( 'Path Serializer cannot be falsey!' )
        if( typeof serializer.reduce === 'function' ) throw Error( 'Path Serializer must provide a reduce function!' )
        if( typeof serializer.expand === 'function' ) throw Error( 'Path Serializer must provide an expand function!' )
        pathSerializer = serializer
    },
    defaultPathSerializer: pathSerializer,
    /**
     * A date to string serializer
     */
    dateSerializer,
    /**
     * A string to date deserializer
     */
    dateDeserializer
}