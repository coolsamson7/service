import CommandStack, { CommandStackAction } from 'diagram-js/lib/command/CommandStack';
import  {Element  } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";

export interface UpdateProperties {
    element: Shape,
    moddleElement:Element,
    properties: any
  }

export class ActionHistory {
    // constructor

    constructor(private commandStack: CommandStack) {}

    // private

    get stack() : CommandStackAction[] {
        return (<any>this.commandStack)["_stack"]
    }

    get index() : number {
        return (<any>this.commandStack)["_stackIdx"]
    }

    // public

    undo() {
        this.commandStack.undo()
    }

    redo() {
        this.commandStack.redo()
    }

    canUndo() {
        return this.commandStack.canUndo()
    }

    clear() {
        this.commandStack.clear()
    }

    updateProperties(action: UpdateProperties) : CommandStackAction {
        this.commandStack.execute('element.updateModdleProperties', action)

        let i = this.index
        while ( i >= 0) {
            if ( this.stack[i].context.moddleElement === action.moddleElement)
                return this.stack[i]

            i--
        }
       
        throw Error("should not happen")
    }

    findAction(element: Element, property: string) : CommandStackAction | undefined {
        for (let i = this.index; i >= 0; i--) {
            const action = this.stack[i]

            if ( action.command === "element.updateModdleProperties" && action.context.moddleElement === element && Object.hasOwn(action.context.properties, property))
                return action
        }

        return undefined
    }
} 