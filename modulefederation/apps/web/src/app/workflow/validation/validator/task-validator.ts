import { ValidationContext } from "../validation"
import  { Element  } from "moddle"
import { RegisterValidation } from "../validation.decorator"
import { Injectable } from "@angular/core"
import { Shape } from "bpmn-js/lib/model/Types";
import { TaskDescriptorService } from "../../service/task-service-descriptor";
import { AbstractModelValidator } from "../abstract-validator";
import { FeatureRegistry, MessageBus } from "@modulefederation/portal";


@RegisterValidation("bpmn:ServiceTask")
@Injectable({providedIn: 'root'})
export class TaskValidator extends AbstractModelValidator {
  // constructor

  constructor(private taskService : TaskDescriptorService) {
    super()

    taskService.getTasks()
  }

  // private

  getServiceNames() : string[] {
    return this.taskService.getTasks().map(service => service.name)
  }

  checkServiceName(shape: Shape, element: Element, context: ValidationContext) {
    const implementation : string = element["implementation"]

    if (!this.getServiceNames().includes(implementation) )
      context.error(shape, element, "implementation", `unknown service ${implementation}`)
  }

  // implement

  override validate(shape: Shape, element: Element, context: ValidationContext) : void {
    this.checkNonEmpty(shape, element, "name", context)

    if (this.checkNonEmpty(shape, element, "implementation", context))
      this.checkServiceName(shape, element, context)
  }
}

@RegisterValidation("bpmn:UserTask")
@Injectable({providedIn: 'root'})
export class UserTaskValidator extends AbstractModelValidator {
  // constructor

  constructor(private messageBus: MessageBus, private featureRegistry: FeatureRegistry, private taskService : TaskDescriptorService) {
    super()
  }

  // private

  private checkFeature(shape: Shape, element: Element, feature: string, context: ValidationContext) {
    const features = this.featureRegistry.finder().withTag("task").find().map(feature => feature.path!)

    if ( !features.includes(feature))
      context.error(shape, element, "formKey", `unknown feature ${feature}`)
  }

  private checkForm(shape: Shape, element: Element, form: string, context: ValidationContext) {
    const formNames : string[] = []
    this.messageBus.broadcast({
      topic: "workflow",
      message: "set-forms",
      arguments: formNames
    })

    if ( !formNames.includes(form))
      context.error(shape, element, "formKey", `unknown form ${form}`)
  }

  // implement

  override validate(shape: Shape, element: Element, context: ValidationContext) : void {
    this.checkNonEmpty(shape, element, "name", context)
    this.checkNonEmpty(shape, element, "assignee", context)

    if (this.checkNonEmpty(shape, element, "formKey", context)) {
      const key = this.get<string>(element, "formKey")
      if ( key.startsWith("form:"))
        this.checkForm(shape, element, key.substring(key.indexOf(":") + 1), context)
      
      else if (key.startsWith("feature:"))
        this.checkFeature(shape, element, key.substring(key.indexOf(":") + 1), context)
    }
  }
}