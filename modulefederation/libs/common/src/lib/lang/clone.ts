
  export function cloneDeep(source: any)  {
    if (source === null)
      return source

    else if (source instanceof Date)
      return new Date(source.getTime())

    else if (typeof source === 'object') {
      // its an array

      if (typeof source[(Symbol as any).iterator] === 'function')
        return source.map((element : any) => cloneDeep(element))

      // regular object

      else return Object.keys(source).reduce((result : any, property: string) => {
          result[property] = cloneDeep(source[property])

          return result
        }, {})
    }

    else return source
  }
