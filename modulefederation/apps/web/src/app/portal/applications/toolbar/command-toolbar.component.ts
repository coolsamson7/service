import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CommandDescriptor, CommandButtonComponent } from "@modulefederation/portal";
import { CommandMenuButtonComponent } from "./command-menu-button.component";

interface ToolbarElement {
  icon: string,
  type: "command" | "menu"
  command?: CommandDescriptor
  items?: CommandDescriptor[]
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
    // instance data

    commands : CommandDescriptor[] = []

    elements : ToolbarElement[] = []

    // public

    deleteCommand(command: CommandDescriptor) {
      const element = this.elements.find(element => element.icon == command.icon)
      if ( element ) {
        if ( element.type == "command") {
          this.elements.splice(this.elements.indexOf(element), 1)

          this.elements = [...this.elements]
        }
        else {
          if ( element.items!.length > 1) {
            const item = element.items?.find(item => item == command)
            element.items = [...element.items!.splice(element.items!.indexOf(item!), 1)]
          }
          else {
            element.type = "command"
            element.command = command
            delete element.items

            this.elements = [...this.elements]
          }
          element.items!.push(command)
        }
      }
    }

    addCommand(command: CommandDescriptor) : () => void {
      //NEW

      const element = this.elements.find(element => element.icon == command.icon)
      if ( element ) {
        if ( element.type == "command") {
          element.type = "menu"
          element.items = [element.command!, command]
          delete element.command
        }
        else {
          element.items!.push(command)
        }
      }
      else {
        const newElement : ToolbarElement = {
          icon: command.icon!,
          type: "command",
          command: command
        }
        this.elements.push(newElement);

        const revert = () => {
          const element = this.elements.find(element => element.icon == command.icon)
        }
      }

      return  () => { this.deleteCommand(command)}
// NEW
      this.commands = [...this.commands, command]

      return () => {
        this.commands.splice(this.commands.indexOf(command), 1)
        this.commands = [...this.commands]
      }
    }
}
