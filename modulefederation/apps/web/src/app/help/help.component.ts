import { CommonModule } from "@angular/common"
import { Component, Injector } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MatDividerModule } from "@angular/material/divider"
import { MatToolbarModule } from "@angular/material/toolbar"
import { AbstractFeature, Command, CommandButtonComponent, Feature, HelpAdministrationService, ViewComponent, WithCommands, WithDialogs, WithState, WithView } from "@modulefederation/portal"
import { QuillEditorComponent } from "ngx-quill"
import { DeltaStatic, Quill } from "quill"
import { MessageBus } from "../message-bus/message-bus"

@Component({
    selector: 'help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss'],
    standalone: true,
    imports: [CommonModule, ViewComponent, MatToolbarModule, MatDividerModule, CommandButtonComponent, QuillEditorComponent, FormsModule]
})
@Feature({
    id: "help",
    label: "Help", icon: "home",
    visibility: ["public", "private"],
    categories: [],
    tags: [],
    permissions: []
})
export class HelpComponent extends WithDialogs(WithView(WithState<any>()(WithCommands(AbstractFeature, {inheritCommands: false})))) {
  // instance data

  editor!: Quill
  modules = {
      toolbar: false
   }

  // constructor

  constructor(private helpAdministrationService : HelpAdministrationService, messageBus: MessageBus, injector: Injector) {
     super(injector)

    messageBus.listenFor("help").subscribe(message => {
      this.helpAdministrationService.readHelp(message.payload.feature).subscribe(help => {
        this.editor.setContents(help as any as DeltaStatic)
      })
    })
  }

  // public

  editorCreated(editor: Quill): void {
     this.editor = editor;
   }
}
