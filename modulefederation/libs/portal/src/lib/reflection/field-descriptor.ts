import { StringBuilder } from "../common";
import { PropertyDescriptor, PropertyType } from "./property-descriptor";


export class FieldDescriptor extends PropertyDescriptor {
  // instance data

  public decorators: MethodDecorator[] = []
  public propertyType: any

  // constructor

  constructor(name: string) {
    super(name, PropertyType.FIELD)
  }

  // public

  override asFieldDescriptor() : FieldDescriptor | undefined {
    return this
  }


  addDecorator(decorator: MethodDecorator) {
    this.decorators.push(decorator)
  }

  report(builder: StringBuilder): void {
    for (const decorator of this.decorators) builder.append("\t@").append(decorator.name).append("()\n")

    builder.append("\t").append(this.name)

    if (this.propertyType) builder.append(": ").append(this.propertyType.name)

    builder.append("\n")
  }
}
