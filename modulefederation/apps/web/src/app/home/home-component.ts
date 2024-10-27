import { Component, ElementRef, Injectable, Injector, Input, OnInit, forwardRef } from "@angular/core";
import {
  AbstractFeature,
  Feature,
  WithCommands,
  Command,
  WithState,
  WithView,
  ViewComponent,
  CommandButtonComponent,
  I18nModule
} from "@modulefederation/portal";
import { Stacktrace } from "@modulefederation/common";
import { PortalAdministrationService } from "../portal/service";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatDividerModule } from "@angular/material/divider";
import {FormDesignerModule} from "@modulefederation/form/designer";
import {LayoutModule, IconComponent} from "@modulefederation/components";
import { MatIconModule } from "@angular/material/icon";
import { AbstractPlugin, RegisterPlugin, Public, Callback, PluginInfo, PluginManager, PluginsPlugin } from "../plugin";
import { MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY } from "@angular/material/datepicker";


@RegisterPlugin("foo")
@Injectable({
  providedIn: 'root'
})
export class FooPlugin extends AbstractPlugin {
    constructor(manager: PluginManager) {
      super(manager)
      //const decorator : RegisterPlugin  = TypeDescriptor.forType(this.constructor as Type<any>).typeDecorators.find(decorator => decorator instanceof RegisterPlugin)
  }

  // always a promise...is that good?
    @Public({timeout: 100})
    async foo(msg: string, times: number) : Promise<string> {
      return Promise.resolve("")//make the compiler happy
    }

    @Public()
    nix() : void {
    }

    @Callback
    bar(msg: string) {
      console.log("callback " + msg)
    }
  }

//
export interface Message {
  msg: string
}

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    providers: [{
      provide: AbstractFeature,
      useExisting: forwardRef(() => HomeComponent)
    }],
  imports: [
    CommonModule,

    IconComponent,

    MatIconModule,

    FormsModule,
    ViewComponent,
    MatToolbarModule, MatDividerModule, CommandButtonComponent, FormDesignerModule, I18nModule, LayoutModule]
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

  constructor(private plugins: PluginsPlugin, private fooPlugin: FooPlugin, private portalAdministrationService : PortalAdministrationService, injector: Injector) {
    super(injector)

    fooPlugin.listen2("bar", (msg: string) => {
      console.log(msg)
    })
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
    this.fooPlugin.nix()

    this.fooPlugin.foo("hello", 2).then(result => 
      console.log(result)
    )

    this.plugins.plugins().then(result => {
      for ( const plugin of result)
        console.log(plugin.name + " " + plugin.version)
    })

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


  click() {
    console.log("click")
  }
}