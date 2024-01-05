import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { Feature } from "@modulefederation/portal";
import { ErrorStorage } from "./error-storage";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatListModule } from "@angular/material/list";
import { ErrorEntry } from "./global-error-handler";
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
  icon: "bug_report",
  visibility: ["public", "private"],
  categories: [],
  tags: ["error", "navigation"],
  permissions: []
})
export class ErrorComponent implements OnInit {
  // instance data

  selectedError?: ErrorEntry

  // constructor

  constructor(public storage: ErrorStorage) {
  }

  // public

  selectError(error: ErrorEntry) {
    this.selectedError = error
  }

  clear() {

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

  // implement OnInit

  ngOnInit() : void {
  }
}
