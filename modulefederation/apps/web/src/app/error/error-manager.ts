import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class ErrorManager {
  handle(error: any) {
    throw error
  }
}
