import { TypeViolation } from "./type-violation"

export class ValidationError extends Error {
    constructor(public violations: TypeViolation[]) {
        super("validation error")
    }
}
