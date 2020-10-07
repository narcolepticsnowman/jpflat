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

const jsonPathPathReducer = ( parts, value, obj ) => parts.reduce( ( path, part ) => {
    let k = typeof part.key === 'string' ? escapePropertyName( part.key ) : part.key
    if( part.isInd ) {
        return path + '[' + k + ']'
    } else {
        return path ? path + '.' + k : k
    }
}, '' )

const jsonPathPathExpander = ( path, value, pathValuePairs ) => {
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

const fillPathValuePairs = async( current, pathParts, result, valueSerializers, pathReducer, includeArrayLength ) => {
    let next = current instanceof Promise ? await current : current
    for( let serializer of valueSerializers ) {
        if( serializer && serializer.canSerialize && serializer.canSerialize( pathParts, next ) ) {
            next = await serializer.serialize( pathParts, next )
            if( !serializer.continue )
                break
        }
    }
    if( next && typeof next === 'object' && Object.keys( next ).length > 0 ) {
        let keys = Array.isArray( next ) && includeArrayLength ? [ ...Object.keys( next ), 'length' ] : Object.keys( next )
        keys
            .forEach(
                k =>
                    fillPathValuePairs(
                        next[ k ],
                        pathParts.concat( { key: k, isInd: Array.isArray( next ) && !isNaN( k ) } ),
                        result,
                        valueSerializers,
                        pathReducer,
                        includeArrayLength
                    )
            )
    } else {
        result[ pathReducer( pathParts, next, result ) ] = next
    }
}

module.exports = {
    /**
     * Flatten an object to a single level where the keys are json paths
     * @param obj The object to flatten
     * @param options The options to flatten
     * @param options.valueSerializers Serializers to convert objects to a terminal value. For instance, Date => string.
     *  See dateSerializer for an example of a serializer
     * @param options.pathReducer The path reducer to use
     * @param options.includeArrayLength Whether to include array length in the properties for the array or not
     * @returns Object A new flatter, and possibly shinier, object
     */
    async flatten( obj, { valueSerializers, pathReducer, includeArrayLength } = {} ) {
        if( !valueSerializers ) valueSerializers = [ dateSerializer ]
        if( !pathReducer ) pathReducer = jsonPathPathReducer
        const paths = {}
        await fillPathValuePairs( obj, [ { key: '$', isInd: false } ], paths, valueSerializers, pathReducer, includeArrayLength )
        return paths
    },

    /**
     * inflate an object back to nested objects and arrays
     *
     * @param pathValuePairs
     * @param valueDeserializers Deserializers to convert values to objects. For instance, string => Date.
     *  See dateDeserializer for an example of a deserializer
     * @param pathExpander The path expander to use
     */
    async inflate( pathValuePairs, { valueDeserializers, pathExpander } = {}) {
        if( !valueDeserializers ) valueDeserializers = [ dateDeserializer ]
        if( !pathExpander ) pathExpander = jsonPathPathExpander
        let rootIsArray = false
        return ( await Promise.all(
            Object.keys( pathValuePairs )
                  .map( async path => {
                      let value = await pathValuePairs[ path ]
                      for( let deserializer of valueDeserializers ) {
                          if( deserializer.canDeserialize( path, value ) ) {
                              value = await deserializer.deserialize( path, value )
                              if( !deserializer.continue )
                                  break
                          }
                      }
                      let parts = pathExpander( path, value, pathValuePairs )
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
     * The default json path serializer.
     */
    jsonPathPathReducer,
    /**
     * The defualt json path expander.
     */
    jsonPathPathExpander,
    /**
     * A date to string serializer
     */
    dateSerializer,
    /**
     * A string to date deserializer
     */
    dateDeserializer
}