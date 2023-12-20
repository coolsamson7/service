import { ComponentModel } from "../model/component.interface"
import {
  AnnotationDescriptor,
  InterfaceDescriptor,
  MethodDescriptor,
  ParameterDescriptor,
  TypeDescriptor
} from "../model/service.interface"
import { JSONSchemaBuilder } from "./json-schema-builder"

export enum ParameterType {
  PATH_VARIABLE,
  REQUEST_PARAM,
  BODY,
}

export interface QueryParameter {
  name : string
  description : string
  parameterType : ParameterType
  type : TypeDescriptor
  schema : any
  value : any
}

export interface Query {
  method : string, // get, post, put
  url : string
  params : QueryParameter[]
}

export class QueryAnalyzer {
  // instance data

  urlPrefix : string = ""
  schmaBuilder : JSONSchemaBuilder

  // constructor

  constructor(private service : InterfaceDescriptor, private model : ComponentModel) {
    this.urlPrefix = ""
    this.schmaBuilder = new JSONSchemaBuilder(this.model)

    let annotation
    if ((annotation = service.annotations.find(annotation => annotation.name.endsWith("RequestMapping"))) != undefined) {
      this.urlPrefix = annotation.parameters.find(param => param.name == "value").value[0]
    }
  }

  analyzeMethod(method : MethodDescriptor) : Query {
    let mapping : AnnotationDescriptor
    if ((mapping = this.findAnnotation(method, "GetMapping")) != undefined)
      return this.analyzeGetMapping(method, mapping)

    else if ((mapping = this.findAnnotation(method, "PostMapping")) != undefined)
      return this.analyzePostMapping(method, mapping)

    else if ((mapping = this.findAnnotation(method, "PutMapping")) != undefined)
      return this.analyzePutMapping(method, mapping)

    return undefined
  }

  findAnnotation(method : MethodDescriptor, mapping : string) : AnnotationDescriptor {
    return method.annotations.find(annotation => annotation.name.endsWith(mapping))
  }

  defaultValue4(type : TypeDescriptor) {
    switch (type.name) {
      case "kotlin.String":
        return ""


      case "kotlin.Short":
      case "kotlin.Int":
      case "kotlin.Long":
        return 0

      case "kotlin.Float":
      case "kotlin.Double":
        return 0.0

      case "kotlin.Boolean":
        return false

      case "java.util.Date":
        return "" // TODO date

      default:
        let model = this.model.models.find(model => model.name == type.name)
        if (model?.kind.includes("enum"))
          return model.properties[0].name
        else
          console.log("strange type " + type.name)

        return ""
    }
  }

  analyzeParameters(method : MethodDescriptor, query : Query) {
    // local functions

    let findAnnotation = (parameter : ParameterDescriptor, name : string) => {
      return parameter.annotations.find(annotation => annotation.name.endsWith(name))
    }

    let findParameter = (annotation : AnnotationDescriptor, name : string) => {
      return annotation.parameters.find(param => param.name == name)
    }

    // let's go

    for (let parameter of method.parameters) {
      let annotation;

      // path variable

      if ((annotation = findAnnotation(parameter, "PathVariable")) != undefined) {
        let name = parameter.name

        let value;
        if ((value = findParameter(annotation, "value")) != undefined) {
          name = value.value
        }

        this.schmaBuilder.createSchema

        query.params.push({
          name: name, description: "",
          parameterType: ParameterType.PATH_VARIABLE,
          type: parameter.type,
          schema: this.schmaBuilder.createPropertySchema(parameter.type, parameter),
          value: this.defaultValue4(parameter.type)
        })
      }

      // request param

      else if ((annotation = findAnnotation(parameter, "RequestParam")) != undefined) {
        let name = parameter.name

        let value;
        if ((value = findParameter(annotation, "value")) != undefined) {
          name = value.value
        }

        query.params.push({
          name: name,
          description: "",
          parameterType: ParameterType.REQUEST_PARAM,
          type: parameter.type,
          schema: this.schmaBuilder.createPropertySchema(parameter.type, parameter),
          value: this.defaultValue4(parameter.type)
        })
      }

      // body

      else if ((annotation = findAnnotation(parameter, "RequestBody")) != undefined) {
        let name = parameter.name

        let value;
        if ((value = findParameter(annotation, "value")) != undefined) {
          name = value.value
        }

        let descriptor = this.model.models.find(model => model.name == parameter.type.name)
        let schema = this.schmaBuilder.createSchema(descriptor)
        let defaultValue = this.createDefaultJSON(schema)

        query.params.push({
          name: name,
          description: "",
          parameterType: ParameterType.BODY,
          type: parameter.type,
          schema: schema,
          value: defaultValue
        })
      }
    }
  }

  analyzeGetMapping(method : MethodDescriptor, mapping : AnnotationDescriptor) : Query {
    let query : Query = {
      method: "get",
      url: this.urlPrefix + mapping.parameters.find(param => param.name == "value").value[0],
      params: []
    }

    this.analyzeParameters(method, query)

    return query
  }

  analyzePostMapping(method : MethodDescriptor, mapping : AnnotationDescriptor) : Query {
    let query : Query = {
      method: "post",
      url: this.urlPrefix + mapping.parameters.find(param => param.name == "value").value[0],
      params: []
    }

    this.analyzeParameters(method, query)

    return query
  }

  analyzePutMapping(method : MethodDescriptor, mapping : AnnotationDescriptor) : Query {
    let query : Query = {
      method: "put",
      url: this.urlPrefix + mapping.parameters.find(param => param.name == "value").value[0],
      params: []
    }

    this.analyzeParameters(method, query)

    return query
  }

  private createDefaultJSON(schema : any) : string {
    let json = {}

    for (let property in schema.properties) {
      let value
      switch (schema.properties[property].type) {
        case "string":
          value = "";
          break;

        case "integer":
        case "number":
          value = 0
          break;

        case "boolean":
          value = false
          break;

        case undefined: // enum!
          value = schema.properties[property].enum[0]
          break;

        default:
          value = ""
      }

      json[property] = value
    }


    return JSON.stringify(json, null, "\t")

    //TODO this.parameter.value =
  }
}
