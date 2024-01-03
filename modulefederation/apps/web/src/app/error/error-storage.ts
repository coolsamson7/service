import { Injectable } from "@angular/core";
import { ErrorEntry } from "./global-error-handler";

@Injectable({ providedIn: 'root' })
export class ErrorStorage {
  errors: ErrorEntry[] = []

  add(error: ErrorEntry) {
    this.errors.push(error)
  }
}
