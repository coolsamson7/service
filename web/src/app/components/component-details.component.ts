import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription, map, of, tap } from 'rxjs';
import { ComponentService } from '../service/component-service.service';
import { ComponentDTO } from '../model/component.interface';
import { ComponentsComponent } from './components.component';
import { ServiceInstanceDTO } from '../model/service-instance.interface';
import { RouteElement } from '../widgets/navigation-component.component';


@Injectable()
export class ComponentStore {
  // instance data

  componentName: String
  componentObservable: Observable<ComponentDTO>
  instances: ServiceInstanceDTO[]
  health: Map<String,String>

  // constructor

  constructor(private componentService: ComponentService) {
  }

  // public

  getHealth(instance: ServiceInstanceDTO) : Observable<String> {
    return this.getHealths().pipe(
      map(healths => {return healths[instance.instanceId]})
    )
  }

 getHealths() : Observable<Map<String,String>> {
  if ( this.health == null)
    return this.componentService.getServiceHealths(this.componentName).pipe(
      tap(health => {
        this.health = health
      })
    )
    else return of(this.health)
  }

  setup(componentName: String) :Observable<ComponentDTO> {
    return this.componentObservable = this.componentService.getDetails(this.componentName = componentName)
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
     model: {
      component: null,
      services: [],
      models: []
     },
     channels: []
  }
  subscription: Subscription
  element: RouteElement = {
    label: "",
    route: "/components/"
  }
  open: boolean[]

  // constructor

  constructor(private activatedRoute: ActivatedRoute, private componentStore: ComponentStore, private componentsComponent: ComponentsComponent) {
    componentsComponent.pushRouteElement(this.element)
  }

  // public

  toggle(i : number) {
      this.open[i] = ! this.open[i]
  }

  // private

  private setComponent(componentName: string) {
    this.componentStore.setup(componentName).subscribe({
      next: (value: ComponentDTO) => {
        this.component = value

        this.open = Array<boolean>(1 + value.model.services.length + value.model.models.length).fill(false)

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