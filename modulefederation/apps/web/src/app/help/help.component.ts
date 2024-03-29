import { CommonModule } from "@angular/common"
import { Component, Injector } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MatDividerModule } from "@angular/material/divider"
import { MatToolbarModule } from "@angular/material/toolbar"
import { MessageBus, AbstractFeature, CommandButtonComponent, Feature, HelpAdministrationService, ViewComponent, WithCommands, WithDialogs, WithState, WithView } from "@modulefederation/portal"
import { QuillEditorComponent } from "ngx-quill"
import { DeltaStatic, Quill } from "quill"
import { HelpTreeComponent } from "./help-tree.component"

@Component({
    selector: 'help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss'],
    standalone: true,
    imports: [CommonModule, ViewComponent, MatToolbarModule, MatDividerModule, CommandButtonComponent, QuillEditorComponent, FormsModule, HelpTreeComponent]
})
@Feature({
    id: "help",
    label: "Help", 
    icon: "help",
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

    messageBus.listenFor<any>("help").subscribe(message => {
      this.helpAdministrationService.readHelp(message.arguments?.feature).subscribe(help => {
        this.editor.setContents(help as any as DeltaStatic)
      })
    })
  }

  // public

  editorCreated(editor: Quill): void {
     this.editor = editor;
   }
}
