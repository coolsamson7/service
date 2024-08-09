import { Type, ConstraintInfo } from "./type"

/**
 * this constraint class adds specific checks for dates.
 */
export class DateConstraint extends Type<Date> {
    // constructor

    constructor(name?: string) {
        super(name)

        this.test({
            type: "date",
            name: "type",
            params: {
                type: "date",
            },
            break: true,
            check(object: Date): boolean {
                return typeof object == "object" && object.constructor.name === "Date"
            },
        })
    }

    // fluent

    min(min: Date, info?: ConstraintInfo): DateConstraint {
        this.test({
            type: "number",
            name: "min",
            params: {
                min: min,
            },
            ...info,
            check(object: Date): boolean {
                return object >= min
            },
        })

        return this
    }

    max(max: Date, info?: ConstraintInfo): DateConstraint {
        this.test({
            type: "number",
            name: "max",
            params: {
                max: max,
            },
            ...info,
            check(object: Date): boolean {
                return object <= max
            },
        })

        return this
    }

    format(format: string, info?: ConstraintInfo): DateConstraint {
        this.test({
            type: "date",
            name: "format",
            params: {
                format: format,
            },
            ...info,
            check(object: Date): boolean {
                return true // TODO add...
            },
        })

        return this
    }
}

export const date = (name?: string) => new DateConstraint(name)
