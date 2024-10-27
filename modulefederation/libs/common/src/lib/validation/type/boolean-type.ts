import { Type, ConstraintInfo } from "./type"

/**
 * this constraint class adds specific checks for booleans.
 */
export class BooleanConstraint extends Type<boolean> {
    // constructor

    constructor(name?: string) {
        super(name)

        this.literalType("boolean")
    }

    // fluent

    isTrue(info?: ConstraintInfo): BooleanConstraint {
        this.test({
            type: "boolean",
            name: "isTrue",
            params: {},
            ...info,
            check(object: boolean): boolean {
                return object === true
            },
        })

        return this
    }

    isFalse(info?: ConstraintInfo): BooleanConstraint {
        this.test({
            type: "boolean",
            name: "isFalse",
            params: {},
            ...info,
            check(object: boolean): boolean {
                return object === false
            },
        })

        return this
    }
}

/**
 * return a new constraint based on boolean values
 */
export const boolean = (name?: string) => new BooleanConstraint(name)
