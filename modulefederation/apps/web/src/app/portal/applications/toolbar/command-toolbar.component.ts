import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CommandDescriptor, CommandButtonComponent } from "@modulefederation/portal";

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

      CommandButtonComponent
    ]
})
export class CommandToolbarComponent {
    // input

    commands : CommandDescriptor[] = []

    // public

    addCommand(command: CommandDescriptor) : () => void {
      this.commands = [...this.commands, command]

      return () => {
        this.commands.splice(this.commands.indexOf(command), 1)
        this.commands = [...this.commands]
      }
    }
}
