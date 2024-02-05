import { CommonModule } from "@angular/common"
import { Component, Injector } from "@angular/core"
import { MatDividerModule } from "@angular/material/divider"
import { MatToolbarModule } from "@angular/material/toolbar"
import { AbstractFeature, CommandButtonComponent, Feature, HelpAdministrationService, ViewComponent, WithCommands, WithState, WithView } from "@modulefederation/portal"
import { QuillEditorComponent } from "ngx-quill"
import { Quill } from "quill"

@Component({
    selector: 'help',
    templateUrl: './help.component.html',
    styleUrls: ['./help.component.scss'],
    standalone: true,
    imports: [CommonModule, ViewComponent, MatToolbarModule, MatDividerModule, CommandButtonComponent, QuillEditorComponent]
})
@Feature({
    id: "help",
    label: "Help", icon: "home",
    visibility: ["public", "private"],
    categories: [],
    tags: ["navigation"],
    permissions: []
})
export class HelpComponent extends WithView(WithState<any>()(WithCommands(AbstractFeature, {inheritCommands: false}))) {
  // instance data

  editor!: Quill
  htmlText = ""

 quillConfig={
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
          ['code-block'],
          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
          [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
          [{ 'direction': 'rtl' }],                         // text direction

          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

          [{ 'font': [] }],
          [{ 'align': [] }],

          ['clean'],                                         // remove formatting button

          //['link'],
          //['link', 'image', 'video']
          //['emoji'],
        ],
     //   handlers: {'emoji': function() {}}
      }
   }

  // constructor

  constructor(private helpAdministrationService : HelpAdministrationService, injector: Injector) {
     super(injector)
  }

  // public

  onContentChanged = (event: any) => {
      //console.log(event.html);
    }


  editorCreated(editor: Quill): void {
     this.editor = editor;

     //editor.setContents(delta as DeltaStatic)

     //console.log(editor.getContents())

     //editor.setContents()
   }
}
