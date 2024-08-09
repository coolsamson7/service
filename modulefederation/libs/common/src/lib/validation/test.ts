/**
 * A <code>Test</code> is a low-level test that is executed by a {@link Constraint}
 * @param T the base type
 */
export interface Test<T> {
    /**
     * the name of the parent constraint ( e.g. "string" )
     */
    type: string
    /**
     * the name of the test ( e.g. "min" )
     */
    name: string
    /**
     * any parameters that specify the test arguments
     */
    params: any
    /**
     * optional message that will be used on a violation
     */
    message?: string
    /**
     * if <code>true</code> the test chain will stop since the missing tests rely on this test result and will fail for sure
     */
    break?: boolean
    /**
     * if <code>true</code> a negative test result will not issue a violation
     */
    ignore?: boolean

    /**
     * the test implementation
     * @param object the to be validated object
     */
    check(object: T): boolean
}
