import { Injectable } from "@angular/core"
import { ValidationMessageProvider } from "./validation-message-provider"
import { ViolationContext } from "./violation-context"

@Injectable({providedIn: 'root'})
export class ValidationMessageManager {
    private provider: { [name: string]: ValidationMessageProvider } = {}

    register(type: string, provider: ValidationMessageProvider) {
        this.provider[type] = provider
    }

    provide(context: ViolationContext): string {
        return this.provider[context.violations[0].type].provide(context)
    }
}
