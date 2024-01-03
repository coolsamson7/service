import { StringBuilder } from "../common";
import { MethodDescriptor } from "./method-descriptor";
import { FieldDescriptor } from "./field-descriptor";


export enum PropertyType {
  FIELD,
  CONSTRUCTOR,
  METHOD,
}
export abstract class PropertyDescriptor {
  // constructor

  protected constructor(public name: string, public type: PropertyType) {}

  // protected

  is(type : PropertyType) {
    return this.type == type
  }

  asMethodDescriptor() : MethodDescriptor | undefined {
    return undefined
  }

  asFieldDescriptor() : FieldDescriptor | undefined {
    return undefined
  }

  abstract report(builder: StringBuilder): void
}
