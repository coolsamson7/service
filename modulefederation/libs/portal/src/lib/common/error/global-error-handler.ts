import { Injectable, ErrorHandler, NgZone } from "@angular/core"
import { ErrorManager } from "./error-manager"

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler extends ErrorHandler {
  // constructor

  constructor(private errorManager: ErrorManager, private zone: NgZone) {
    super()
  }

  // implement ErrorHandler

  override handleError(error: any) {
    this.zone.run(() => this.errorManager.handle(error, this.errorManager.context()))
  }
}
