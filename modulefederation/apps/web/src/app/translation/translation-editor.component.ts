/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { Component, Injector, ViewChild, ViewEncapsulation, forwardRef } from "@angular/core";
import {
  AbstractFeature,
  Command,
  Feature,
  I18nModule,
  Message,
  MessageAdministrationService,
  MessageChanges, VoiceInputDirective, StringBuilder,
  WithCommands,
  WithDialogs,
  WithSpeechCommands,
  WithState,
  MicrofoneComponent
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
import { MatTooltipModule } from "@angular/material/tooltip";
import { CommandButtonComponent } from "@modulefederation/portal"
import { Observable, of, tap } from "rxjs";

type MessagesByType = { [type : string] : Message[] } // label -> Messge
type MessageMap = { [prefix : string] : MessagesByType } // ok -> {label: [...]}

export function provideAsFeature(clazz: Function) {
  return  {
    provide: AbstractFeature,
    useExisting: forwardRef(() => clazz)
  }
}

interface TranslationState {
  treeExpansion: string[]
  selectedNamespace?: string
  selectedMessage?: string
}

@Component({
    selector: 'translations',
    templateUrl: './translation-editor.component.html',
    styleUrls: ['./translation-editor.component.scss'],
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    imports: [CommandButtonComponent, NamespaceTreeComponent, CommonModule, I18nModule, MatMenuModule, MatListModule, MatIconModule, MatSlideToggleModule, MatButtonModule, MatToolbarModule, MatTooltipModule, FormsModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, I18nModule, CommandButtonComponent, VoiceInputDirective, MicrofoneComponent],
    providers: [{
      provide: AbstractFeature,
      useExisting: forwardRef(() => TranslationEditorComponent)
    }]
})
@Feature({
  id: "translations",
  label: "Translations",
  folder: "portals",
  labelKey: "translations:title.label",
  i18n: ["translations", "portal.commands"],
  icon: "language",
  visibility: ["private"],
  categories: [],
  tags: ["navigation"],
  permissions: []
})
export class TranslationEditorComponent extends WithState<TranslationState>()(WithDialogs(WithSpeechCommands(WithCommands(AbstractFeature)))) {
  // instance data

  @ViewChild(NamespaceTreeComponent) tree! : NamespaceTreeComponent

  types = ["label", "tooltip", "shortcut", "speech"] // dynamic?
  namespaces : NamespaceNode[] = []
  selectedNamespace? : NamespaceNode
  messages : MessageMap = {} // ok -> {label: [], ...}
  selectedName? : string
  selectedMessages? : MessagesByType
  locales : string[] = []
  namespaceChanges : MessageChanges = {
    newMessages: [],
    changedMessages: [],
    deletedMessages: []
  }

  // constructor

  constructor(injector: Injector, private snackBar : MatSnackBar, private messageAdministrationService : MessageAdministrationService) {
    super(injector)
  }

  updateCommands() {
    this.setCommandEnabled("save", this.hasChanges())
    this.setCommandEnabled("revert", this.hasChanges())
  }

  // callbacks


  private split(name : string, by = ".") : {prefix: string, suffix: string} {
    const index = name.lastIndexOf(by) // e.g. bla.label

    return {
      prefix: name.substring(0, index),
      suffix: name.substring(index + 1)
    }
  }

  @Command({
    speech: "neuer namensraum :namespace"
  })
  addNamespace(parameter : any = {}) {
    this.inputDialog()
      .title("Add Namespace")
      .message("Input namespace name")
      .placeholder("namespace")
      .defaultValue(parameter.namespace || "")
      .okCancel()
      .show()
      .subscribe(name => {
        if (name && name != "")
          this.addNamespaceNode(name)
      })
  }

  @Command({
    speech: "neue übersetzung :message"
  })
  addMessage(parameter : any = {}) {
    this.inputDialog()
      .title("Add Message")
      .message("Input message name")
      .defaultValue(parameter.message || "")
      .placeholder("message")
      .okCancel()
      .show()
      .subscribe(name => {
        this.newMessage(name)
      })
  }

  canDeactivate() : Observable<boolean> {
    if (!this.hasChanges())
      return of(true)

    return this.confirmationDialog()
      .title("Unsaved Changes")
      .message("Still close?")
      .ok()
      .button({
        label: "Cancel",
        result: false
       })
      .show()
  }

  @Command({
    i18n: "portal.commands:revert",
    icon: "undo"
  })
  revert() {
    this.namespaceChanges = {
      newMessages: [],
      changedMessages: [],
      deletedMessages: []
    }

    this.updateCommands()

    this.select(this.selectedNamespace!).subscribe(_ => {
      if ( this.selectedName )
        this.selectMessages(this.selectedName)
      })
  }

  @Command({
    i18n: "portal.commands:save",
    icon: "save"
  })
  save(selectNode? : NamespaceNode) {
    if (!this.hasChanges())
      return

    this.messageAdministrationService.saveChanges(this.namespaceChanges).subscribe(createdMessages => {
      const builder = new StringBuilder()

      // compute message
      if (this.namespaceChanges.newMessages.length > 0)
        builder.append("added " + this.namespaceChanges.newMessages.length + " ")

      if (this.namespaceChanges.deletedMessages.length > 0)
        builder.append("deleted " + this.namespaceChanges.deletedMessages.length + " ")

      if (this.namespaceChanges.changedMessages.length > 0)
        builder.append("changed " + this.namespaceChanges.changedMessages.length + " ")

      builder.append("message(s)")

      // snack snack

      this.snackBar.open("Messages", builder.toString())

      // adjust local arrays

      this.selectedNamespace?.messages!.push(...createdMessages)
      for ( const deletedMessage of this.namespaceChanges.deletedMessages)
        this.selectedNamespace?.messages?.splice(this.selectedNamespace?.messages?.indexOf(deletedMessage), 1)

      this.namespaceChanges = {
        newMessages: [],
        changedMessages: [],
        deletedMessages: []
      }

      this.updateCommands()

      this.select(selectNode ? selectNode : this.selectedNamespace!).subscribe()
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
      const newMessage = (locale : string, type : string) : Message => {
        return {
          id: undefined,
          locale: locale,
          name: name + "." + type,
          namespace: this.selectedNamespace!.path,
          value: ""
        }
      }

      const messagesByType : MessagesByType = {}

      for (const type of this.types)
        messagesByType[type] = this.locales.map(locale => newMessage(locale, type))

      this.messages[name] = messagesByType

      this.selectMessages(name)
    }
  }

  computeMessages(messages : Message[]) : MessageMap {
    const result : MessageMap = {}

    const newMessage = (locale : string, name : string) : Message => {
      return {
        id: undefined,
        locale: locale,
        name: name,
        namespace: this.selectedNamespace!.path,
        value: ""
      }
    }

    for (const message of messages) {
      const {prefix, suffix} = this.split(message.name) // bla.blu.label -> {prefix: bla.blu, suffix: label}

      let messagesByType = result[prefix]

      if (!messagesByType) {
        // prefill with "new" message, overwrite with the real messages

        messagesByType = {}

        // TODO: this only works if the name only sticks to valid combinations <name>.<type>
        // bla:blu.foo.label does not work

        for (const type of this.types)
          messagesByType[type] = this.locales.map(locale => newMessage(locale, prefix + "." + type))

        result[prefix] = messagesByType
      }

      // add any unknown type not in the standard list

      if ( !messagesByType[suffix]) {
        this.types = [...this.types, suffix]
          messagesByType[suffix] = this.locales.map(locale => newMessage(locale, prefix + "." + suffix))
      }

      // add real message
try {
      messagesByType[suffix][this.locales.indexOf(message.locale)] = message
}
catch(e) {
  console.log(e)
}
    }

    // done

    return result
  }

  hasChanges():boolean {
      return this.namespaceChanges.newMessages.length > 0 ||
             this.namespaceChanges.changedMessages.length > 0 ||
            this.namespaceChanges.deletedMessages.length > 0
  }

  deleteAllMessages(message : string) {
    for ( const type in this.selectedMessages) {
      for (const message of this.selectedMessages[type]) {
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

  addType() {
    this.inputDialog()
      .title("New Type")
      .inputType("text")
      .defaultValue("")
      .okCancel()
      .show().subscribe((type) => {
      if ( type && type.length > 0 ) {
        // TODO: check list, check whatever

        this.types.push(type)

        this.selectedMessages![type] = this.locales.map(locale => {
          return {
            id: undefined,
            name: this.selectedName + "." + type,
            value: "",
            locale: locale,
            namespace: this.selectedNamespace!.path // ??
          } as Message
        })
      }
    })
  }

  deleteType(type: string) {
    this.types.splice(this.types.indexOf(type), 1)

    // TODO: dirty, etc
    delete this.selectedMessages![type]
  }

  addLocale() {
    this.inputDialog()
      .title("New Locale")
      .inputType("text")
      .defaultValue("")
      .okCancel()
      .show().subscribe((locale) => {
        if ( locale ) {
          // TODO better selection
          this.locales.push(locale)

          for ( const type of Object.keys(this.selectedMessages!)) { // label -> []
            const newMessage : Message = {...this.selectedMessages![type][0]}

            newMessage.id = undefined
            newMessage.locale = locale
            newMessage.value = ""

            this.selectedMessages![type].push(newMessage)
          }
        }
    })
  }

  deleteLocale(locale: string) {
    // TODO only if no changes
    this.confirmationDialog()
      .title("Delete Locale")
      .message("Are you sure?")
      .okCancel()
      .show()
      .subscribe(result => {
        if ( result ) {
          const index = this.locales.indexOf(locale)

          this.locales.splice(index, 1)

          for ( const type of Object.keys(this.selectedMessages!)) { // label -> []
            this.selectedMessages![type].splice(index, 1)
          }
        }
      })
  }

  select(namespaceNode : NamespaceNode) : Observable<any> {
    if (this.hasChanges()) {
      this.confirmationDialog()
        .okCancel()
        .title("Messages")
        .message("Save changes first")
        .show()
        .subscribe(result => {
        if (result) {
          this.save(namespaceNode);
        }
      })

      return of()
    }

    // start from scratch

    this.namespaceChanges = {
      newMessages: [],
      changedMessages: [],
      deletedMessages: []
    }

    this.selectedNamespace = namespaceNode

    if (namespaceNode) {
      return this.messageAdministrationService.readAllMessages(namespaceNode.path)
      .pipe(
        tap( (messages: Message[] | undefined) => {
          namespaceNode.messages = messages
          this.messages = this.computeMessages(messages!)
        })
        )
    }
    else return of()
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

  columnFiller():string {
    return "span " + (this.locales.length - 1);
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

    this.updateCommands()
  }

  // private

  private addNamespaceNode(namespace : string) {
    // local function

    const findOrCreateFolder = (name : string, folders : NamespaceNode[], prefix : string) => {
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
    for (const leg of namespace.split(".")) {
      parent = findOrCreateFolder(leg, parent, prefix).children
      prefix += leg + "."
    }

    this.namespaces = [...this.namespaces]
  }

  private setupNamespaces(namespaces : string[]) {
    const findOrCreateFolder = (name : string, folders : NamespaceNode[], prefix : string) => {
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

    for (const namespace of namespaces) {
      let parent = this.namespaces
      let prefix = ""
      for (const leg of namespace.split(".")) {
        parent = findOrCreateFolder(leg, parent, prefix).children
        prefix += leg + "."
      }
    }
  }

  // override Stateful

  override applyState(state: TranslationState) : void {
    //this.tree.applyState(state.treeExpansion)
  }

  override writeState(state: TranslationState) : void {
    state.treeExpansion = this.tree.getState()
    state.selectedNamespace = this.selectedNamespace?.path
    state.selectedMessage = this.selectedName
  }

  // implement OnInit

  override ngOnInit() : void {
    super.ngOnInit()

    const findNode = (path?: string) : NamespaceNode | undefined => {
      if ( path == undefined)
        return undefined

      const legs = path.split(".")

      const find = (nodes: NamespaceNode[], index: number) :  NamespaceNode | undefined => {
        const leg = legs[index]

        const node = nodes.find(n => n.name === leg)
        if (node) {
          if ( index < legs.length - 1)
             return find(node.children, index + 1)
          else
            return node
        }
        else return undefined
      }

      return find(this.namespaces, 0)
    }

    this.messageAdministrationService.readLocales().subscribe(locales => this.locales = locales)

    this.messageAdministrationService.readNamespaces().subscribe(namespaces => {
      this.setupNamespaces(namespaces)
      if ( this.state?.data.treeExpansion)
        setTimeout(() => this.tree.applyState(this.state?.data.treeExpansion), 0) // oh boy...

        const node = findNode(this.state?.data.selectedNamespace)
        if (node)
          this.select(node!).subscribe(_ => {
        if ( this.state?.data.selectedMessage)
            this.selectMessages( this.state!.data.selectedMessage!)
        }) // TODO
    })

    this.updateCommands()
  }
}
