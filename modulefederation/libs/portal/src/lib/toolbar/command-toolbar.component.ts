import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";

import { CommandMenuButtonComponent } from "./command-menu-button.component";
import { CommandButtonComponent, CommandDescriptor } from "../command";
import { ToolbarCommandConfig } from "./with-command-toolbar.mixin";

// either a single command or a menu with commands 

// config: icon,label

abstract class ToolbarElement {
  // instance data

  type: "command" | "menu" = "command"
  
  abstract get icon() : string
  abstract get label() : string

  // constructor

  constructor(protected toolbar: CommandToolbarComponent, public name: string, protected parent?: ToolbarElement) {}

  // public

  revert() {
    const index = this.toolbar.elements.indexOf(this)
    if ( this.parent )
      this.toolbar.elements[index] = this.parent
    else
      this.toolbar.elements.splice(index, 1)
  }
}

class ToolbarCommandMenuElement extends ToolbarElement {
  // instance data

  commands : CommandDescriptor[] = []

  // override

   override get icon() : string {
    return this.config.icon || ""
  }

  override get label(): string {
     return this.config.label || ""
  }

  // constructor

  constructor(toolbar: CommandToolbarComponent, command: CommandDescriptor, private config: ToolbarCommandConfig, parent?: ToolbarCommandMenuElement) {
    super(toolbar, command.name, parent)

    if ( !config.icon) {
      config.icon = parent ? parent.icon : command.icon 
    }

    if ( !config.label) {
      config.label = parent ? parent.label : command.label 
    }

    this.type = "menu"
    if ( parent )
      this.commands.push(...parent.commands)

    this.commands.push(command)
  }
}

class ToolbarCommandElement extends ToolbarElement {
  // override

   override get icon() : string {
    return this.command.icon || ""
  }

  override get label(): string {
     return this.command.label || ""
  }

  // constructor

  constructor(toolbar: CommandToolbarComponent, public command: CommandDescriptor, parent?: ToolbarElement) {
    super(toolbar, command.name, parent)

    this.type = "command"
  }
}

@Component({
    selector: 'command-toolbar',
    templateUrl: './command-toolbar.component.html',
    styleUrls: ['./command-toolbar.component.scss'],
    standalone: true,
    imports: [
      // angular

      CommonModule,

      // material

      MatButtonModule,
      MatIconModule,
      MatTooltipModule,
      MatToolbarModule,

      // components

      CommandMenuButtonComponent,
      CommandButtonComponent
    ]
})
export class CommandToolbarComponent {
  // input

  @Input() label = false

  // instance data

  elements : ToolbarElement[] = []

  // callback

  command(element: ToolbarElement) : CommandDescriptor {
    return (element as ToolbarCommandElement).command
  }

  commands(element: ToolbarElement) : CommandDescriptor[]{
    return (element as ToolbarCommandMenuElement).commands
  }

  // public

  addCommand(command: CommandDescriptor, config : ToolbarCommandConfig) : () => void {
    const name = config.menu ? config.menu : command.name
    const index = this.elements.findIndex(element => element.name == name)

    let newElement : ToolbarElement

    if ( config.menu) {
      if ( index >= 0 ) // add to existing menu
        this.elements[index] = (newElement = new ToolbarCommandMenuElement(this, command, config, this.elements[index] as ToolbarCommandMenuElement))
      else
        this.elements.push(newElement = new ToolbarCommandMenuElement(this, command, config))
    }
    else {
      // regular button

      if ( index >= 0 )
        this.elements[index] = (newElement = new ToolbarCommandElement(this, command, this.elements[index]))
      else
        this.elements.push(newElement = new ToolbarCommandElement(this, command))

    }

    // return the revert operation

    return () => newElement.revert()
  }
}