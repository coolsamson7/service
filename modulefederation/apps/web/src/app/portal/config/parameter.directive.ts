import { ConfigurationProperty } from "./configuration-model";
import { ComponentRef, Directive, EventEmitter, Input, OnChanges, OnDestroy, Output, Type, ViewContainerRef } from "@angular/core";
import { ParamComponent } from "./parameter-component";
import { StringParamComponent } from "./string/string-parameter.component";
import { NumberParamComponent } from "./number/number-parameter.component";
import { BooleanParamComponent } from "./boolean/boolean-parameter.component";

type GetterSetter = {
  get: () => any;
  set: (value: any) => void;
};

type Accessors = {
  [valueType: string]: (config: ConfigurationProperty, model: any) => GetterSetter;
};

const accessors: Accessors = {
  // binding from model

  binding: (config: ConfigurationProperty, model) => ({
    get: () => {
      return config.value // get(model, config.path!)
    },
    set: (value) => {
      config.value = value//set(model, config.path!, value)
    }
  }),

  /* static value

  value: (valueType: ValueType, model) => ({
    get: () => valueType.value,
    set: (value) => (valueType.value = value)
  }),*/
}

@Directive({
  standalone: true,
  selector: '[parameter]'
})
export class ParameterDirective implements OnChanges, OnDestroy {
  // in- & output

  @Input()
  data!: ConfigurationProperty;
  @Input()
  type!: string;
  @Input()
  disabled! : boolean;

  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onChange = new EventEmitter<any>();

  // instance data

  component!: ComponentRef<any>;
  instance!: ParamComponent;

  // constructor

  constructor(private container: ViewContainerRef) {
  }

  // private

  private updateComponent(instance: ParamComponent) {
    const { get, set } = accessors["binding"](this.data, this.data); // will call setup?


    instance.onChange = (value) => {
      this.onChange.emit(value)
    }

    instance.disabled = this.disabled

    Object.defineProperty(instance, 'value', { get, set, configurable: true });
  }

  private findComponentType4(metadata: ConfigurationProperty) :Type<any> {
    switch (metadata.type) {
      case "string":
        return StringParamComponent

      case "number":
        return NumberParamComponent

      case "boolean":
        return BooleanParamComponent

      default:
        return StringParamComponent // make the compiler happy
    }

  }

  private addComponent(metadata: ConfigurationProperty) {
    if (this.component)
      this.component.destroy();

    this.component = this.container.createComponent(this.findComponentType4(metadata) );

    console.log("disabled " + this.disabled)
    // pass data

    this.updateComponent((this.instance = this.component.instance));
  }

  // implement OnChanges

  ngOnChanges() {
    this.addComponent(this.data);
  }

  // implement OnDestroy

  ngOnDestroy() {
    this.component?.destroy();
    this.container.clear();
  }
}
