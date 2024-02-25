import { StringBuilder } from "../util/string-builder";
import { MethodDescriptor } from "./method-descriptor";
import { PropertyDescriptor } from "./property-descriptor";


export enum PropertyType {
  FIELD,
  CONSTRUCTOR,
  METHOD,
}
export abstract class MemberDescriptor {
  // constructor

  protected constructor(public name: string, public type: PropertyType) {}

  // protected

  is(type : PropertyType) {
    return this.type == type
  }

  asMethodDescriptor() : MethodDescriptor | undefined {
    return undefined
  }

  asPropertyDescriptor() : PropertyDescriptor | undefined {
    return undefined
  }

  abstract report(builder: StringBuilder): void
}
