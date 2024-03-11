import { AbstractFeature, WithCommands, hasMixin } from "@modulefederation/portal"
import { ConfigurationProperty } from "../config/configuration-model"
import { WithCommandToolbar } from "./toolbar/with-command-toolbar.mixin"
import { CommandToolbarComponent } from "./toolbar/command-toolbar.component"
import { Injector } from "@angular/core"

export abstract class ApplicationView extends WithCommandToolbar(WithCommands(AbstractFeature)) {
   // instance data

   override commandToolbar?: CommandToolbarComponent

   // constructor

   constructor(injector: Injector) {
      super(injector)
   }

   // abstract

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
