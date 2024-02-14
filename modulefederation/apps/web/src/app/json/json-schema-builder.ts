import { ComponentModel } from "../model/component.interface"
import {
    AnnotationDescriptor,
    InterfaceDescriptor,
    PropertyDescriptor,
    TypeDescriptor
} from "../model/service.interface"


interface ConstraintHandler {
    type : string[],
    name : string, // eg ...Min
    apply : (annotation : AnnotationDescriptor, type : any) => void
}

export class JSONSchemaBuilder {
    // instance data

    types : { [key : string] : InterfaceDescriptor } = {}
    schema : any

    constraintHandlers : ConstraintHandler[] = [
        // Min
        {
            type: ["integer", "number"],
            name: "jakarta.validation.constraints.Max",
            apply: (annotation : AnnotationDescriptor, type : any) => {
                type.maximum = annotation.parameters[0].value
            }
        },
        // Max
        {
            type: ["integer", "number"],
            name: "jakarta.validation.constraints.Min",
            apply: (annotation : AnnotationDescriptor, type : any) => {
                type.minimum = annotation.parameters[0].value
            }
        },
        // DecimalMax
        {
            type: ["integer", "number"],
            name: "jakarta.validation.constraints.DecimalMax",
            apply: (annotation : AnnotationDescriptor, type : any) => {
                if (annotation.parameters[1].value) // inclusive
                    type.maximum = annotation.parameters[0].value
                else
                    type.exclusiveMaximum = annotation.parameters[0].value
            }
        },
        // DecimalMin
        {
            type: ["integer", "number"],
            name: "jakarta.validation.constraints.DecimalMin",
            apply: (annotation : AnnotationDescriptor, type : any) => {
                if (annotation.parameters[1].value) // inclusive
                    type.minimum = annotation.parameters[0].value
                else
                    type.minimumMinimum = annotation.parameters[0].value
            }
        },
        // Positive
        {
            type: ["integer", "number"],
            name: "jakarta.validation.constraints.Positive",
            apply: (annotation : AnnotationDescriptor, type : any) => {
                type.minimum = 1
            }
        },
        // PositiveOrZero
        {
            type: ["integer", "number"],
            name: "jakarta.validation.constraints.PositiveOrZero",
            apply: (annotation : AnnotationDescriptor, type : any) => {
                type.minimum = 0
            }
        },
        // Size
        {
            type: ["string"],
            name: "jakarta.validation.constraints.Size",
            apply: (annotation : AnnotationDescriptor, type : any) => {
                type.minLength = annotation.parameters[0].value
                type.maxLength = annotation.parameters[1].value
            }
        },
        // Email
        {
            type: ["string"],
            name: "jakarta.validation.constraints.Email",
            apply: (annotation : AnnotationDescriptor, type : any) => {
                type.format = "email"
            }
        }

    ]

    // constructor

    constructor(model : ComponentModel) {
        for (const descriptor of model.models) {
            const kind = descriptor.kind.split(" ")
            if (kind.find((kind) => kind == "class") /*&& !kind.find((kind) => kind == "enum")*/)
                this.types[descriptor.name] = descriptor
        }

    }

    // public

    createPropertySchema(type : TypeDescriptor, property : PropertyDescriptor) : any {

        const schema = {
            required: !type.optional
        }

        this.mapLiteralType(type.name, property, schema)

        return schema
    }

    createSchema(descriptor : InterfaceDescriptor) {
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
            this.schema.required = descriptor.properties.filter((property : PropertyDescriptor) => !property.type["optional"]).map((property) => property.name)

            return this.schema
        } finally {
            this.schema = undefined
        }
    }

    // private

    mapLiteralType(typeName : string, property : PropertyDescriptor, type : any) {
        switch (typeName) {
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

            case  "java.util.Date":
                type.type = "string"
                type.format = "date-time"
                break;

            case  "java.net.URI":
                type.type = "string"
                type.format = "uri"
                break;

            default: {
                const model = this.types[typeName]
                if (model && model.kind.includes("enum")) {
                    type.enum = model.properties.map(property => property.name)
                }
                else
                    console.log("strange type " + typeName) // TODO
                break;
            }
        }


        // todo: just a hack here

        const findAndApplyHandler = (annotation : AnnotationDescriptor, type : string, schema : any) => {
            for (const handler of this.constraintHandlers) {
                if (handler.type.includes(type) && handler.name === annotation.name) {
                    handler.apply(annotation, schema)
                    return
                }
            }
        }


        for (const annotation of property.annotations) {
            findAndApplyHandler(annotation, type.type, type)
        }
    }

    private type(name : string) {
        return (this.schema.$types || {})[name]
    }

    private addType(name : string, type : any) {
        let types = this.schema.$types
        if (!types) {
            this.schema.$types = types = {}
        }

        types[name] = type
    }

    private isLiteral(type : string) : boolean {
        if (this.types[type])
            return this.types[type].kind.includes("enum")

        return true
    }

    private isObject(type : string) : boolean {
        const model = this.types[type]

        return (model != undefined && !model.kind.includes("enum"))
    }

    private isEnum(type : string) : boolean {
        const model = this.types[type]

        return (model != undefined && !model.kind.includes("enum"))
    }

    private isArray(type : string) : boolean {
        switch (type) {
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

    private referenceType(property : PropertyDescriptor) {
        const propertyName = property.name
        const type = this.type(propertyName)
        if (!type) {
            this.addType(propertyName, {})
            this.addType(propertyName, this.createType(property))
        }

        return {
            "$ref": "#/$types/" + property.name
        }
    }

    private createType(property : PropertyDescriptor) {
        const typeName = property.type?.name

        const result : any = {}

        // object

        if (this.isObject(typeName)) {
            result.type = "object"
            result.properties = this.createProperties(this.types[typeName])
            result.required = this.types[typeName].properties.filter((property) => !property.type.optional).map((property) => property.name)
        }

        // array

        if (this.isArray(typeName)) {
            result.type = "array"

            const itemTypeName = property.type.parameter[0].name

            if (this.isObject(itemTypeName)) { // @ts-ignore
                result.items = this.referenceType({name: itemTypeName, type: this.types[itemTypeName], annotations: []})
            } // HACK TODO

            else {
                result.items = {}
                // @ts-ignore
                this.mapLiteralType(itemTypeName, {name: itemTypeName, type: null, annotations: []}, result.items)
            }
        }

        // literal

        else if (this.isLiteral(typeName)) {
            this.mapLiteralType(typeName, property, result)
        }

        // done

        return result
    }

    private getKind(descriptor : InterfaceDescriptor) : string[] {
        return descriptor.kind.split(" ")
    }

    private isClass(descriptor : InterfaceDescriptor) : boolean {
        return this.getKind(descriptor).find((kind) => kind == "class") != undefined
    }

    private createProperties(descriptor : InterfaceDescriptor) {
        const properties : { [name : string] : PropertyDescriptor } = {}

        for (const property of descriptor.properties)
            properties[property.name] = this.createType(property)

        return properties
    }
}
