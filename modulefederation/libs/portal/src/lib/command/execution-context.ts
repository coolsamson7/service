import { CommandDescriptor } from "./command-descriptor";
import { CommandAdministration } from "./with-commands.mixin";

export class ExecutionContext {
    // instance data
  
    running = false
    result: any = undefined
    error: any = undefined
    data : any  = {}
  
    // constructor
  
    constructor(public command: CommandDescriptor, public commands: CommandAdministration, public args: any[]) {}
  }
  