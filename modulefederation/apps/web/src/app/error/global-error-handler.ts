import { ErrorHandler, Injectable, NgZone } from "@angular/core";
import { ErrorContext, ErrorManager } from "@modulefederation/portal";

export interface ErrorEntry {
  date: Date,
  error: any,
  context: ErrorContext
}

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
