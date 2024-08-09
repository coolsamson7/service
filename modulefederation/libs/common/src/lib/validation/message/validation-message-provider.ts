import { ViolationContext } from "./violation-context"

export interface ValidationMessageProvider {
    provide(context: ViolationContext): string
}
