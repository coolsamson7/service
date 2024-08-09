/* eslint-disable @typescript-eslint/ban-types */
import { StringBuilder } from "@modulefederation/common";
import { MemberDescriptor, PropertyType } from "./member-descriptor";

interface MethodDecoratorSpec {
  decorator: Function
  arguments: any
}

export class MethodDescriptor extends MemberDescriptor {
  // instance data

  public returnType: any
  public paramTypes: any[] = []
  public async = false
  public decorators: MethodDecoratorSpec[] = []

  // constructor

  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(name: string, public method: Function, type: PropertyType) {
    super(name, type)

    this.analyze(method)
  }

  // private

  // eslint-disable-next-line @typescript-eslint/ban-types
  private analyze(method: Function) {
    this.returnType = Reflect.getMetadata("design:returntype", method)
    this.async = Object.getPrototypeOf(method).constructor.name === "AsyncFunction"
  }

  // protected

  override asMethodDescriptor() : MethodDescriptor | undefined {
    return this
  }

  report(builder: StringBuilder): void {
    for (const decorator of this.decorators) builder.append("\t@").append(decorator.decorator.name).append("()\n")

    builder
      .append("\t")
      .append(this.async === true ? "async " : "")
      .append(this.name)
      .append("()")

    if (this.returnType) builder.append(": ").append(this.returnType?.name)

    builder.append("\n")
  }

  hasDecorator(decorator: Function): boolean {
    return this.decorators.find((spec) => spec.decorator == decorator) !== undefined
  }

  getDecorator(decorator: Function): MethodDecoratorSpec | undefined {
    return this.decorators.find((spec) => spec.decorator == decorator)
  }

  addDecorator(decorator: Function, args: any[]) {
    this.decorators.push({
      decorator: decorator,
      arguments: args,
    })
  }
}
