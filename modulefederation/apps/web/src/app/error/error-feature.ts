import { Component, Injector, OnInit, ViewEncapsulation } from "@angular/core";
import { AbstractFeature, Feature, StackFrame, Stacktrace } from "@modulefederation/portal";
import { ErrorEntry, ErrorStorage } from "./error-storage";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatListModule } from "@angular/material/list";
import { AngularSplitModule } from "angular-split";

@Component({
  selector: 'error',
  templateUrl: './error-feature.html',
  styleUrls: ['./error-feature.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, AngularSplitModule, MatButtonModule, MatIconModule, MatToolbarModule, MatTooltipModule, MatFormFieldModule, MatListModule]
})
@Feature({
  id: "error",
  label: "Error",
  folder: "portals",
  icon: "bug_report",
  visibility: ["public", "private"],
  categories: [],
  tags: ["error", "navigation"],
  permissions: []
})
export class ErrorComponent extends AbstractFeature {
  // instance data

  selectedError?: ErrorEntry
  stack? : string

  // constructor

  constructor(injector: Injector, public storage: ErrorStorage) {
    super(injector)
  }

  // public

  async selectError(error: ErrorEntry) {
    this.selectedError = error

    if ( error.error instanceof Error) {
      const frames = Stacktrace.createFrames(error.error.stack || "")

      await Stacktrace.mapFrames(...frames)

      this.stack = ""

      for ( const frame of frames )
         this.stack += "\n" + frame.file + ":" + frame.lineNumber + ":" + frame.column + " " + frame.methodName
    }
    else this.stack = undefined
  }

  clear() {
    // TODO
  }

  errorClass(selectedError : ErrorEntry) {
    return selectedError.error.constructor.name
  }


  errorMessage(selectedError : ErrorEntry) {
    return selectedError.error instanceof Error ? selectedError.error.message : selectedError.error
  }

  errorContext(selectedError : ErrorEntry) {
    return selectedError.context?.$type
  }

  errorStack(selectedError : ErrorEntry): string | undefined {
    if ( selectedError.error instanceof Error)
      return selectedError.error.stack
    else
      return undefined
  }
}
