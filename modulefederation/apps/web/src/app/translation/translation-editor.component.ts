import { Component, OnInit } from "@angular/core";
import {
    Feature,
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
import { matLegacySelectAnimations } from "@angular/material/legacy-select";

@Component({
    selector: 'translations',
    templateUrl: './translation-editor.component.html',
    styleUrls: ['./translation-editor.component.scss'],
    standalone: true,
    imports: [NamespaceTreeComponent, CommonModule, MatMenuModule, MatListModule, MatIconModule, MatSlideToggleModule, MatButtonModule, MatToolbarModule, FormsModule, MatFormFieldModule, MatInputModule]
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
    selection?: NamespaceNode
    messages : {[name: string] : Message[]} = {}
    selectedMessages?: Message[]
    locales: string[] = []
    namespaceChanges : MessageChanges = {
        newMessages: [],
        changedMessages: [],
        deletedMessages: []
    }

    // constructor

    constructor(private messageAdministrationService: MessageAdministrationService, private translationService: TranslationService) {
    }

    // callbacks

    save() {

    }

    selectMessages(message: Message[]) {
        this.selectedMessages = message
    }

    messageKeys(messages: {[name: string] : Message[]} ) {
        return Object.keys(messages)
    }

    computeMessages(messages: Message[]): {[name: string] : Message[]}  {
        let result : {[name: string] : Message[]} = {}

        let newMessage = (locale: string, name: string):Message => {
            return {
                id : undefined,
                locale : locale,
                name : name,
                namespace : this.selection!!.path,
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

    select(node: NamespaceNode) {
        console.log(this.namespaceChanges)

        if ( this.namespaceChanges.newMessages.length > 0 || this.namespaceChanges.changedMessages.length > 0)
            this.messageAdministrationService.saveChanges(this.namespaceChanges).subscribe(_=>
            console.log("ok"))

        // start from scratch

        this.namespaceChanges = {
            newMessages: [],
            changedMessages: [],
            deletedMessages: []
        }

        this.selection = node

        // TODO TEST

        let handleTranslations = (namespace: string, translations: Translation[]) => {
console.log(translations)
            let result = {}

            let findOrCreate = (name: string, folders: any) => {
                let folder = folders[name]

                if (!folder) {
                    folder = {}
                    folders[name] = folder
                }

                return folder
            }

            // create namespace

            let parent = result
            for ( let leg of namespace.split("."))
                parent = findOrCreate(leg, parent)

            // add translations

            for ( let translation of translations) {
                let namespace = parent
                let legs = translation.key.split(".")
                for (let i = 0; i < legs.length - 1; i++)
                    parent = findOrCreate(legs[i], namespace)

                // @ts-ignore
                parent[legs[legs.length - 1]] = translation.value
            }

            console.log(result)
        }

        this.translationService.getTranslations("de_DE", node.path).subscribe(
            translations => handleTranslations(node.path, translations)
        )

        // TEST

        if ( node ) {
            this.messageAdministrationService.readAllMessages(node.path).subscribe(
                messages => this.messages = this.computeMessages(messages)
            )
        }
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
                if ( prefix == "")
                    prefix = leg + "."
                else
                    prefix += leg + "."
            }
        }
    }

    // implement OnInit

    ngOnInit() : void {
        this.messageAdministrationService.readLocales().subscribe(locales => this.locales = locales)

        this.messageAdministrationService.readNamespaces().subscribe(namespaces => this.setupNamespaces(namespaces))
    }

    protected readonly matLegacySelectAnimations = matLegacySelectAnimations;
}
