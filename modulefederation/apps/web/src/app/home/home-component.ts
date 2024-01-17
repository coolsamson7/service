import { Component, Injector, forwardRef } from "@angular/core";
import { AbstractFeature, Feature, WithCommands, Command, WithState } from "@modulefederation/portal";
import { PortalAdministrationService } from "../portal/service";
import { CommonModule } from "@angular/common";
import { NgModelSuggestionsDirective } from "./suggestion.directive";
import { FormsModule } from "@angular/forms";
import { SuggestionTreeComponent } from "./suggestion-tree";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    imports: [CommonModule, NgModelSuggestionsDirective, FormsModule, SuggestionTreeComponent],
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
export class HomeComponent extends WithState(WithCommands(AbstractFeature, {inheritCommands: false})) {
  object = {
    foo: {
      arsch: {
        selber: "selber"
      },
      bar: {
        bazong: "bazong"
      },
      baz: {
        bazong: "bazong"
      },
      zot: {
        goo: "hh"
      }
    }
  }

  namespaces = ["foo.bar", "foo.baz", "bar.foo"]
  value = "10"
  me ="Andi"
  today = new Date()

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
