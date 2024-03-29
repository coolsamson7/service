import { FormControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { Directive, Input } from '@angular/core';
import { QueryParameter } from "../../json/query-analyzer";

type ConstraintCheck = (constraint : any, value : any) => boolean

interface ConstraintHandler {
    type : string[]
    constraint : string,
    check : ConstraintCheck
}

const constraintHandlers : ConstraintHandler[] = [
    // required

    {
        type: ["integer", "number", "string"],
        constraint: "required",
        check: (constraint, value) => {
            return value !== undefined && value !== null
        }
    },

    // type

    {
        type: ["integer", "number", "string"],
        constraint: "type",
        check: (constraint, value) => {
            const type = typeof value

            switch (type) {
                case "string":
                    return constraint == type

                case "number":
                    return constraint == "integer" || constraint == "number"
            }

            return typeof value !== "undefined" && value !== null
        }
    },

    // minimum

    {
        type: ["integer", "number"],
        constraint: "minimum",
        check: (constraint, value) => {
            return value >= constraint
        }
    },

    // maximum

    {
        type: ["integer", "number"],
        constraint: "maximum",
        check: (constraint, value) => {
            return value <= constraint
        }
    },

    // minLength

    {
        type: ["string"],
        constraint: "minLength",
        check: (constraint, value) => {
            return value.length >= constraint
        }
    },

    // maxLength

    {
        type: ["string"],
        constraint: "maxLength",
        check: (constraint, value) => {
            return value.length <= constraint
        }
    }
]

class ConstraintValidator {
    // instance data

    handlers = []

    // constructor

    constructor(constraints : any) {
        const type = constraints.type

        const keys = Object.keys(constraints)

        let index = keys.indexOf("type")
        keys.splice(index, 1)

        keys.unshift("type")

        index = keys.indexOf("required")
        if (index >= 0) {
            keys.splice(index, 1)
            keys.unshift("required")
        }

        // sort, so that type and required come first

        const findHandler = (type : string, constraint : string) => {
            for (const handler of constraintHandlers)
                if (handler.constraint == constraint && handler.type.includes(type))
                    return handler

            return undefined
        }


        for (const constraintName of keys) {
            const constraint = constraints[constraintName]

            const handler = findHandler(type, constraintName)
            if (handler) {
                // @ts-ignore
                this.handlers.push({constraint: constraint, handler: handler})
            }
        }
    }

    // public

    validate(value : any) {
        for (const handler of this.handlers) {
            // @ts-ignore
            if (!handler.handler.check(handler.constraint, value)) {
                const error = {}

                // @ts-ignore
                error[handler.handler.constraint] = handler.constraint

                return error
            }
        }

        return null
    }
}

@Directive({
    selector: '[validateParameter][ngModel]',
    providers: [
        {provide: NG_VALIDATORS, useExisting: ParameterValidator, multi: true}
    ]
})
export class ParameterValidator implements Validator {
    // input

    @Input("validateParameter") parameter! : QueryParameter

    // instance data

    validator? : ConstraintValidator

    // constructor

    constructor() {
    }

    // implement Validator

    validate(control : FormControl) : ValidationErrors | null {
        if (!this.validator) { // @ts-ignore
            this.validator = new ConstraintValidator(this.parameter['schema'])
        }

        return this.validator.validate(control.value);
    }
}
