import { Component, Injector } from "@angular/core";
import { AbstractFeature, Feature, WithCommands, Command, WithState, WithView, ViewComponent, LockType } from "@modulefederation/portal";
import { PortalAdministrationService } from "../portal/service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, ViewComponent]
})
@Feature({
    id: "home",
    label: "Home", icon: "home",
    visibility: ["public", "private"],
    categories: [],
    tags: ["navigation"],
    permissions: []
})
export class HomeComponent extends WithView(WithState<any>()(WithCommands(AbstractFeature, {inheritCommands: false}))) {
  value = "10"
  me ="Andi"
  today = new Date()

  constructor(private portalAdministrationService : PortalAdministrationService, injector: Injector) {
    super(injector)
  }

  busy = false
  toggleBusy() {
    this.setBusy(this.busy = !this.busy)
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
    label: "Long Running"
  })
  longRunning() : Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve('done'), 5000));
  }

  @Command({
    label: "Lock",
    lock: "view"
  })
  lockView() : Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve('done'), 5000));
  }

  @Command({
    label: "Test"
  })
  test(message: string) {
    console.log(message + " world")

    console.log(this.view)

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
