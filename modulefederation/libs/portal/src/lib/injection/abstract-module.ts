import { ReplaySubject } from "rxjs";
import { Injector, Type } from "@angular/core";

declare type Ctr<T> = {new (...args: any[]) : T}
declare type Result<T> = (...args: any[]) => T
abstract class _AbstractModule {
    public static injectorSubject: ReplaySubject<Injector>;

    static New<T extends Ctr<any>>(Base: T, injectIntoProp?: { [prop: string]: Type<any> }): Result<T> {
        let module = this
        let clazz = class extends Base {
            constructor(...args : any[]) {
                super(...args);

                module.injectorSubject.subscribe((injector) => {
                    const inject = (<any>this.constructor).$$inject;

                    // injectables

                    for (const key in inject || {})
                        Reflect.set(this, key,  injector.get(inject[key]));

                    // manually provided stuff

                    if (injectIntoProp)
                        for (const key in injectIntoProp!!)
                            Reflect.set(this, key, injector.get(injectIntoProp[key]));
                });
            }
        };

        // @ts-ignore
        return (...args : any[]) => {new clazz(...args)}
    }
}

export type AbstractModule = typeof _AbstractModule; // Export so people can use the base type for variables but not derive it

export function AbstractModule(injectorSubject: ReplaySubject<Injector> = new ReplaySubject<Injector>(1))  {
    let clazz =  class extends _AbstractModule {
        static override injectorSubject = injectorSubject

        constructor(injector: Injector) {
            super();

            injectorSubject.next(injector)
        }
    }

    clazz.injectorSubject = injectorSubject

    return clazz
}
