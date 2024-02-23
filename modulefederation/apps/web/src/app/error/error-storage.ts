import { Injectable } from "@angular/core";
import { ErrorContext } from "@modulefederation/portal";

export interface ErrorEntry {
  date: Date,
  error: any,
  context: ErrorContext
}

@Injectable({ providedIn: 'root' })
export class ErrorStorage {
  errors: ErrorEntry[] = []

  add(error: ErrorEntry) {
    this.errors.push(error)
  }
}
