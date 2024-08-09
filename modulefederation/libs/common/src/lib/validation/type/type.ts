import { get, set } from "../../lang";
import { Test } from "../test"
import { ValidationContext } from "../validation-context"
import { ValidationError } from "../validation-error"

export interface ConstraintInfo {
    message?: string
}

class Patch {
  // data

  object: any;
  property: string;

  constructor(object: any, property: string, private evaluate: () => any) {
    this.object = object;
    this.property = property;
  }

  // public

  resolve(): void {
    this.set(this.evaluate());
  }

  // private

  private set(value: any): void {
    this.object[this.property] = value;
  }
}

export class Type<T> {
    // instance data

    public static cache: { } = {}

    // public

    static patches: Patch[] = [];

    static register(constraint: Type<any>) {
        set(this.cache, constraint.name!, constraint)

        return this
    }

    static get(type: string): Type<any> | undefined {
        // execute possible pending patches

        this.resolve()

        // is it cached?

        const constraint = get<Type<any>>(this.cache, type)

        return constraint
    }

    /*static valueOf(type: string) : Type<any> {
        const lowLevelType = type.split(" ")[0]
        type = type.substring(lowLevelType.length + 1)
        return TypeParser.parse(lowLevelType, type)
    }*/

    static resolve() {
        let patch;
        while ((patch = this.patches.shift()))
            patch.resolve();

        this.timeout = false
    }

    private static timeout = false

    static patch(object: any, property: string, evaluate: () => any) {
        this.patches.push(new Patch(object, property, evaluate))

        if ( !this.timeout) {
            this.timeout = true
            setTimeout(() => {
                this.resolve()
            }, 0)
        }
    }

    // instance data

    protected tests: Test<T>[] = []

    // protected

    protected constructor(public name?: string) {
        if ( name )
            Type.register(this)
    }

    baseType = "string"

    protected literalType(type: string) {
        this.baseType = type

        this.test({
            type: type,
            name: "type",
            params: {
                type: type,
            },
            break: true,
            check(object: any): boolean {
                return typeof object == type
            },
        })
    }


    // public

    validate(object: T) {
        const context = new ValidationContext()
        this.check(object, context)

        if (context.violations.length > 0)
            throw new ValidationError(context.violations)
    }

    isValid(object: T): boolean {
        const context = new ValidationContext()
        this.check(object, context)

        return context.violations.length == 0
    }

    // fluent: not here!

    test(test: Test<T>): Type<T> {
        this.tests.push(test)

        return this
    }

    required(): Type<T> {
        const typeTest = this.tests[0]

        typeTest.ignore = false

        return this
    }

    optional(): Type<T> {
        const typeTest = this.tests[0]

        typeTest.ignore = true

        return this
    }

    params4(constraint: string): any | undefined {
        for (const test of this.tests)
            if (test.name === constraint)
                return test.params

        return undefined
    }

    // protected

    check(object: T, context: ValidationContext) {
        for (const test of this.tests) {
            if (!test.check(object)) {
                // remember violation

                if (test.ignore !== true)
                    context.violations.push({
                        type: test.type,
                        name: test.name,
                        params: test.params,
                        path: context.path,
                        value: object,
                        message: test.message,
                    })

                if (test.break === true) return
            }
        }
    }
}
