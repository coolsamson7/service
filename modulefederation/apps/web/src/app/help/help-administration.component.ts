import { CommonModule } from "@angular/common"
import { Component, Injector } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MatDividerModule } from "@angular/material/divider"
import { MatToolbarModule } from "@angular/material/toolbar"
import { AbstractFeature, Command, CommandButtonComponent, Feature, HelpAdministrationService, ViewComponent, WithCommands, WithDialogs, WithState, WithView } from "@modulefederation/portal"
import { QuillEditorComponent } from "ngx-quill"
import { DeltaStatic, Quill } from "quill"

@Component({
    selector: 'help-administration',
    templateUrl: './help-administration.component.html',
    styleUrls: ['./help-administration.component.scss'],
    standalone: true,
    imports: [CommonModule, ViewComponent, MatToolbarModule, MatDividerModule, CommandButtonComponent, QuillEditorComponent, FormsModule]
})
@Feature({
    id: "help-administration",
    label: "Help", icon: "home",
    visibility: ["public", "private"],
    categories: [],
    tags: ["navigation"],
    permissions: []
})
export class HelpAdministrationComponent extends WithDialogs(WithView(WithState<any>()(WithCommands(AbstractFeature, {inheritCommands: false})))) {
  // instance data

  editor!: Quill
  feature: string = ""
  dirty = false
  delta?: DeltaStatic

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
          ['link', 'image']
          //['emoji'],
        ],
     //   handlers: {'emoji': function() {}}
      }
   }

   entries : string[] = []

  // constructor

  constructor(private helpAdministrationService : HelpAdministrationService, injector: Injector) {
     super(injector)

     this.onInit(() => {
      this.helpAdministrationService.readEntries().subscribe(entries => this.entries = entries)

      this.updateCommandState()
    })
  }

  // commands

  @Command({
    i18n: "portal.commands:revert",
    icon: "undo"
  })
  revert() {
    this.helpAdministrationService.readHelp(this.feature).subscribe(help => {
      this.editor.setContents(this.delta as any as DeltaStatic)

      this.dirty = false
  
      this.updateCommandState()
    })
  }

  @Command({
    i18n: "portal.commands:save",
    icon: "save"
  })
  save() {
    this.helpAdministrationService.saveHelp(this.feature, JSON.stringify(this.delta = this.editor.getContents())).subscribe(result => console.log(result))

    this.dirty = false
    this.updateCommandState()
  }

  @Command({
    label: "Add",
    icon: "plus"
  })
  add() {
    if ( !this.dirty)
      this.inputDialog()
        .title("Add Help")
        .message("Input help name")
        .defaultValue("")
        .placeholder("help")
        .okCancel()
        .show()
        .subscribe(name => {
          if ( name )
            this.addHelp(name)
        })
  }

  // private

  private addHelp(feature: string) {
    if ( this.entries.includes(feature)) {
      this.feature = feature
      this.helpAdministrationService.readHelp(feature).subscribe(help => {
        this.delta = help  as any as DeltaStatic
        this.editor.setContents(this.delta)
      })
    }
    else {
      this.feature = feature
      this.delta = {ops: []} as any as DeltaStatic
    }
  }

  private updateCommandState() {
    this.setCommandEnabled("add", !this.dirty)
    this.setCommandEnabled("save", this.dirty)
    this.setCommandEnabled("revert", this.dirty)
  }

  // public

  onContentChanged = (event: any) => {
      this.dirty = true
      
      this.updateCommandState()
  }

  editorCreated(editor: Quill): void {
     this.editor = editor;
   }
}
