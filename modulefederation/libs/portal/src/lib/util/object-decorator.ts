type Decorate = (object : any) => void
export type Getter = (object : any) => any

export class ObjectDecorator {
    // instance data

    properties : { [name : string] : Decorate } = {}

    // constructor

    constructor() {
    }

    // fluent

    defaultValue(name : string, defaultValue : any) : ObjectDecorator {
        let isUndefined = (o : any) => {
            return o == null || o == undefined
        }

        this.properties[name] = (object : any) => {
            if (!Object.hasOwn(object, name) || isUndefined(object[name]))
                object[name] = defaultValue
        }

        return this
    }

    defaultValueFunction(name : string, defaultValue : Getter) : ObjectDecorator {
        let isUndefined = (o : any) => {
            return o == null || o == undefined
        }
        this.properties[name] = (object : any) => {
            if (!Object.hasOwn(object, name) || isUndefined(object[name]))
                object[name] = defaultValue(object)
        }

        return this
    }

    // public

    decorate(object : any) {
        for (let property in this.properties)
            this.properties[property](object)
    }
}
