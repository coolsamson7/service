import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CommandDescriptor, CommandButtonComponent } from "@modulefederation/portal";

@Component({
    selector: 'command-menu-button',
    templateUrl: './command-menu-button.component.html',
    //styleUrls: ['./command-menu-button.component.scss'],
    standalone: true,
    imports: [
      // angular

      CommonModule,

      // material

      MatIconModule,
      MatButtonModule,
      MatTooltipModule,
      MatMenuModule,

      // components

      CommandButtonComponent
    ]
})
export class CommandMenuButtonComponent {
    // input

    @Input() commands : CommandDescriptor[] = []
}
