export type TypeViolation = {
    /**
     * the type name
     */
    type: string
    /**
     * the constraint name
     */
    name: string
    /**
     * any parameters of the constraint
     */
    params: any
    /**
     * the value
     */
    value: any
    /**
     * the path
     */
    path: string
    /**
     * optional message
     */
    message?: string
}
