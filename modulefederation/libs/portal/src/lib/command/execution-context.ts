import { CommandDescriptor } from "./command-descriptor";
import { Commands } from "./commands";

export class ExecutionContext {
    // instance data
  
    running = false
    result: any = undefined
    error: any = undefined
  
    // constructor
  
    constructor(public command: CommandDescriptor, public commands: Commands, public args: any[]) {}
  }
  