import { ReplaySubject } from "rxjs";
import { Injector, Type } from "@angular/core";
import { ModuleRegistry } from "../modules/module-registry";
import { TypeDescriptor } from "../reflection";

declare type Ctr<T> = {new (...args: any[]) : T}
type GetConstructorArgs<T> = T extends new (...args: infer U) => any ? U : never

declare type Result<T> = (...args: GetConstructorArgs<T>) => T


abstract class _AbstractModule {
    public static injectorSubject: ReplaySubject<Injector>;

    static New<T extends Ctr<any>>(Base: T, injectIntoProp?: { [prop: string]: Type<any> }): Result<T> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const module = this
        const clazz = class extends Base {
            constructor(...args : any[]) {
                super(...args);

                module.injectorSubject.subscribe((injector) => {
                    TypeDescriptor.forType(this.constructor as any).inject(this, injector)

                    // manually provided stuff

                    if (injectIntoProp)
                        for (const key in injectIntoProp!)
                            Reflect.set(this, key, injector.get(injectIntoProp[key]));
                });
            }
        };

        // @ts-ignore
        return (...args : GetConstructorArgs<T>) => {new clazz(...args)}
    }
}

//export type AbstractModule = typeof _AbstractModule; // Export so people can use the base type for variables but not derive it

export const AbstractModule = () =>  {
    const injectorSubject: ReplaySubject<Injector> = new ReplaySubject<Injector>(1)

    return class AbstractModuleClass extends _AbstractModule {
        static override injectorSubject = injectorSubject

        constructor(injector: Injector) {
            super();

            const metadata = Reflect.get(this.constructor, "$$metadata")
            if ( metadata )
                injector.get(ModuleRegistry).markAsLoaded(metadata)

            injectorSubject.next(injector)
        }
    }
}