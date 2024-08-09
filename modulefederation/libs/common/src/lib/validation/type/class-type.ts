import { Type } from "./type"

export declare interface _Type<T> extends Function {
    new (...args: any[]): T
}


/**
 * this constraint class adds specific checks for a specific class instances.
 */
export class ClassConstraint extends Type<any> {
    // constructor

    constructor(type: _Type<any>, name?: string) {
        super(name)

        this.test({
            type: "class",
            name: "type",
            params: {
                type: "type",
            },
            break: true,
            check(object: any): boolean {
                return object instanceof type
            },
        })
    }
}

export const type = (type: _Type<any>, name?: string) => new ClassConstraint(type, name)
