import { Component, Injector, forwardRef } from "@angular/core";
import { AbstractFeature, Feature, WithCommands, Command, WithState } from "@modulefederation/portal";
import { PortalAdministrationService } from "../portal/service";
import { CommonModule } from "@angular/common";
import { NgModelSuggestionsDirective, ObjectSuggestionProvider } from "./suggestion.directive";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    imports: [CommonModule, NgModelSuggestionsDirective, FormsModule],
    providers: [{ 
      provide: AbstractFeature, 
      useExisting: forwardRef(() => HomeComponent) 
    }]
})
@Feature({
    id: "home",
    label: "Home", icon: "home",
    visibility: ["public", "private"],
    categories: [],
    tags: ["navigation"],
    permissions: []
})
export class HomeComponent extends WithState(WithCommands(AbstractFeature)) {
  value = "10"
  me ="Andi"
  today = new Date()

  suggestionProvider = new ObjectSuggestionProvider({
    foo: {
      bar: {
        baz: "baz",
        bazong: "bazong"
      }
    }
  })

  constructor(private portalAdministrationService : PortalAdministrationService, injector: Injector) {
    super(injector)

    // TEST

    this.test("hello")
  }

  // implement Stateful

  override applyState(state: any) : void {
    const foo = state.foo
    console.log(foo)
  }

  override writeState(state: any) : void {
    state.foo = "foo"
  }

  // commands

  @Command({
    label: "Test"
  })
  test(message: string) {
    console.log(message + " world")

    return message + " world"
  }

  throwString() {
    throw "ouch"
  }

  throwError() {
    throw new Error("aua")
  }

  throwDeclaredServerError() {
    this.portalAdministrationService.throwDeclaredException().subscribe(_ => console.log())
  }

  throwServerError() {
    this.portalAdministrationService.throwException().subscribe(_ => console.log())
  }

  callBadURL() {
    this.portalAdministrationService.callBadURL().subscribe(_ => console.log())
  }
}
