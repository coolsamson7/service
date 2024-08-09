import { TypeViolation } from "../type-violation"

export interface ViolationContext {
    label: string
    violation: TypeViolation
    violations: TypeViolation[]
}
