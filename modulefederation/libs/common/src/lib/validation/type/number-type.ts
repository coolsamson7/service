import { Type, ConstraintInfo } from "./type"

/**
 * this constraint class adds specific checks for numbers.
 */
export class NumberType extends Type<number> {
    // constructor

    constructor(name?: string) {
        super(name)

        this.literalType("number")
    }

    // fluent api

    min(min: number, info?: ConstraintInfo): NumberType {
        this.test({
            type: "number",
            name: "min",
            params: {
                min: min,
            },
            ...info,
            check(object: number): boolean {
                return object >= min
            },
        })

        return this
    }

    max(max: number, info?: ConstraintInfo): NumberType {
        this.test({
            type: "number",
            name: "max",
            params: {
                max: max,
            },
            ...info,
            check(object: number): boolean {
                return object <= max
            },
        })

        return this
    }

    lessThan(number: number, info?: ConstraintInfo): NumberType {
        this.test({
            type: "number",
            name: "lessThan",
            params: {
                number: number,
            },
            ...info,
            check(object: number): boolean {
                return object < number
            },
        })

        return this
    }

    lessThanEquals(number: number, info?: ConstraintInfo): NumberType {
        this.test({
            type: "number",
            name: "lessThanEquals",
            params: {
                number: number,
            },
            ...info,
            check(object: number): boolean {
                return object <= number
            },
        })

        return this
    }

    greaterThan(number: number, info?: ConstraintInfo): NumberType {
        this.test({
            type: "number",
            name: "greaterThan",
            params: {
                number: number,
            },
            ...info,
            check(object: number): boolean {
                return object > number
            },
        })

        return this
    }

    greaterThanEquals(number: number, info?: ConstraintInfo): NumberType {
        this.test({
            type: "number",
            name: "greaterThanEquals",
            params: {
                number: number,
            },
            ...info,
            check(object: number): boolean {
                return object >= number
            },
        })

        return this
    }

    format(format: string, info?: ConstraintInfo): NumberType {
        this.test({
            type: "number",
            name: "format",
            params: {
                format: format,
            },
            ...info,
            check(object: number): boolean {
                return true // TODO add...
            },
        })

        return this
    }

    precision(precision: number, info?: ConstraintInfo): NumberType {
        this.test({
            type: "number",
            name: "precision",
            params: {
                //format: format,
            },
            ...info,
            check(object: number): boolean {
                return true // TODO add...
            },
        })

        return this
    }

    scale(scale: number, info?: ConstraintInfo): NumberType {
        this.test({
            type: "number",
            name: "scale",
            params: {
                //format: format,
            },
            ...info,
            check(object: number): boolean {
                return true // TODO add...
            },
        })

        return this
    }

    //

    private scaleAndPrecision(value: number) {
        const x = value.toString();

        const scale = x.indexOf('.');
        if (scale == -1)
          return {
            scale: 0,
            precision: x.length
          };
        else
          return {
            scale: scale,
            precision: x.length - scale - 1
          };
      }
}

// more

export class ShortType extends NumberType {
    // constructor

    constructor(name?: string) {
        super(name)
    }
}

export class IntegerType extends NumberType {
    // constructor

    constructor(name?: string) {
        super(name)
    }
}

export class LongType extends NumberType {
    // constructor

    constructor(name?: string) {
        super(name)
    }
}

export class FloatType extends NumberType {
    // constructor

    constructor(name?: string) {
        super(name)
    }
}

export class DoubleType extends NumberType {
    // constructor

    constructor(name?: string) {
        super(name)
    }
}

// functions

export const number = (name?: string) => new NumberType(name)

export const short = (name?: string) => new ShortType(name)
export const integer = (name?: string) => new IntegerType(name)
export const long = (name?: string) => new LongType(name)
export const float = (name?: string) => new FloatType(name)
export const double = (name?: string) => new DoubleType(name)
