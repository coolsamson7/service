import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatIconModule,  } from "@angular/material/icon";
import { MatTooltipModule} from '@angular/material/tooltip';
import { CommandDescriptor, CommandListener } from "./command-descriptor";
import { ExecutionContext } from "./execution-context";
import { MatButtonModule, MatIconButton } from "@angular/material/button";
import { AbstractFeature } from "../feature";
import { hasMixin } from "../common/lang";
import { CommandManager } from "./command-manager";
import { WithCommands } from "./with-commands.mixin";


@Component({
    selector: 'command-button',
    templateUrl: './command-button.component.html',
    styleUrls: ['./command-button.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [MatButtonModule, MatIconModule, MatTooltipModule]
})
export class CommandButtonComponent implements OnInit, CommandListener {
    // view child

    @ViewChild("button") button!: MatIconButton;

    // input

    @Input() command!:  string | CommandDescriptor

    tooltip = ""
    descriptor!: CommandDescriptor

    // constructor

    constructor(private feature: AbstractFeature) {
    }

    // callbacks

    click() {
        this.descriptor.run()
    }

    // implement CommandListener

    onCall(context: ExecutionContext): void {
        if ( context.data.fromShortcut) {
            this.button.ripple.launch({centered: true})
        }
    }

    onResult(context: ExecutionContext): void {
        //
    }

    onError(context: ExecutionContext): void {
        //
    }

    // implement OnInit

    ngOnInit(): void {
    if ( this.command instanceof CommandDescriptor)
       this.descriptor =  <CommandDescriptor>this.command
    else {
        if ( hasMixin(this, WithCommands))
            this.descriptor  = (<CommandManager><unknown>this.feature).getCommand(this.command)
        else
            throw new Error("WithCommands is missing")
      }

        this.descriptor.addListener(this)

        this.tooltip =  (this.descriptor.tooltip || "") + (this.descriptor.shortcut ? (" " + this.descriptor.shortcut) : "")
    }
}
