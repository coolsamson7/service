import { ComponentModel } from "../model/component.interface"
import { AnnotationDescriptor, InterfaceDescriptor, PropertyDescriptor, TypeDescriptor} from "../model/service.interface"


interface ConstraintHandler {
  type: string,
  name: string, // eg ...Min
  apply: (annotation: AnnotationDescriptor, type: any) => void
}

export class JSONSchemaBuilder {
    // instane data

    types = {}
    schema : any

    constraintHandlers : ConstraintHandler[] = [
      // Min
      {
        type: "integer",
        name: "jakarta.validation.constraints.Max",
        apply: (annotation: AnnotationDescriptor, type: any) => {
           type.maximum = annotation.parameters[0].value
        }
      },
      // Max
      {
       type: "integer",
       name: "jakarta.validation.constraints.Min",
       apply: (annotation: AnnotationDescriptor, type: any) => {
          type.minimum = annotation.parameters[0].value
       }
      },
      // Size
      {
        type: "string",
        name: "jakarta.validation.constraints.Size",
        apply: (annotation: AnnotationDescriptor, type: any) => {
          type.minLength = annotation.parameters[0].value
          type.maxLength = annotation.parameters[1].value
        }
        }
      // TODO: more
     ]

    // constructor

    constructor(model: ComponentModel) {
        for ( let descriptor of model.models) {
            let kind = descriptor.kind.split(" ")
            if ( kind.find((kind) => kind == "class") && !kind.find((kind) => kind == "enum"))
                this.types[descriptor.name] = descriptor
        }
  
    }

    // public

    createPropertySchema(type: TypeDescriptor, property: PropertyDescriptor) : any {
    
      let schema = {
        required: !type.optional
      }

      this.mapLiteralType(type.name, property, schema)

      return schema
    }

    createSchema(descriptor: InterfaceDescriptor) {
        try {
         this.schema = {
                //$schema: "https://json-schema.org/draft/2020-12/schema",
                //$id: "http://serious.com/" + descriptor.name + ".schema.json", // TODO
                //title: descriptor.name,
                description: "",
                type: "object",
                required: []
            }

            this.schema.properties = this.createProperties(descriptor)
            this.schema.required = descriptor.properties.filter((property: PropertyDescriptor) => !property.type["optional"]).map((property) => property.name)

            return this.schema
        }
        finally {
            this.schema = undefined
        }
    }

    // private

    private type(name: string) {
        return (this.schema.$types || {})[name]
    }

    private addType(name: string, type: any) {
        let types = this.schema.$types
        if (!types) {
            this.schema.$types = types = {}
        }

        types[name] = type

    }

    private isLiteral(type: string) : boolean {
     if (this.types[type])
        return false

      return true // ???
   }

   private isObject(type: string) : boolean {
    if (this.types[type])
       return true

    return false // ???
  }

   mapLiteralType(typeName: string, property: PropertyDescriptor, type: any) {
    switch ( typeName ) {
      case  "kotlin.Any":
        type.type = "any" // TODO
        break;

     case  "kotlin.String":
        type.type = "string"
        break;

      case  "kotlin.Boolean":
        type.type = "boolean"
        break;

      case  "kotlin.Short":
      case  "kotlin.Int":
      case  "kotlin.Long":
        type.type = "integer"
        break;

      case  "kotlin.Float":
      case  "kotlin.Double":
        type.type = "number"
        break;

      case  "java.net.URI":
            type.type = "string"
            type.format = "uri"
            break;

      default:
        console.log("strange type " + typeName)
    }


    // todo: just a hack here

    let findAndApplyHandler = (annotation: AnnotationDescriptor , type: string,  schema: any) => {
      for ( let handler of this.constraintHandlers) {
        if ( handler.type === type && handler.name === annotation.name) {
          handler.apply(annotation, schema)
          return
        }
      }
    }


    for ( let annotation of property.annotations) {
      findAndApplyHandler(annotation, type.type, type)
    }
   }

   private isArray(type: string) :boolean {
    switch ( type) {
      case "kotlin.collections.List":
      case "kotlin.collections.Collection": // "minItems": 1,
        return true;

      default:
        return false
    }
   }

   /*private createObjectType(descriptor: InterfaceDescriptor) {
     return {
       type: "object",
       properties: this.createProperties(descriptor),
       required: descriptor.properties.filter((property) => !property.type.optional).map((property) => property.name)
     }
   }*/

   private referenceType(property: PropertyDescriptor) {
    let propertyName = property.name
    let type = this.type(propertyName)
    if ( !type ) {
        this.addType(propertyName, {})
        this.addType(propertyName, this.createType(property))
    }

    return {
        "$ref": "#/$types/" + property.name
      }
   }

   private createType(property: PropertyDescriptor) {
    let typeName = property.type?.name

    let result : any = {
      type: typeName
    }

    // object

    if (this.isObject(typeName)) {
      result.type = "object"
      result.properties = this.createProperties(this.types[typeName])
      result.required = this.types[typeName].properties.filter((property) => !property.type.optional).map((property) => property.name)
    }

    // array

    if ( this.isArray(typeName)) {
      result.type = "array"

      let itemTypeName = property.type.parameter[0].name

      if ( this.isObject(itemTypeName))
        result.items = this.referenceType({name: itemTypeName, type:  this.types[itemTypeName], annotations: []}) // HACK TODO
    else {
        result.items = {}
        this.mapLiteralType(itemTypeName, {name: itemTypeName, type: null, annotations: []},  result.items)
         }
    }

    // literal

    else if (this.isLiteral(typeName)) {
      this.mapLiteralType(typeName, property, result)
    }

    // TODO: enum

    // done

    return result
   }

   private getKind(descriptor: InterfaceDescriptor) : string[] {
     return descriptor.kind.split(" ")
   }

   private isClass(descriptor: InterfaceDescriptor) : boolean {
     return this.getKind(descriptor).find((kind) => kind == "class") != undefined
   }

   private createProperties(descriptor: InterfaceDescriptor) {
    let properties = {}

    for ( let property of descriptor.properties)
      properties[property.name] = this.createType(property)

    return properties
   }
}