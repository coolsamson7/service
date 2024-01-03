import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { catchError, finalize, Observable } from 'rxjs';
import { ErrorManager } from '@modulefederation/portal';

/**
 * http interceptor that will remember the request details as an error context.
 */
@Injectable({ providedIn: 'root' })
export class HttpErrorInterceptor implements HttpInterceptor {
  // constructor

  constructor(private errorManager: ErrorManager) {}

  // implement HttpInterceptor

  /**
   * @inheritdoc
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // remember current context

    const context = this.errorManager.clearContext();

    return next.handle(request).pipe(
      catchError((e) => {
        // push context

        if (context) this.errorManager.pushContext(context);

        this.errorManager.pushContext({
          $type: 'http',
          request: request
        });

        // and handle error

        this.errorManager.handle(e);

        // context will be reset in finalize, so no need to do here anything

        throw e;
      }),
      finalize(() => {
        // restore context as found before the call

        this.errorManager.setContext(context!!);
      })
    );
  }
}
