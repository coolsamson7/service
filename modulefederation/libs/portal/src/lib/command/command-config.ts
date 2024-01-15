
/**
 * possible lock types for commands.
 */
export enum LockType {
    /**
     * lock the command
     */
    COMMAND,
    /**
     * lock all commands of the same grouo
     */
    GROUP,
    /**
     * lock the view
     */
    VIEW
  }

  export interface CommandConfig {
    /**
     * the command name
     */
    command?: string;
     /**
     * the - optional - group of the commands that may be disabled
     */
    group?: string;
    /**
     * the label of the command
     */
    label?: string;
    /**
     * the - optional - i18n key that will be used to compute the label
     */
    i18n?: string;
    /**
     * the - optional - shortcut of the command
     */
    shortcut?: string;
    /**
     * the - optional - icon name of the command
     */
    icon?: string;
    /**
     * the enabled status of the command.
     */
    enabled?: boolean;
    /**
     * the - optional - lock configuration of the command
     */
    lock?: LockType;

    action?: (args: any) => Promise<any> | any;
}