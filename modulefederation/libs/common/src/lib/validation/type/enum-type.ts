import { Type } from "./type"

type EnumKeys<Enum> = Exclude<keyof Enum, number>

const enumObject = <Enum extends Record<string, number | string>>(e: Enum) => {
    const copy = { ...e } as { [K in EnumKeys<Enum>]: Enum[K] }
    Object.values(e).forEach((value) => typeof value === "number" && delete copy[value])
    return copy
}

const enumKeys = <Enum extends Record<string, number | string>>(e: Enum) => {
    return Object.keys(enumObject(e)) as EnumKeys<Enum>[]
}

const enumValues = <Enum extends Record<string, number | string>>(e: Enum) => {
    return [...Object.values(enumObject(e))] as Enum[EnumKeys<Enum>][]
}

/**
 * this constraint class adds specific checks for a specific class instances.
 */
export class EnumConstraint<T extends Record<string, number | string>> extends Type<T> {
    // instance data

    private keys: any[]
    private values: any[]

    // constructor

    constructor(public type: T, name?: string) {
        super(name)

        this.keys = enumKeys(type)
        this.values = enumValues(type)

        const isEnum = (object: T): boolean => {
            return this.values.includes(object)
        }

        this.test({
            type: "enum",
            name: "type",
            params: {
                enum: type,
            },
            break: true,
            check(object: T): boolean {
                return isEnum(object)
            },
        })
    }
}

export const enumeration = (type: any, name?: string) => new EnumConstraint(type, name)
