/**
 * <code>State</code> describes a state of a particular component.
 */
export interface State {
    /**
     * the owner of the state. Usually the selector of the component
     */
    owner: any;
    /**
     * any object describing the internal state
     */
    data?: any;
    /**
     * the array of child states
     */
    children?: State[];
  }
  