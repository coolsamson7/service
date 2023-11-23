import { param } from "jquery"
import { ComponentModel } from "../model/component.interface"
import { AnnotationDescriptor, InterfaceDescriptor , MethodDescriptor, ParameterDescriptor, PropertyDescriptor, TypeDescriptor} from "../model/service.interface"


export enum ParameterType {
  PATH_VARIABLE,
  REQUEST_PARAM,
  BODY,
}

export interface QueryParameter {
  name: string
  description: string
  parameterType: ParameterType
  type: TypeDescriptor
  value: any
}

export interface Query {
  method: string, // get, post, put
  url: string
  params: QueryParameter[]
}

export class QueryAnalyzer {
     // instance data

     urlPrefix: string = ""

     // constructor

     constructor(private service: InterfaceDescriptor) {
      this.urlPrefix = ""

      let annotation
      if ((annotation = service.annotations.find(annotation => annotation.name.endsWith("RequestMapping"))) != undefined) {
        this.urlPrefix = annotation.parameters.find(param => param.name == "value").value[0]
      }
  }


  analyzeMethod(method: MethodDescriptor) : Query {
    let mapping : AnnotationDescriptor
    if (( mapping = this.findAnnotation(method, "GetMapping")) != undefined)
      return this.analyzeGetMapping(method, mapping)
    
    else if (( mapping = this.findAnnotation(method, "PostMapping")) != undefined)
      return this.analyzePostMapping(method, mapping)
    
    else if (( mapping = this.findAnnotation(method, "PutMapping")) != undefined)
      return this.analyzePutMapping(method, mapping)

    return undefined
  }

  findAnnotation(method: MethodDescriptor, mapping: string) :AnnotationDescriptor {
    return method.annotations.find(annotation => annotation.name.endsWith(mapping))
  }

  defaultValue4(type: TypeDescriptor) {
    switch (type.name) {
      case "kotlin.String":
        return ""

      case "kotlin.Int":
          return 0

      default:
         return "" // TODO
    }
  }

  analyzeParameters(method: MethodDescriptor, query: Query) {
    // local functions

    let findAnnotation = (parameter: ParameterDescriptor, name: string) => {
      return parameter.annotations.find(annotation => annotation.name.endsWith(name)) 
    }

    let findParameter = (annotation: AnnotationDescriptor, name: string) => {
      return annotation.parameters.find(param => param.name == name) 
    }

    // let's go

    for ( let parameter of method.parameters) {
      let annotation;

      // path variable

      if ((annotation = findAnnotation(parameter, "PathVariable")) != undefined) {
         let name = parameter.name

         let value;
         if ((value = findParameter(annotation, "value")) != undefined) {
            name = value.value
         }

         query.params.push({ name: name, description: "", parameterType: ParameterType.PATH_VARIABLE, type: parameter.type, value: this.defaultValue4(parameter.type) })
      }

      // request param

      else if ((annotation = findAnnotation(parameter, "RequestParam")) != undefined) {
        let name = parameter.name

        let value;
        if ((value = findParameter(annotation,  "value")) != undefined) {
          name = value.value
        }

        query.params.push({ name: name, description: "", parameterType: ParameterType.REQUEST_PARAM, type: parameter.type, value: this.defaultValue4(parameter.type) })
      }

      // body

      else if ((annotation = findAnnotation(parameter, "RequestBody")) != undefined) {
        let name = parameter.name

        let value;
        if ((value = findParameter(annotation,  "value")) != undefined) {
          name = value.value
        }

        query.params.push({ name: name, description: "", parameterType: ParameterType.BODY, type: parameter.type, value: this.defaultValue4(parameter.type) })
      }
    }
  }

  analyzeGetMapping(method: MethodDescriptor, mapping: AnnotationDescriptor) : Query {
    let query : Query = {
        method: "get",
        url: this.urlPrefix + mapping.parameters.find(param => param.name == "value").value[0],
        params: []
    }

    this.analyzeParameters(method, query)

    return query
  }

  analyzePostMapping(method: MethodDescriptor, mapping: AnnotationDescriptor)  : Query {
    let query : Query = {
      method: "post",
      url: this.urlPrefix + mapping.parameters.find(param => param.name == "value").value[0],
      params: []
  }

  this.analyzeParameters(method, query)

  return query
  }


   analyzePutMapping(method: MethodDescriptor, mapping: AnnotationDescriptor) : Query {
    let query : Query = {
      method: "put",
      url: this.urlPrefix + mapping.parameters.find(param => param.name == "value").value[0],
      params: []
  }

  this.analyzeParameters(method, query)

  return query
  }
}

export class JSONSchemaBuilder {
    // instane data

    types = {}
    schema : any

    // constructor

    constructor(model: ComponentModel) {
        for ( let descriptor of model.models) {
            let kind = descriptor.kind.split(" ")
            if ( kind.find((kind) => kind == "class") && !kind.find((kind) => kind == "enum"))
                this.types[descriptor.name] = descriptor
        }
  
    }
    // public

    createSchema(descriptor: InterfaceDescriptor) {
        try {
         this.schema = {
                $schema: "https://json-schema.org/draft/2020-12/schema",
                $id: "https://example.com/" + descriptor.name + ".schema.json", // TODO
                title: descriptor.name,
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

  private mapLiteralType(typeName: string, property: PropertyDescriptor, type: any) {
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


    for ( let annotation of property.annotations) {
        // TODO
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