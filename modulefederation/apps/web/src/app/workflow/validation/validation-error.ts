import  { Element  } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";


export interface ValidationError {
    error: string

    shape?: Shape,
    element?: Element, 
    property?: string,
}