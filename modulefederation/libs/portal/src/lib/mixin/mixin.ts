export function registerMixins(clazz: any, mixin: Function) : any {
    const prototype = Object.getPrototypeOf(clazz)
  
    if ( prototype.constructor.name !== "Object") {
      const mixins =  [... prototype.constructor["$mixins"] || []]
      if ( !mixins.includes(mixin))
        mixins.push(mixin)

      clazz.constructor["$mixins"] = mixins
    }
    
    else 
      clazz.constructor["$mixins"] = [mixin]

      return clazz
  }
  

  
  export function hasMixin(object: any, mixin: Function) {
    let clazz = object.constructor
  
    while (clazz?.constructor?.name != 'Object') {
      const mixins = clazz?.constructor["$mixins"]
      if (mixins)
         return mixins.includes(mixin)
   
      // next
   
      clazz = Object.getPrototypeOf(clazz)
     }
  
     return false
  }