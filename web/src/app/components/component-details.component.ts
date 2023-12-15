import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentDTO } from '../model/component.interface';
import { InterfaceDescriptor } from '../model/service.interface';
import { ComponentsComponent } from './components.component';
import { RouteElement } from '../widgets/navigation-component.component';
import { Update, UpdateService } from '../service/update-service.service';
import { ComponentStore } from './component-store';
import { Subscription } from 'rxjs';


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
     label: "",
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
  dead = false

  updateSubscription: Subscription

  // constructor

  constructor(private activatedRoute: ActivatedRoute, private componentStore: ComponentStore, private componentsComponent: ComponentsComponent, updateService: UpdateService) {
    componentsComponent.pushRouteElement(this.element)

    this.updateSubscription = updateService.getUpdates().subscribe({
        next: update => {
          this.update(update)
        }
      });
  }

  // public

  toggle(i : number) {
      this.open[i] = ! this.open[i]
  }

  // private

  private update(update: Update) {
    this.componentStore.update(update)

    if ( this.dead ) {
      if ( update.addedServices.find(service => service == this.component.name) != null)
        this.dead = false
    }
    else {
      if ( update.deletedServices.find(service => service == this.component.name) != null)
        this.dead = true
    }
  }

  // network


  private setComponent(componentName: string) {
    this.componentStore.setup(componentName);

    // this is a stream also called after upates!

    this.componentStore.getComponent().subscribe({
      next: (value: ComponentDTO) => {
        if ( value != null) {
          this.component = value
          this.dead = false

          this.open = Array<boolean>(1 + value.model.services.length + value.model.models.length).fill(false)

          if (this.element.label.length == 0) {
            this.element.label = componentName
            this.element.route += componentName
          }
        } // if
        else {
          this.dead = true
        }
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
    this.updateSubscription.unsubscribe();

    this.componentStore.destroy()
  }
}
