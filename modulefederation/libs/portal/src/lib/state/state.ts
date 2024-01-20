/**
 * <code>State</code> describes a state of a particular component.
 */
export interface State<S=any> {
    /**
     * the owner of the state. Usually the selector of the component
     */
    owner: any;
    /**
     * any object describing the internal state
     */
    data: S;
    /**
     * the array of child states
     */
    children?: State[];
  }
  