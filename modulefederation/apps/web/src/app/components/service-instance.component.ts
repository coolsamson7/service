import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ServiceInstanceDTO } from '../model/service-instance.interface';
import { ComponentsComponent } from './components.component';
import { RouteElement } from '../widgets/navigation-component.component';
import { ComponentStore } from './component-store';


interface Channel {
  name : String,
  uri : String
}

@Component({
  selector: 'service-instance',
  templateUrl: './service-instance.component.html',
  styleUrls: ['./service-instance.component.scss']
})
export class ServiceInstanceComponent implements OnInit, OnDestroy {
  // instance data

  subscription : Subscription
  healthSubscription! : Subscription
  instanceSubscription! : Subscription
  instance : ServiceInstanceDTO = {
      //component: null,
    instanceId: "",
    serviceId: "",
    host: "",
    port: 1,
    isSecure: false,
    uri: "",
    scheme: "",
    metadata: {}
  }
  health : string = "unknown"
  element : RouteElement = {
    label: "",
    route: ""
  }
  channels : Channel[] = []
  dead = false

  // constructor

  constructor(private activatedRoute : ActivatedRoute, private componentStore : ComponentStore, private componentsComponent : ComponentsComponent) {
    this.element.route = componentsComponent.topRouteElement().route + "/"

    this.componentsComponent.pushRouteElement(this.element)

    this.subscription = this.activatedRoute.params.subscribe({
      next: (params : any) => {
        this.setInstance(params['instance'])
      }
    });
  }

  // private

  setInstance(id : string) {
    this.instanceSubscription = this.componentStore.getInstances().subscribe({
      next: (instances : ServiceInstanceDTO[]) => {
        let instance = instances.find((instance) => instance.instanceId == id)

        if (instance) {
          this.instance = instance

          // set label

          this.element.label = this.instance.serviceId

          this.channels = this.parseChannnels(instance.metadata['channels'])

          this.dead = false
        }
        else {
          this.channels = []
          this.dead = true
        }
      }
    })

    this.healthSubscription = this.componentStore.getHealths().subscribe({
      next: (value) => this.health = value[id]
    })
  }

  ngOnInit() {
  }

  // implement OnInit

  ngOnDestroy() {
    if (this.element)
      this.componentsComponent.popRouteElement(this.element);

    this.subscription.unsubscribe();

    if (this.instanceSubscription != null)
      this.instanceSubscription.unsubscribe()

    if (this.healthSubscription != null)
      this.healthSubscription.unsubscribe()
  }

  // implement OnDestroy

  private parseChannnels = (addresses : String) : Channel[] => {
    let result = []

    if (addresses)
      for (let address of addresses.split(",")) {
        let lparen = address.indexOf("(")
        let rparen = address.indexOf(")")

        let channel = address.substring(0, lparen)
        let url = address.substring(lparen + 1, rparen)

        result.push({name: channel, uri: url})
      }

    return result
  }
}
