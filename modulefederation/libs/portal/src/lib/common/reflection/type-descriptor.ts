/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/member-ordering */

import { MethodDescriptor } from "./method-descriptor";
import { PropertyDescriptor } from "./property-descriptor"
import { Decorator } from "./decorator";
import { InjectProperty } from "./injector";
import { Injector } from "@angular/core";
import { MemberDescriptor, PropertyType } from "./member-descriptor";
import { TraceLevel, Tracer, StringBuilder } from "@modulefederation/common";

export declare const Type: FunctionConstructor

export declare interface Type<T> extends Function {
  new (...args: any[]): T
}

/**
 * a <code>TypeDescriptor</code> captures the meta-data of a specific class
 * <ul>
 *    <li>specified methods</li>
 *    <li>constructor</li>
 *    <li>applied decorators for the class, methods and properties</li>
 * </ul>
 */
export class TypeDescriptor<T=any> {
    // static

    static forType<T>(type: Type<T>): TypeDescriptor<T> {
        let typeDescriptor = Reflect.getOwnPropertyDescriptor(type, "$descriptor")?.value
        if (!typeDescriptor)
           Reflect.set(type, "$descriptor", typeDescriptor = new TypeDescriptor<T>(type))

        return typeDescriptor
    }

    // instance data

    superClass: TypeDescriptor<T> | undefined = undefined

    public typeDecorators: ClassDecorator[] = []
    private allMembers : { [name: string]: MemberDescriptor } = {}
    private members: { [name: string]: MemberDescriptor } = {}
    private injectors: InjectProperty[] = []
    private decorators: Decorator[] = []
    private constructorMethod! : MethodDescriptor

    // constructor

    private constructor(public type: Type<T>) {
        if (Tracer.ENABLED)
            Tracer.Trace("type", TraceLevel.HIGH, "create type descriptor for {0}", type.name)

        this.analyze(type)
    }

    // public

    decorate(instance: any) {
        for (const decorator of this.decorators)
            decorator.decorate(this, instance)
    }

    public create(...args: any[]): T {
        return Reflect.construct(this.getConstructor().method, args)
    }

    public inject(target: T, injector: Injector): T {
        if (Tracer.ENABLED) Tracer.Trace("type", TraceLevel.HIGH, "inject ", typeof target)

        for (const injectProperty of this.injectors)
            injectProperty.inject(target, injector)

        return target
    }

    public addDecorator(decorator: Decorator): TypeDescriptor<T> {
        this.decorators.push(decorator)

        return this
    }

    public addTypeDecorator(decorator: ClassDecorator): TypeDescriptor<T> {
        if (Tracer.ENABLED)
            Tracer.Trace("type", TraceLevel.FULL, "add type decorator {0} to {1}", decorator.name, this.type.name)

        this.typeDecorators.push(decorator)

        return this
    }


    public addMethodDecorator(target: any, property: string, decorator: Function, ...args: any[]): TypeDescriptor<T> {
        if (Tracer.ENABLED)
            Tracer.Trace("type", TraceLevel.FULL, "add method decorator {0} to method {1}.{2}", decorator.name, this.type.name, property )

        const method = this.getMethod(property)

        if (method) {
            method.addDecorator(decorator, args)

            method.returnType = Reflect.getMetadata("design:returntype", target, property)
            method.paramTypes = Reflect.getMetadata('design:paramtypes', target, property) as []
        }

        return this
    }

    public addPropertyDecorator(target: any, property: string, decorator: PropertyDecorator): TypeDescriptor<T> {
        if (Tracer.ENABLED)
            Tracer.Trace("type", TraceLevel.FULL, "add property decorator {0} to property {1}.{2}", decorator.name, this.type.name, property)

        let descriptor = this.members[property] as PropertyDescriptor
        if (!descriptor) {
            // @ts-ignore
          this.properties[property] = descriptor = new PropertyDescriptor(property)
        }

        descriptor.addDecorator(decorator)
        descriptor.propertyType = Reflect.getMetadata("design:type", target, property)

        return this
    }

    public addInjector(injector: InjectProperty): TypeDescriptor<T> {
        this.injectors.push(injector)

        return this
    }

    public filterMethods(filter: (method: MethodDescriptor) => boolean) : MethodDescriptor[] {
        return <MethodDescriptor[]>Object.values(this.allMembers)
            .filter((property) => property.is(PropertyType.METHOD))
            .filter(method => filter(<MethodDescriptor>method))
    }

    public filterOwnMethods(filter: (method: MethodDescriptor) => boolean) : MethodDescriptor[] {
        return <MethodDescriptor[]>Object.values(this.members)
            .filter((property) => property.is(PropertyType.METHOD))
            .filter(method => filter(<MethodDescriptor>method))
    }

    public getMethods(): MethodDescriptor[] {
        return <MethodDescriptor[]>Object.values(this.allMembers).filter((property) => property.is(PropertyType.METHOD))
    }

    public getOwnMethods(): MethodDescriptor[] {
        return <MethodDescriptor[]>Object.values(this.members).filter((property) => property.is(PropertyType.METHOD))
    }

    public getProperties(): PropertyDescriptor[] {
        return <PropertyDescriptor[]>Object.values(this.allMembers).filter((property) => property.is(PropertyType.FIELD))
    }

    public getOwnProperties(): PropertyDescriptor[] {
        return <PropertyDescriptor[]>Object.values(this.members).filter((property) => property.is(PropertyType.FIELD))
    }

    public getConstructor(): MethodDescriptor {
        return this.constructorMethod
    }

    public getMethod(name: string): MethodDescriptor | undefined {
        return this.allMembers[name]?.asMethodDescriptor()
    }

    public getOwnMethod(name: string): MethodDescriptor | undefined {
        return this.members[name]?.asMethodDescriptor()
    }

    public getProperty(name: string): PropertyDescriptor | undefined {
      return this.allMembers[name]?.asPropertyDescriptor()
    }

    // private

    private analyze(type: Type<T>) {
        // super class

        const prototype = Object.getPrototypeOf(type)

        if (prototype?.name !== "" && prototype?.name !== "Object") {
            this.superClass = TypeDescriptor.forType(prototype)

            this.allMembers = {...this.superClass?.allMembers}
        }

        // methods

        const descriptors = Object.getOwnPropertyDescriptors(type.prototype)

        for (const propertyName in descriptors) {
            const descriptor = descriptors[propertyName]

            const isMethod = descriptor?.value instanceof Function

            if (isMethod) {
                const methodDescriptor = new MethodDescriptor(
                    propertyName,
                    descriptor?.value,
                    descriptor?.value == type ? PropertyType.CONSTRUCTOR : PropertyType.METHOD
                )

                this.members[propertyName] = methodDescriptor

                if (propertyName == "constructor" )
                    this.constructorMethod = methodDescriptor
            }
        } // for

        this.allMembers = { ...this.allMembers, ...this.members}
    }

    // public

    public toString(): string {
        const builder = new StringBuilder()

        for (const decorator of this.typeDecorators) builder.append("@").append(decorator.name).append("()\n")

        builder.append("class ").append(this.type.name);

        if ( this.superClass)
            builder.append(" extends ").append(this.superClass.type.name)

        builder.append("{\n")

        for (const field of this.getProperties()) {
            field.report(builder)
            builder.append("\n")
        }

        for (const method of this.getMethods()) {
            method.report(builder)
            builder.append("\n")
        }

        builder.append("}\n")

        return builder.toString()
    }
}
