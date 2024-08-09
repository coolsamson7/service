import { ValidationContext } from "../validation-context"

import { Type } from "./type"

/**
 * this constraint class adds specific checks for records ( e.g. mappings of string properties to value types ) .
 */
export class RecordConstraint<T> extends Type<T> {
    // constructor

    constructor(public value: Type<any>, name?: string) {
        super(name)

        this.test({
            type: "record",
            name: "type",
            params: {
                type: "record",
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

        // check elements

        if (object !== undefined && this.value) {
            const path = context.path

            // check all properties

            for (const property of Object.getOwnPropertyNames(object)) {
                context.path = path + "." + property

                this.value!.check(Reflect.get(object as any, property), context)
            } // for

            context.path = path
        }
    }
}

export const record = <T>(constraint: Type<T>, name?: string) => new RecordConstraint(constraint, name)
