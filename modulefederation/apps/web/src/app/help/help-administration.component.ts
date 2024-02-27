import { CommonModule } from "@angular/common"
import { Component, Injector, ViewChild } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MatDividerModule } from "@angular/material/divider"
import { MatToolbarModule } from "@angular/material/toolbar"
import { AbstractFeature, Command, CommandButtonComponent, Feature, HelpAdministrationService, ViewComponent, WithCommands, WithDialogs, WithState, WithView } from "@modulefederation/portal"
import { ContentChange, QuillEditorComponent } from "ngx-quill"
import { DeltaStatic, Quill } from "quill"
import { HelpNode, HelpTreeComponent } from "./help-tree.component"

@Component({
    selector: 'help-administration',
    templateUrl: './help-administration.component.html',
    styleUrls: ['./help-administration.component.scss'],
    standalone: true,
    imports: [CommonModule, ViewComponent, MatToolbarModule, MatDividerModule, CommandButtonComponent, QuillEditorComponent, FormsModule, HelpTreeComponent]
})
@Feature({
    id: "help-administration",
    folder: "translations",
    i18n: ["portal.commands"],
    label: "Help",
    icon: "help",
    visibility: ["public", "private"],
    categories: [],
    tags: ["navigation"],
    permissions: []
})
export class HelpAdministrationComponent extends WithDialogs(WithState<any>()(WithCommands(AbstractFeature, {inheritCommands: false}))) {
  // instance data

  @ViewChild(HelpTreeComponent) helpTree!: HelpTreeComponent

  editor!: Quill
  selection?: HelpNode
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

  // callbacks

  deleteNode(node : HelpNode) {
    if (node.leaf) {
      this.helpAdministrationService.deleteHelp(node.path).subscribe()
    }

    const parent = this.helpTree.findParent(node)
    if ( parent ) {
      // inner node

      if (node.children.length > 0) {
        if (node.leaf) {
          node.leaf = false
        }
      }
      else {
        // we can delete totally

        if (node.leaf) {
          parent.children.splice( parent.children.indexOf(node), 1)
        }
      }
    }
    else {
      // root node

      if (node.children.length > 0) {
        if (node.leaf) {
          node.leaf = false
        }
      }
      else {
        // we can delete totally

        if (node.leaf) {
          node.leaf = false
        }

        this.helpTree.root.splice(this.helpTree.root.indexOf(node), 1)
      }
    }

    this.helpTree.refresh()
  }

  select(node : HelpNode) {
    if ( this.dirty) {
      this.confirmationDialog()
        .title("Change selection")
        .message("save first")
        .ok()
        .show().subscribe()
      return
    }

    this.helpTree.select( this.selection = node)

    if ( node.leaf) {
      this.helpAdministrationService.readHelp(node.path).subscribe(help => {
        this.delta = help  as any as DeltaStatic
        this.editor.setContents(this.delta)
      })
  }
  else {
    this.selection = node
    this.delta = {ops: []} as any as DeltaStatic
    this.editor.setContents(this.delta)
  }
  }

  // commands

  @Command({
    i18n: "portal.commands:revert",
    icon: "undo",
  })
  revert() {
    if ( this.selection!.leaf)
      this.helpAdministrationService.readHelp(this.selection!.path).subscribe(help => {
        this.editor.setContents(this.delta as any as DeltaStatic)

        this.dirty = false

        this.updateCommandState()
      })
      else {
        this.editor.setContents(this.delta = {ops: []} as any as DeltaStatic)

        this.dirty = false

        this.updateCommandState()
      }
  }

  @Command({
    i18n: "portal.commands:save",
    icon: "save",
    shortcut: "ctrl+s"
  })
  save() {
    this.helpAdministrationService.saveHelp(this.selection!.path, JSON.stringify(this.delta = this.editor.getContents())).subscribe(result =>
       this.selection!.leaf = true
       )

    this.dirty = false
    this.updateCommandState()
  }

  @Command({
    label: "Add",
    icon: "add",
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

  private addHelp(help: string) {
    const folder = this.selection ? this.selection?.children : this.helpTree.root
    const prefix = this.selection ? (this.selection?.path + ".") : ""
    this.helpTree.buildTree(folder, prefix, [help], true)

    this.helpTree.refresh()
  }

  private updateCommandState() {
    this.setCommandEnabled("add", !this.dirty)
    this.setCommandEnabled("save", this.dirty)
    this.setCommandEnabled("revert", this.dirty)
  }

  // public

  onContentChanged = (change: ContentChange) => {
    if (change.source == "user") {
      this.dirty = true

      this.updateCommandState()
    }
  }

  editorCreated(editor: Quill): void {
     this.editor = editor;
   }
}
