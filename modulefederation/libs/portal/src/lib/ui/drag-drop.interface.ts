/**
 * interface for drag sources
 */
export interface DragSource {
  /**
   * create and return an object after starting to drag
   */
  create(): any;
}

/**
 * interface for drop targets
 */
export interface DropTarget {
  /**
   * return if a drop is allowed or not
   * @param object the drag object
   */
  dropAllowed(object: any): boolean;

  /**
   * react in dropping the drag object
   * @param object the drag object
   */
  dropped(object: any): any;

  /**
   * any callback on over events
   * @param event
   */
  over?: (event: DragEvent) => void;
  /**
   * any callback on out events
   * @param event
   */
  out?: (event: DragEvent) => void;
}
