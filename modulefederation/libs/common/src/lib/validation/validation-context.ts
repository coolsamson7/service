import { TypeViolation } from "./type-violation"

export class ValidationContext {
    violations: TypeViolation[] = []
    path = ""
}
