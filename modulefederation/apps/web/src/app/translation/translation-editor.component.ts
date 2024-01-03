import { Component, OnInit } from "@angular/core";
import {
  Dialogs,
  Feature,
  I18nModule,
  Message,
  MessageAdministrationService,
  MessageChanges,
  TranslationService
} from "@modulefederation/portal";
import { NamespaceNode, NamespaceTreeComponent } from "./namespace-tree.component";
import { CommonModule } from "@angular/common";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { FormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";

type MessagesByType = { [type : string] : Message[] }
type MessageMap = { [prefix : string] : MessagesByType }

@Component({
  selector: 'translations',
  templateUrl: './translation-editor.component.html',
  styleUrls: ['./translation-editor.component.scss'],
  standalone: true,
  imports: [NamespaceTreeComponent, CommonModule, I18nModule, MatMenuModule, MatListModule, MatIconModule, MatSlideToggleModule, MatButtonModule, MatToolbarModule, FormsModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, I18nModule]
})
@Feature({
  id: "translations",
  label: "Translations",
  labelKey: "translations:title.label",
  i18n: ["translations", "portal.commands"],
  icon: "computer",
  visibility: ["public", "private"],
  categories: [],
  tags: ["navigation"],
  permissions: []
})
export class TranslationEditorComponent implements OnInit {
  // instance data

  types = ["label", "tooltip", "shortcut"] // dynamic?
  namespaces : NamespaceNode[] = []
  selectedNamespace? : NamespaceNode
  messages : MessageMap = {}
  selectedName? : string
  selectedMessages? : MessagesByType
  locales : string[] = []
  namespaceChanges : MessageChanges = {
    newMessages: [],
    changedMessages: [],
    deletedMessages: []
  }

  // constructor

  constructor(private dialogs : Dialogs, private snackBar : MatSnackBar, private messageAdministrationService : MessageAdministrationService, private translationService : TranslationService) {
  }

  // callbacks

  prefix(name : string) {
    let index = name.indexOf(".") // e.g. bla.label
    let prefix = name.substring(0, index) // e.g. bla
    let suffix = name.substring(index + 1) // e.g. "label"

    return prefix
  }

  addNamespace() {
    this.dialogs.inputDialog()
      .title("Add Namespace")
      .message("Input namespace name")
      .placeholder("namespace")
      .defaultValue("")
      .okCancel()
      .show()
      .subscribe(name => {
        if (name && name != "")
          this.addNamespaceNode(name)
      })
  }

  addMessage() {
    this.dialogs.inputDialog()
      .title("Add Message")
      .message("Input message name")
      .defaultValue("")
      .placeholder("message")
      .okCancel()
      .show()
      .subscribe(name => {
        this.newMessage(name)
      })
  }

  revert() {
    this.namespaceChanges = {
      newMessages: [],
      changedMessages: [],
      deletedMessages: []
    }

    this.select(this.selectedNamespace!!)
  }

  save(selectNode? : NamespaceNode) {
    this.messageAdministrationService.saveChanges(this.namespaceChanges).subscribe(createdMessages => {
      this.snackBar.open("Messages", "Saved")

      this.selectedNamespace?.messages!!.push(...createdMessages)

      this.namespaceChanges = {
        newMessages: [],
        changedMessages: [],
        deletedMessages: []
      }

      this.select(selectNode ? selectNode : this.selectedNamespace!!)
    })
  }


  selectMessages(message : string) {
    this.selectedName = message
    this.selectedMessages = this.messages[message]
  }

  messageKeys(messages : MessageMap) {
    return Object.keys(messages)
  }

  newMessage(name : string) {
    if (name != "" && !this.messages[name]) {
      let newMessage = (locale : string, type : string) : Message => {
        return {
          id: undefined,
          locale: locale,
          name: name + "." + type,
          namespace: this.selectedNamespace!!.path,
          value: ""
        }
      }

      let messagesByType : MessagesByType = {}

      for (let type of this.types)
        messagesByType[type] = this.locales.map(locale => newMessage(locale, type))

      this.messages[name] = messagesByType
    }
  }

  computeMessages(messages : Message[]) : MessageMap {
    let result : MessageMap = {}

    let newMessage = (locale : string, name : string) : Message => {
      return {
        id: undefined,
        locale: locale,
        name: name,
        namespace: this.selectedNamespace!!.path,
        value: ""
      }
    }

    for (let message of messages) {
      let index = message.name.indexOf(".") // e.g. bla.label
      let prefix = message.name.substring(0, index) // e.g. bla
      let suffix = message.name.substring(index + 1) // e.g. "label"

      let messagesByType = result[prefix]

      if (!messagesByType) {
        // prefill with "new" message, overwrite with the real messages

        messagesByType = {}

        for (let type of this.types)
          messagesByType[type] = this.locales.map(locale => newMessage(locale, prefix + "." + type))

        result[prefix] = messagesByType
      }

      // add real message

      messagesByType[suffix][this.locales.indexOf(message.locale)] = message
    }

    // done

    console.log(result)

    return result
  }

  hasChanges():boolean {
      return this.namespaceChanges.newMessages.length > 0 ||
             this.namespaceChanges.changedMessages.length > 0 ||
            this.namespaceChanges.deletedMessages.length > 0
  }

  deleteAllMessages(message : string) {
    for ( let type in this.selectedMessages) {
      for (let message of this.selectedMessages[type]) {
        if ( !this.isNew(message)) // ?? new
          this.deleteMessage(message)
      }
    }
  }

  hasMessageChanges(message : string) {
    return this.namespaceChanges.newMessages.find(m => m.name.startsWith(message)) !== undefined ||
      this.namespaceChanges.changedMessages.find(m => m.name.startsWith(message)) !== undefined ||
      this.namespaceChanges.deletedMessages.find(m => m.name.startsWith(message)) !== undefined
  }

  select(namespaceNode : NamespaceNode) {
    if (this.hasChanges()) {
      this.dialogs.confirmationDialog()
        .okCancel()
        .title("Messages")
        .message("Save changes first")
        .show().subscribe(result => {
        if (result) {
          this.save(namespaceNode);
        }
      })

      return
    }

    // start from scratch

    this.namespaceChanges = {
      newMessages: [],
      changedMessages: [],
      deletedMessages: []
    }

    this.selectedNamespace = namespaceNode

    if (namespaceNode) {
      if (!namespaceNode.messages) {
        this.messageAdministrationService.readAllMessages(namespaceNode.path).subscribe(
          messages => {
            namespaceNode.messages = messages
            this.messages = this.computeMessages(messages)
          }
        )
      }
      else {
        this.messages = this.computeMessages(namespaceNode.messages)
        if (this.selectedName)
          this.selectMessages(this.selectedName)
      }
    }
  }


  isChanged(message : Message) : boolean {
    return this.namespaceChanges.newMessages.includes(message) || this.namespaceChanges.changedMessages.includes(message)
  }

  isNew(message : Message) : boolean {
    return message.id == undefined || message.id == null
  }

  isDeleted(message : Message):boolean {
    return this.namespaceChanges.deletedMessages.includes(message)
  }

  messagesStyle(message: string) {
    if ( this.hasMessageChanges(message))
      return {
        'border-right-style': `solid`,
        'border-right-color': 'rgba(0, 89, 255, 0.3)',
        'border-right-width': '5px'
      };
    else return {}
  }

  gridStyle() {
      return {
        display: 'grid',
        'grid-template-columns': `repeat(${this.locales.length}, 1fr)`,
        'grid-column-gap': '10px',
        'grid-row-gap': '5px'
      };
  }

  deleteMessage(message : Message) {
    // delete from new

    if (this.namespaceChanges.newMessages.includes(message))
      this.namespaceChanges.newMessages.splice( this.namespaceChanges.newMessages.indexOf(message), 1)

    // add to deleted

    if ( ! this.namespaceChanges.deletedMessages.includes(message))
      this.namespaceChanges.deletedMessages.push(message)

    //message.value = ""
  }

  onChange(message : Message) {
    // if it was deleted, revert

    if ( this.namespaceChanges.deletedMessages.includes(message))
      this.namespaceChanges.deletedMessages.splice( this.namespaceChanges.deletedMessages.indexOf(message), 1)

    // add to new or changed

    if (message.id) {
      if (!this.namespaceChanges.changedMessages.includes(message))
        this.namespaceChanges.changedMessages.push(message)
    }
    else {
      if (!this.namespaceChanges.newMessages.includes(message))
        this.namespaceChanges.newMessages.push(message)
    }

    console.log(this.namespaceChanges)
  }

  // private

  private addNamespaceNode(namespace : string) {
    // local function

    let findOrCreateFolder = (name : string, folders : NamespaceNode[], prefix : string) => {
      let folder = folders.find(folder => folder.name == name)

      if (!folder)
        folders.push(folder = {
          name: name,
          path: prefix + name,
          children: []
        })

      return folder
    }

    // add parent path

    if (this.selectedNamespace)
      namespace = this.selectedNamespace.path + "." + namespace

    // go

    let parent = this.namespaces
    let prefix = ""
    for (let leg of namespace.split(".")) {
      parent = findOrCreateFolder(leg, parent, prefix).children
      prefix += leg + "."
    }

    this.namespaces = [...this.namespaces]
  }

  private setupNamespaces(namespaces : string[]) {
    let findOrCreateFolder = (name : string, folders : NamespaceNode[], prefix : string) => {
      let folder = folders.find(folder => folder.name == name)

      if (!folder)
        folders.push(folder = {
          name: name,
          path: prefix + name,
          children: []
        })

      return folder
    }

    this.namespaces = []

    for (let namespace of namespaces) {
      let parent = this.namespaces
      let prefix = ""
      for (let leg of namespace.split(".")) {
        parent = findOrCreateFolder(leg, parent, prefix).children
        prefix += leg + "."
      }
    }
  }

  // implement OnInit

  ngOnInit() : void {
    this.messageAdministrationService.readLocales().subscribe(locales => this.locales = locales)

    this.messageAdministrationService.readNamespaces().subscribe(namespaces => this.setupNamespaces(namespaces))
  }
}
