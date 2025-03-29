import CommandStack, { CommandContext, CommandStackAction, ElementLike } from 'diagram-js/lib/command/CommandStack';
import  {Element  } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";

interface Command {
    cmd: string,
    context: CommandContext
}

// NEW

import {
    reduce,
    forEach
  } from 'min-dash';
import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import CommandHandler from 'diagram-js/lib/command/CommandHandler';
  

interface UpdatePropertiesContext extends CommandContext {
    element: Shape,
    moddleElement: Element,
    properties: any,

    oldProperties?: any
    changed?: ElementLike[],

    reverted?: () => void
    executed?: () => void
}

class UpdatePropertiesHandler implements CommandHandler {
    // constructor

    constructor(private elementRegistry: ElementRegistry) {}

    // private

    getProperties(moddleElement: Element, propertyNames: string[]) {
        return reduce(propertyNames, (result: any, key: string) => {
            result[key] = moddleElement.get(key);
            return result;
        }, {});
    }
      
    setProperties(moddleElement: Element, properties: any) {
        forEach(properties, (value: any, key: string) => {
            moddleElement.set(key, value);
        });
    }

    // override

    execute(context: UpdatePropertiesContext) : ElementLike[] {
        const { moddleElement, properties} = context

        const changed = context.changed //|| this._getVisualReferences(moddleElement).concat(element);
        const oldProperties = context.oldProperties || this.getProperties(moddleElement, Object.keys(properties));
      
        this.setProperties(moddleElement, properties);
      
        context.oldProperties = oldProperties;
        context.changed = changed;

        if ( context.executed )
            context?.executed()
      
        return changed || [];
    }

    revert(context: UpdatePropertiesContext) : ElementLike[] {
        const {oldProperties, moddleElement} = context

        this.setProperties(moddleElement, oldProperties);

        if ( context.reverted )
            context?.reverted()

        return []
    }
}

(<any>UpdatePropertiesHandler)["$inject"] = ['elementRegistry']

//

class MultiCommandHandler implements CommandHandler {
    // constructor

    constructor(private commandStack: CommandStack) {}

    // preExecute()

    preExecute(context: Command[]) {
        for ( const command of context)
            this.commandStack.execute(command.cmd, command.context)
    }
}

(<any>MultiCommandHandler)["$inject"] = ['commandStack']

export class CommandBuilder {
    // instance data

    commands: Command[] = []

    // constructor

    constructor(private actionHistory: ActionHistory) {}

    // fluent

    updateProperties(context: CommandContext) : CommandBuilder {
        this.commands.push({
            cmd: 'element.update-properties',
            context
        })

        return this
    }

    // go, forrest

    execute() : CommandStackAction {
        if ( this.commands.length == 1)
            return this.actionHistory.execute(this.commands[0])
        else if ( this.commands.length > 1) {
            return this.actionHistory.execute({
                cmd: 'multi-command',
                context: this.commands
            })
        }
        else throw new Error("missing command")
    }
}

export class ActionHistory {
    // constructor

    constructor(private commandStack: CommandStack) {
        if ( !(<any>commandStack)["_getHandler"]("multi-command")) {
            try  {
                commandStack.registerHandler("multi-command", MultiCommandHandler)
                commandStack.registerHandler("element.update-properties", UpdatePropertiesHandler)
            }
            catch(e) {
                console.log(e)
            }
            
        }
    }

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

    execute(command: Command) : CommandStackAction {
        this.commandStack.execute(command.cmd, command.context)

        // sepcial handling for multi commands...we need the last update command
        let lastUpdateProperties = command

        if ( command.cmd == "multi-command")
            lastUpdateProperties = command.context[ command.context.length - 1]

        let i = this.index
        while ( i >= 0) {
            if ( this.stack[i].context.moddleElement === lastUpdateProperties.context.moddleElement)
                return this.stack[i]

            i--
        }

        throw new Error("should not happen")
    }

    commandBuilder() : CommandBuilder {
        return new CommandBuilder(this)
    }

    updateProperties(context: CommandContext) : CommandStackAction {
      if ( context.moddleElement.$builder) {
        const builder : CommandBuilder = context.moddleElement.$builder

        const action = builder.updateProperties(context).execute()

        delete context.moddleElement.$builder

        return action
        }

      else {
        this.commandStack.execute('element.update-properties', context)

        let i = this.index
        while ( i >= 0) {
            if ( this.stack[i].context.moddleElement === context.moddleElement)
                return this.stack[i]

            i--
        }

        throw Error("should not happen")
        }
    }

    findAction(element: Element, property: string) : CommandStackAction | undefined { // TODO!!!!
        for (let i = this.index; i >= 0; i--) {
            const action = this.stack[i]

            if ( action.command === "element.update-properties" && action.context.moddleElement === element && Object.hasOwn(action.context.properties, property))
                return action
        }

        return undefined
    }
}
