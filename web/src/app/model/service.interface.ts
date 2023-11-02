export interface TypeDescriptor {
    name: String,
    parameter: TypeDescriptor[]
}
   
export interface AnnotationDescriptor {
    name: String,
    parameters: ParameterValueDescriptor[]
}

export interface  ParameterDescriptor {
    name: String,
    type: TypeDescriptor,
    annotations: AnnotationDescriptor[]
}

export interface ParameterValueDescriptor {
    name: String,
    type: TypeDescriptor,
    value: any
}

export interface  MethodDescriptor {
    name: String,
    returnType: TypeDescriptor,
    parameters: ParameterDescriptor[]
    annotations: AnnotationDescriptor[]
}

export interface PropertyDescriptor {
    name: String,
    type: TypeDescriptor,
    annotations: AnnotationDescriptor[]
}

export interface  InterfaceDescriptor {
    name: String,
    kind: String, // for now
    inherits: String,
    implements: String[],
    annotations: AnnotationDescriptor[],
    properties: PropertyDescriptor[],
    methods: MethodDescriptor[]
}