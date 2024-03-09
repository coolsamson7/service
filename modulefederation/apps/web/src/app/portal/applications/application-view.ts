import { ConfigurationProperty } from "../config/configuration-model"

export abstract class ApplicationView {
   abstract save() : void

      // strip inherited

   protected stripInherited(configuration: ConfigurationProperty) : ConfigurationProperty {
         const result : ConfigurationProperty = {
           type: "object",
           value: []
         }
 
         // copy all values which either dont't inherit or overwrite
 
         const copy = (properties: ConfigurationProperty[], result: ConfigurationProperty[]) => {
           for ( const property of properties) {
             const newProperty = {...property}
             if ( property.inherits == undefined || property.value !== property.inherits.value)
                 result.push(newProperty)
 
             // recursion
 
             if ( property.type == "object") {
                 newProperty.value = []
                 copy(property.value, newProperty.value)
             } // if
           } // for
         }
 
         // go
 
         copy(configuration.value, result.value)
 
         // done
 
         return result
       }
 
}
