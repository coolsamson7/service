import { Component, Injector, forwardRef } from "@angular/core";
import { AbstractFeature, Feature, WithCommands, Command, WithState, WithView, ViewComponent, LockType, CommandButtonComponent, Stacktrace } from "@modulefederation/portal";
import { PortalAdministrationService } from "../portal/service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatDividerModule } from "@angular/material/divider";

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    providers: [{ 
      provide: AbstractFeature, 
      useExisting: forwardRef(() => HomeComponent) 
    }],
    imports: [CommonModule, FormsModule, ViewComponent, MatToolbarModule, MatDividerModule, CommandButtonComponent]
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
  busy = false
  today = new Date()

  // constructor

  constructor(private portalAdministrationService : PortalAdministrationService, injector: Injector) {
    super(injector)
  }

  // implement Stateful

  override applyState(state: any) : void {
    const foo = state.foo
  }

  override writeState(state: any) : void {
    state.foo = "foo"
  }

  // commands

  @Command({
    label: "Group 1 - 1",
    icon: "undo",
    lock: "group",
    group: "g1"
  })
  g11() {
    return new Promise((resolve) => setTimeout(() => resolve('done'), 1000));
  }

  @Command({
    label: "Group 1 - 2",
    icon: "undo",
    lock: "group",
    group: "g1"
  })
  g12() {
    return new Promise((resolve) => setTimeout(() => resolve('done'), 1000));
  }

  @Command({
    label: "Toggle Busy",
    icon: "undo",
    lock: "command"
  })
  toggleBusy() {
    this.setBusy(this.busy = !this.busy)
  }

  @Command({
    label: "Long Running",
    icon: "undo",
    lock: "command"
  })
  longRunning() : Promise<any> {
    return new Promise((resolve) => setTimeout(() => resolve('done'), 5000));
  }

  @Command({
    label: "Lock",
    lock: "view",
    icon: "undo"
  })
  async lockView() : Promise<any> {
    const stack = new Error().stack!

    const frames = Stacktrace.createFrames(stack)

    console.log("### created frames ", frames);

    try {
      await Stacktrace.mapFrames(...frames)

      console.log("### mapped ", frames)
    }
    catch(e) {
      console.error(e)
    }

   

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

  @Command({})
  throwString() {
    throw "ouch"
  }

  @Command({})
  throwError() {
    throw new Error("aua")
  }

  @Command({})
  throwDeclaredServerError() {
    this.portalAdministrationService.throwDeclaredException().subscribe(_ => console.log())
  }

  @Command({})
  throwServerError() {
    this.portalAdministrationService.throwException().subscribe(_ => console.log())
  }

  @Command({})
  callBadURL() {
    this.portalAdministrationService.callBadURL().subscribe(_ => console.log())
  }
}
