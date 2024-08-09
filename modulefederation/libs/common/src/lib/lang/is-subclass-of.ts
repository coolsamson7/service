export declare type Class = new (...args: any[]) => any;

export const isSubclassOf = (cls: Class, superCls: Class): boolean => {
  return cls === superCls || cls.prototype instanceof superCls;
}
