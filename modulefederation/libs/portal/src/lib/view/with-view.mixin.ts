import { ViewChild, Component } from "@angular/core";
import { AbstractFeature } from "../feature";
import { registerMixins } from "../mixin/mixin";
import { ViewComponent } from "./view.component";
import { CommandConfig, CommandManager, ExecutionContext, LockCommandGroupInterceptor, LockCommandInterceptor } from "../command";
import { CommandInterceptor } from "../command/command-interceptor";

type Constructor<T = any> =  new (...args: any[]) => T;

/**
 * an interceptor that will turn on the busy cursor of the associated view after 100ms of comamnd execution.
 */
export class BusyCursorInterceptor implements CommandInterceptor {
    // constructor
  
    constructor(private view: WithView) {}
  
    // implement CommandInterceptor
  
    onCall(executionContext: ExecutionContext): void {
      executionContext.data.wasBusy = this.view.view.isBusy
  
      if (!executionContext.data.wasBusy )
        setTimeout(() => {
            if (executionContext.running)
                this.view.setBusy(true);
        }, 100);
    }
  
    onResult(executionContext: ExecutionContext): void {
      this.view.setBusy(executionContext.data.wasBusy)
    }
  
    onError(executionContext: ExecutionContext): void {
        this.view.setBusy(executionContext.data.wasBusy)
    }
  }

  export class LockViewInterceptor implements CommandInterceptor {
    // constructor
  
    constructor(private withView:  WithView) {
    }

    // private

    private showOverlay(show : boolean = true) : void {
        this.withView.showOverlay(show)
    }
  
    // implement CommandInterceptor
  
    onCall(context: ExecutionContext) {
      context.command.enabled = false;
      this.withView.showMessage('Holla'); // reset previous message if any
  
      this.showOverlay(true);
    }
  
    onError(context: ExecutionContext): void {
      context.command.enabled = true;
  
      this.showOverlay(false);
    }
  
    onResult(context: ExecutionContext): void {
      context.command.enabled = true;
  
      this.showOverlay(false);
    }
  }

export interface WithView {
    view : ViewComponent

    setBusy(busy: boolean) : void

    showOverlay(on: boolean): void

    showMessage(message: string): void
}

export function WithView<T extends Constructor<AbstractFeature & CommandManager>>(base: T) :Constructor<WithView> &  T  {
    @Component({ 
        selector: 'with-view',
        template: ""    
    })
    class W extends base implements WithView {
        // instance data

        @ViewChild(ViewComponent, {static: false}) view! : ViewComponent

        // instance data

        private lockViewInterceptor?: LockViewInterceptor
        private busyCursorInterceptor?: BusyCursorInterceptor

        // constructor

       //constructor(...args: any[]) {
       //  super(...args);
       //}

       // private

       private getLockViewInterceptor() {
        if (!this.lockViewInterceptor)
          this.lockViewInterceptor = new LockViewInterceptor(this)

        return this.lockViewInterceptor
       }

       private getBusyCursorInterceptor() {
        if (!this.busyCursorInterceptor)
          this.busyCursorInterceptor = new BusyCursorInterceptor(this)

        return this.busyCursorInterceptor
       }

       // override 
       
       override addCommandInterceptors(commandConfig: CommandConfig, interceptors: CommandInterceptor[]) : void  {
        switch ( commandConfig.lock) {
          case "view":
            interceptors.push(this.getBusyCursorInterceptor(), this.getLockViewInterceptor())
            break;

          case "command":
            interceptors.push(this.getBusyCursorInterceptor(), LockCommandInterceptor.instance)
            break;

          case "group":
            interceptors.push(this.getBusyCursorInterceptor(), new LockCommandGroupInterceptor())
            break;

           default:
            interceptors.push(this.getBusyCursorInterceptor())
        }
       }

       // implement WithView

       setBusy(busy: boolean) : void {
        this.view.setBusy(busy)
       }

       showOverlay(on: boolean) : void {
        this.view.showOverlay(on)
       }

       showMessage(message: string) : void {
        this.view.showMessage(message)
       }

      
    };//, WithView)

    registerMixins(W, WithView)


    return W
  }