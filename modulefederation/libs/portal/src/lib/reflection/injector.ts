export type Injection = () => any

export class Injector {
  // constructor

  constructor(private property: string, private injection: Injection) {}

  // public

  inject(target: any) {
    target[this.property] = this.injection()
  }
}
