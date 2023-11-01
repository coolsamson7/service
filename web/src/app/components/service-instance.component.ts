import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ServiceInstanceDTO } from '../model/service-instance.interface';
import { ComponentsComponent } from './components.component';
import { ComponentStore } from './component-details.component';
import { RouteElement } from '../widgets/navigation-component.component';

@Component({
  selector: 'service-instance',
  templateUrl: './service-instance.component.html',
  styleUrls: ['./service-instance.component.scss']
})
export class ServiceInstanceComponent implements OnInit, OnDestroy {
  // instance data

  subscription: Subscription
  instance: ServiceInstanceDTO = {
    component: null,
    instanceId:  "",
    serviceId:  "",
	host: "",
    port: 1,
	isSecure: false,
	uri : "",
    scheme: ""
  }
  health : String = "unknown"
  element: RouteElement = {
    label: "",
    route: ""
  }

  // constructor

  constructor(private activatedRoute: ActivatedRoute, private componentStore: ComponentStore, private componentsComponent: ComponentsComponent) {
    this.element.route = componentsComponent.topRouteElement().route + "/"

    this.componentsComponent.pushRouteElement(this.element)

    this.subscription = this.activatedRoute.params.subscribe({
        next: (params: any) => {
          this.setInstance( params['instance'])
        }
      });
  }

  // private

  setInstance(id: String) {
    this.componentStore.getInstances().subscribe({
        next: (instances: ServiceInstanceDTO[]) => {
            this.instance = instances.find((instance) => instance.instanceId == id)

            this.componentStore.getHealths().subscribe({
                next: (value) => {this.health = value[id as string]}
            })

             // set label

            this.element.label = this.instance.serviceId
        }
    })   
  }

  // implement OnInit

  ngOnInit() {
    /*this.subscription = this.activatedRoute.params.subscribe(params => {
        next: (params: any) => {
          this.setInstance( params['instance'])
        }
      });*/
  }

  // implement OnDestroy

  ngOnDestroy() {
    if ( this.element)
      this.componentsComponent.popRouteElement(this.element);

    this.subscription.unsubscribe();
  }
}
