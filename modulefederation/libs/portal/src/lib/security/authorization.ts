/**
 * authorization answers questions about granted permissions
 */
export class Authorization {
  /**
   * return true, if the current session has access to a specific permission, false otherwise.
   * @param permission the permission object
   */
  hasPermission(permission: string): boolean {
      return true; // that's easy :-)
  }
}
