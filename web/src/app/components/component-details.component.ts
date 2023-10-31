import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, of, tap } from 'rxjs';
import { ComponentService } from '../service/component-service.service';
import { ComponentDTO } from '../model/component.interface';
import { ComponentsComponent, RouteElement } from './components.component';
import { ServiceInstanceDTO } from '../model/service-instance.interface';


@Injectable()
export class ComponentStore {
  // instance data

  componentName: String
  componentObservable: Observable<ComponentDTO>
  instances: ServiceInstanceDTO[]

  // constructor

  constructor(private componentService: ComponentService) {
  }

  // public

  setup(componentName: String) :Observable<ComponentDTO> {
    this.componentName = componentName

    return this.componentObservable = this.componentService.getDetails(componentName).pipe(
      tap(val => {
        // TODO val.instances = []
      })
    )
  }

  getInstances() :Observable<ServiceInstanceDTO[]>{
    if (this.instances == null)
      return this.componentService.getServiceInstances(this.componentName).pipe(
        tap(val => {
          this.instances = val
        }));
    else
       return of(this.instances)
  }

  getComponent() :Observable<ComponentDTO> {
    return this.componentObservable
  }
}

@Component({
  selector: 'component-details',
  templateUrl: './component-details.component.html',
  styleUrls: ['./component-details.component.scss'],
  providers: [ComponentStore]
})
export class ComponentDetailsComponent implements OnInit, OnDestroy {
  // instance data

  component: ComponentDTO = {
     name: null,
     description: "",
     services: [],
     channels: []
  }
  subscription: Subscription
  element: RouteElement = {
    label: "",
    route: "/components/"
  }

  // constructor

  constructor(private activatedRoute: ActivatedRoute, private componentStore: ComponentStore, private componentsComponent: ComponentsComponent) {
    componentsComponent.pushRouteElement(this.element)
  }

  // private

  private setComponent(componentName: string) {
    this.componentStore.setup(componentName).subscribe({
      next: (value: ComponentDTO) => {
        this.component = value

        this.element.label = componentName
        this.element.route += componentName
      }
    });
  }

  // implement OnInit

  ngOnInit() {
    this.subscription = this.activatedRoute.params.subscribe(params => {
      this.setComponent(params["component"])
    })
  }

  // implement OnDestroy

  ngOnDestroy() {
    if ( this.element)
      this.componentsComponent.popRouteElement(this.element);

    this.subscription.unsubscribe();
  }
}