import { Type } from "./type"
import { ValidationContext } from "../validation-context"

export type PropertyConstraints = { [property: string]: Type<any> | string }

/**
 * this constraint class adds specific checks for complex objects.
 */
export class ObjectConstraint<T = any> extends Type<T> {
    // constructor

    constructor(public shape: PropertyConstraints, name?: string) {
        super(name)

        // add possible patches

        for ( const property in shape)
            if (typeof shape[property] == "string" )
                Type.patch(shape, property, () => Type.get(<string>shape[property]))

        // add test

        this.test({
            type: "object",
            name: "type",
            params: {
                type: "object",
            },
            break: true,
            check(object: T): boolean {
                return typeof object == "object"
            },
        })
    }

    // override constraint

    override check(object: T, context: ValidationContext) {
        // super will check the object

        super.check(object, context)

        // check properties

        if (object !== undefined) {
            const path = context.path

            // check all properties

            for (const property in this.shape) {
                context.path = path === "" ? property : path + "." + property;

                (this.shape[property] as Type<any>).check(Reflect.get(object as object, property), context)
            } // for

            context.path = path
        }
    }
}

export const object = (constraints: PropertyConstraints, name?: string) => new ObjectConstraint(constraints, name)
