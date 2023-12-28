import { Component, OnInit } from "@angular/core";
import {
    Feature, I18nModule,
    Message,
    MessageAdministrationService, MessageChanges,
    Translation,
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
import { Dialogs } from "../portal/dialog/dialogs";

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
    icon: "computer",
    visibility: ["public", "private"],
    categories: [],
    tags: ["navigation"],
    permissions: []
})
export class TranslationEditorComponent implements OnInit {
    // instance data

    namespaces: NamespaceNode[] = []
    selectedNamespace?: NamespaceNode
    messages : {[name: string] : Message[]} = {}
    selectedMessages?: Message[]
    locales: string[] = []
    namespaceChanges : MessageChanges = {
        newMessages: [],
        changedMessages: [],
        deletedMessages: []
    }

    // constructor

    constructor(private dialogs: Dialogs, private snackBar : MatSnackBar, private messageAdministrationService: MessageAdministrationService, private translationService: TranslationService) {
    }

    // callbacks

    addNamespace() {
        this.dialogs.inputDialog()
            .title("Add Namespace")
            .message("Input namespace name")
            .placeholder("namespace")
            .defaultValue("")
            .okCancel().show().subscribe(name => {
                if ( name && name != "")
                    this.addNamespaceNode(name)
        })
    }

    addMessage() {
        this.dialogs.inputDialog()
            .title("Add Message")
            .message("Input message name")
            .defaultValue("")
            .placeholder("message")
            .okCancel().show().subscribe(name => {
            this.newMessage(name)
        })
    }

    save(selectNode?: NamespaceNode) {
        this.messageAdministrationService.saveChanges(this.namespaceChanges).subscribe(createdMessages=> {
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

    selectMessages(message: Message[]) {
        this.selectedMessages = message
    }

    messageKeys(messages: {[name: string] : Message[]} ) {
        return Object.keys(messages)
    }

    newMessage(name: string) {
        if ( name != "" && !this.messages[name]) {
            let newMessage = (locale : string) : Message => {
                return {
                    id: undefined,
                    locale: locale,
                    name: name,
                    namespace: this.selectedNamespace!!.path,
                    value: ""
                }
            }

            let newMessages = []

            for (let i = 0; i < this.locales.length; i++)
                newMessages.push(newMessage(this.locales[i]))

            this.messages[name] = newMessages
        }
    }

    computeMessages(messages: Message[]): {[name: string] : Message[]}  {
        let result : {[name: string] : Message[]} = {}

        let newMessage = (locale: string, name: string):Message => {
            return {
                id : undefined,
                locale : locale,
                name : name,
                namespace : this.selectedNamespace!!.path,
                value : ""
            }
        }

        for ( let message of messages) {
            let array = result[message.name]

            if (!array) {
                // prefill with "new" message, overwrite with the real messages
                array =  []
                for ( let i = 0; i < this.locales.length; i++)
                    array.push(newMessage(this.locales[i], message.name))

                result[message.name] = array
            }

            array[this.locales.indexOf(message.locale)] = message
        }

        return result
    }

    hasChanges() {
        return this.namespaceChanges.newMessages.length > 0 || this.namespaceChanges.changedMessages.length > 0
    }

    hasMessageChanges(message: string) {
        return this.namespaceChanges.newMessages.find(m => m.name == message) || this.namespaceChanges.changedMessages.find(m => m.name == message)
    }

    select(namespaceNode: NamespaceNode) {
        if ( this.hasChanges()) {
            this.dialogs.confirmationDialog()
                .okCancel()
                .title("Messages")
                .message("Save changes first")
                .show().subscribe(result => {
                    if ( result ) {
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

        if ( namespaceNode ) {
            if ( !namespaceNode.messages) {
                this.messageAdministrationService.readAllMessages(namespaceNode.path).subscribe(
                    messages => {
                        namespaceNode.messages = messages
                        this.messages = this.computeMessages(messages)
                    }
                )
            }
            else this.messages = this.computeMessages(namespaceNode.messages)
        }
    }


    isChanged(message: Message):boolean {
        return this.namespaceChanges.newMessages.includes(message) || this.namespaceChanges.changedMessages.includes(message)
    }

    isNew(message: Message):boolean {
        return message.id == undefined
    }

    onChange(message: Message) {
        if ( message.id) {
            if ( !this.namespaceChanges.changedMessages.includes(message))
                this.namespaceChanges.changedMessages.push(message)
        }
        else {
            if ( !this.namespaceChanges.newMessages.includes(message))
                this.namespaceChanges.newMessages.push(message)
        }
    }

    // private

    private addNamespaceNode(namespace: string) {
        // local function

        let findOrCreateFolder = (name: string, folders: NamespaceNode[], prefix: string) => {
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

        if ( this.selectedNamespace)
            namespace = this.selectedNamespace.path + "." + namespace

        // go

        let parent = this.namespaces
        let prefix = ""
        for ( let leg of namespace.split(".")) {
            parent = findOrCreateFolder(leg, parent, prefix).children
            prefix += leg + "."
        }

        this.namespaces = [...this.namespaces]
    }

    private setupNamespaces(namespaces: string[]) {
        let findOrCreateFolder = (name: string, folders: NamespaceNode[], prefix: string) => {
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

        for ( let namespace of namespaces) {
            let parent = this.namespaces
            let prefix = ""
            for ( let leg of namespace.split(".")) {
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
