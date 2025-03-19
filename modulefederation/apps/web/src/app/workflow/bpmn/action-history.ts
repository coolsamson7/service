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

        return this.stack.find((action: CommandStackAction) => action.context === action)!
    }

    findAction(element: Element, property: string) : CommandStackAction | undefined {
        for (let i = 0; i <= this.index; i++) {
            const action = this.stack[i]

            if ( action.command === "element.updateModdleProperties" && action.context.moddleElement === element && action.context.properties[property])
                return action
        }

        return undefined
    }
} 