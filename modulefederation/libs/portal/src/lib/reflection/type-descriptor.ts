/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/member-ordering */
import { StringBuilder } from "../common"
import { TraceLevel, Tracer } from "../tracer"
import { MethodDescriptor } from "./method-descriptor";
import { PropertyType } from "./property-descriptor";
import { PropertyDescriptor } from "./property-descriptor";
import { FieldDescriptor } from "./field-descriptor";
import { Decorator } from "./decorator";
import { InjectProperty } from "./injector";
import { Injector } from "@angular/core";

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
        let typeDescriptor = Reflect.get(type, "$descriptor")
        if (!typeDescriptor) 
           Reflect.set(type, "$descriptor", typeDescriptor = new TypeDescriptor<T>(type))

        return typeDescriptor
    }

    // static

    // instance data

    superClass: TypeDescriptor<T> | undefined = undefined

    public typeDecorators: ClassDecorator[] = []
    private allProperties : { [name: string]: PropertyDescriptor } = {}
    private properties: { [name: string]: PropertyDescriptor } = {}
    private injectors: InjectProperty[] = []
    private decorators: Decorator[] = []

    // constructor

    private constructor(public type: Type<T>) {
        if (Tracer.ENABLED) Tracer.Trace("type", TraceLevel.HIGH, "create type descriptor for {0}", type.name)

        this.analyze(type)
    }

    // public

    decorate(instance: any) {
        for (const decorator of this.decorators) decorator.decorate(this, instance)
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
        if (Tracer.ENABLED) Tracer.Trace("type", TraceLevel.FULL, "add type decorator {0} to {1}", decorator.name, this.type.name)

        this.typeDecorators.push(decorator)

        return this
    }


    public addMethodDecorator(target: any, property: string, decorator: Function, ...args: any[]): TypeDescriptor<T> {
        if (Tracer.ENABLED)
            Tracer.Trace("type", TraceLevel.FULL, "add method decorator {0} to method {1}.{2}", decorator.name, this.type.name, property )

        const method = this.getMethod(property)

        if (method) {
            method?.addDecorator(decorator, args)

            method.returnType = Reflect.getMetadata("design:returntype", target, property)
            method.paramTypes = Reflect.getMetadata('design:paramtypes', target, property) as []
        }

        return this
    }

    public addPropertyDecorator(target: any, property: string, decorator: PropertyDecorator): TypeDescriptor<T> {
        if (Tracer.ENABLED)
            Tracer.Trace(
                "type",
                TraceLevel.FULL,
                "add property decorator {0} to property {1}.{2}",
                decorator.name,
                this.type.name,
                property
            )

        let descriptor = this.properties[property] as FieldDescriptor
        if (!descriptor) {
            // @ts-ignore
          this.properties[property] = descriptor = new FieldDescriptor(property)
        }

        descriptor.addDecorator(decorator)
        descriptor.propertyType = Reflect.getMetadata("design:type", target, property)

        return this
    }

    public addInjector(injector: InjectProperty): TypeDescriptor<T> {
        this.injectors.push(injector)

        return this
    }

    public filterMethods(filter: (method: MethodDescriptor) => boolean, all = true) : MethodDescriptor[] {
        return <MethodDescriptor[]>Object.values(all ? this.allProperties : this.properties)
            .filter((property) => property.is(PropertyType.METHOD))
            .filter(method => filter(<MethodDescriptor>method))
    }

    public getMethods(all = true): MethodDescriptor[] {
        return <MethodDescriptor[]>Object.values(all ? this.allProperties : this.properties).filter((property) => property.is(PropertyType.METHOD))
    }

    public getProperties(): FieldDescriptor[] {
        return <FieldDescriptor[]>Object.values(this.properties).filter((property) => property.is(PropertyType.FIELD))
    }

    public getConstructor(): MethodDescriptor {
        return <MethodDescriptor>Object.values(this.properties).find((property) => property.is(PropertyType.CONSTRUCTOR))
    }

    public getMethod(name: string, all = true): MethodDescriptor | undefined {
        return  (all ? this.allProperties : this.properties)[name]?.asMethodDescriptor()
    }

    public getField(name: string): FieldDescriptor | undefined {
      return  this.properties[name]?.asFieldDescriptor()
    }

    // private

    private analyze(type: Type<T>) {
        // super class

        const prototype = Object.getPrototypeOf(type)

        if (prototype?.constructor.name != "Object" && prototype?.constructor.name != "Function") {
            this.superClass = TypeDescriptor.forType(Object.getPrototypeOf(type))

            this.allProperties = {...this.superClass?.allProperties}
        }

        // methods

        const descriptors = Object.getOwnPropertyDescriptors(type.prototype)

        for (const propertyName in descriptors) {
            const descriptor = descriptors[propertyName]

            const isMethod = descriptor?.value instanceof Function

            if (isMethod) {
                // @ts-ignore
              this.properties[propertyName] = new MethodDescriptor(
                    propertyName,
                    descriptor?.value,
                    descriptor?.value == type ? PropertyType.CONSTRUCTOR : PropertyType.METHOD
                )
            }
        } // for

        this.allProperties = { ...this.allProperties, ...this.properties}
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
