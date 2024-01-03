import { ErrorHandler, Injectable } from "@angular/core";
import { ErrorManager } from "@modulefederation/portal";

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler extends ErrorHandler {
  // constructor

  constructor(private errorManager: ErrorManager) {
    super()
  }

  // implement ErrorHandler

  override handleError(error: any) {
    this.errorManager.handle(error)
  }
}
