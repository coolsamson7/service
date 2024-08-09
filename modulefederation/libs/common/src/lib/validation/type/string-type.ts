import { Type, ConstraintInfo } from "./type"

/**
 * this constraint class adds specific checks for strings.
 */
export class StringConstraint extends Type<string> {
    // static data

    private static readonly EMAIL =
        /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    // constructor

    constructor(name?: string) {
        super(name)

        this.literalType("string")
    }

    // fluent api

    length(length: number, info?: ConstraintInfo): StringConstraint {
        this.test({
            type: "string",
            name: "length",
            params: {
                length: length,
            },
            ...info,
            check(object: string): boolean {
                return object.length === length
            },
        })

        return this
    }

    min(min: number, info?: ConstraintInfo): StringConstraint {
        this.test({
            type: "string",
            name: "min",
            params: {
                min: min,
            },
            ...info,
            check(object: string): boolean {
                return object.length >= min
            },
        })

        return this
    }

    max(max: number, info?: ConstraintInfo): StringConstraint {
        this.test({
            type: "string",
            name: "max",
            params: {
                max: max,
            },
            ...info,
            check(object: string): boolean {
                return object.length <= max
            },
        })

        return this
    }

    nonEmpty(info?: ConstraintInfo): StringConstraint {
        this.test({
            type: "string",
            name: "nonEmpty",
            params: {},
            ...info,
            check(object: string): boolean {
                return object.trim().length > 0
            },
        })

        return this
    }

    email(info?: ConstraintInfo): StringConstraint {
        this.test({
            type: "string",
            name: "email",
            params: {},
            ...info,
            check(object: string): boolean {
                return object.search(StringConstraint.EMAIL) !== -1
            },
        })

        return this
    }

    matches(re: RegExp, info?: ConstraintInfo): StringConstraint {
        this.test({
            type: "string",
            name: "matches",
            params: {
                re: re,
            },
            ...info,
            check(object: string): boolean {
                return object.search(re) !== -1
            },
        })

        return this
    }

    format(format: string, info?: ConstraintInfo): StringConstraint {
        this.test({
            type: "string",
            name: "format",
            params: {
                format: format,
            },
            ...info,
            check(object: string): boolean {
                return true // TODO add...
            },
        })

        return this
    }
}

export const string = (name?: string) => new StringConstraint(name)
