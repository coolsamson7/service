import { ErrorHandler, Injectable } from "@angular/core";
import { ErrorManager } from "./error-manager";

@Injectable({ providedIn: 'root' })
export class GlobalErrorHandler extends ErrorHandler {
  // constructor

  constructor(private errorManager: ErrorManager) {
    super()
  }

  // implement ErrorHandler

  override handleError(error: any) {
    this.errorManager.handle(error)
    throw error;
  }
}
