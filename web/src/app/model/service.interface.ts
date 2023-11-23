export interface TypeDescriptor {
    name: string,
    optional: Boolean,
    parameter: TypeDescriptor[]
}
   
export interface AnnotationDescriptor {
    name: string,
    parameters: ParameterValueDescriptor[]
}

export interface  ParameterDescriptor {
    name: string,
    type: TypeDescriptor,
    annotations: AnnotationDescriptor[]
}

export interface ParameterValueDescriptor {
    name: string,
    type: TypeDescriptor,
    value: any
}

export interface  MethodDescriptor {
    name: string,
    returnType: TypeDescriptor,
    parameters: ParameterDescriptor[]
    annotations: AnnotationDescriptor[]
}

export interface PropertyDescriptor {
    name: string,
    type: TypeDescriptor,
    annotations: AnnotationDescriptor[]
}

export interface  InterfaceDescriptor {
    name: string,
    kind: string, // for now
    inherits: string,
    implements: string[],
    annotations: AnnotationDescriptor[],
    properties: PropertyDescriptor[],
    methods: MethodDescriptor[]
}