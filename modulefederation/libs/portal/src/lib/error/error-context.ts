/**
 * An <code>ErrorContext</code> covers possible context parameters that are known in case of an exception.
 * contexts can be chained in order to cover different aspects of a call. ( e.g. command, http.call, ... )
 */
export interface ErrorContext {
    /**
     * the chained {@link ErrorContext}
     */
    $next?: ErrorContext
    /**
     * the type of context
     */
    $type: string

    /**
     * any possible properties of this context
     */
    [prop: string]: unknown
}
