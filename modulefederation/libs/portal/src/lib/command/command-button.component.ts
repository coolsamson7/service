import { Component, Directive, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatIconModule,  } from "@angular/material/icon";
import { MatTooltipModule} from '@angular/material/tooltip';
import { CommandDescriptor, CommandListener } from "./command-descriptor";
import { ExecutionContext } from "./execution-context";
import { MatButton, MatButtonModule, MatIconButton } from "@angular/material/button";

@Directive({
    selector: '[remove-wrapper]',
    standalone: true
 })
 export class RemoveWrapperDirective {
    constructor(private el: ElementRef) {
        const parentElement = el.nativeElement.parentElement;
        const element = el.nativeElement;
        parentElement.removeChild(element);
        parentElement.parentNode.insertBefore(element, parentElement.nextSibling);
        parentElement.parentNode.removeChild(parentElement);
    }
 }

@Component({
    selector: 'command-button',
    templateUrl: './command-button.component.html',
    styleUrls: ['./command-button.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [MatButtonModule, MatIconModule, MatTooltipModule, RemoveWrapperDirective]
})
export class CommandButtonComponent implements OnInit, CommandListener {
    // view child
    
    @ViewChild("button") button!: MatIconButton;


    // input

    @Input() command!: CommandDescriptor

    // callbacks

    click() {
        this.command.run()
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
        this.command.addListener(this)
    }
}