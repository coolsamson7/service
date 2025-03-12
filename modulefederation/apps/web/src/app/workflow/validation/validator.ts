
import  { Element  } from "moddle"
import { Shape } from "bpmn-js/lib/model/Types";
import { ValidationContext } from "./validation";


export interface ModelValidator {
    validate(shape: Shape, element: Element, context: ValidationContext) : void;
  
    accepts(element: Element) : boolean
  }
  