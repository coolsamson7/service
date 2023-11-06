import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable } from "rxjs"
import { ComponentDTO } from "../model/component.interface"
import { ServiceInstanceDTO } from "../model/service-instance.interface"
import { ComponentService } from "../service/component-service.service"
import { Update, Healths } from "../service/update-service.service"

@Injectable()
export class ComponentStore {
  // instance data

  component: ComponentDTO
  instances : ServiceInstanceDTO[] = []
  healths : Healths = {}

  componentName: string
  componentSubject = new BehaviorSubject<ComponentDTO> (null)
  instancesSubject = new BehaviorSubject<ServiceInstanceDTO[]>(this.instances)
  healthSubject    = new BehaviorSubject<Healths>(this.healths) // mapping service id -> health
  dead = false

  // constructor

  constructor(private componentService: ComponentService) {
  }

  // public

  update(update: Update) {
    console.log(update)

    if ( update.deletedServices.includes(this.componentName)) {
      this.componentSubject.next(null)
      this.instancesSubject.next(this.instances = [])
      this.healthSubject.next(this.healths = {})

      this.dead = true
    }

    else if ( update.addedServices.includes(this.componentName)) {
        this.setup(this.componentName)

        this.dead = false
    }
    
    else if (update.addedInstances[this.componentName] || update.deletedInstances[this.componentName]) {
        let deleted =  update.deletedInstances[this.componentName] || [] 
        let added =  update.addedInstances[this.componentName] || []

        let newInstances = [...this.instances.filter(instance => !deleted.includes(instance.instanceId)), ...added]
    
        this.instancesSubject.next(this.instances = newInstances)
      }

    // fetch health anyway
    

    if ( this.dead)
        console.log("kkk");//this.healthSubject.next({})
    else
        this.componentService.getServiceHealths(this.componentName).subscribe(
        health => this.healthSubject.next(this.healths = health)
     )
  }

  setup(componentName: string) {
    // component

    this.componentService.getDetails(this.componentName = componentName).subscribe(
        component => this.componentSubject.next(this.component = component)
    )

    // instances

    this.componentService.getServiceInstances(this.componentName).subscribe(
      instances => this.instancesSubject.next(this.instances = instances)
    )

    // health

     this.componentService.getServiceHealths(this.componentName).subscribe(
      health => this.healthSubject.next(this.healths = health)
     )
  }

  getInstances() :Observable<ServiceInstanceDTO[]>{
      return this.instancesSubject
  }

  getComponent() :Observable<ComponentDTO> {
    return this.componentSubject
  }

  getHealths() : Observable<Healths> {
    return this.healthSubject
   } 
}