export interface NamedDescriptor {
    name : string,
}

export interface TypeDescriptor extends NamedDescriptor {
    optional : Boolean,
    parameter : TypeDescriptor[]
}

export interface AnnotationDescriptor extends NamedDescriptor {
    parameters : ParameterValueDescriptor[]
}

export interface ParameterDescriptor extends NamedDescriptor {
    type : TypeDescriptor,
    annotations : AnnotationDescriptor[]
}

export interface ParameterValueDescriptor extends NamedDescriptor {
    type : TypeDescriptor,
    value : any
}

export interface MethodDescriptor extends NamedDescriptor {
    returnType : TypeDescriptor,
    parameters : ParameterDescriptor[]
    annotations : AnnotationDescriptor[]
}

export interface PropertyDescriptor extends NamedDescriptor {
    type : TypeDescriptor,
    annotations : AnnotationDescriptor[]
}

export interface InterfaceDescriptor extends NamedDescriptor {
    kind : string, // for now
    inherits : string,
    implements : string[],
    annotations : AnnotationDescriptor[],
    properties : PropertyDescriptor[],
    methods : MethodDescriptor[]
}
