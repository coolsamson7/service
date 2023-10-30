import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ComponentService } from '../service/component-service.service';
import { ComponentDTO } from '../model/component.interface';
import { ServiceInstanceDTO } from '../model/service-instance.interface';
import { ComponentsComponent, RouteElement } from './components.component';

@Component({
  selector: 'component-details',
  templateUrl: './component-details.component.html',
  styleUrls: ['./component-details.component.css']
})
export class ComponentDetailsComponent implements OnInit, OnDestroy {
  // instance data

  component: ComponentDTO
  subscription: Subscription
  instances: ServiceInstanceDTO[] = []

  // constructor

  constructor(private activatedRoute: ActivatedRoute, private componentService: ComponentService, private componentsComponent: ComponentsComponent) {
    this.component = this.activatedRoute.snapshot.params.component;
  }

  element: RouteElement

  // implement OnInit

  ngOnInit() {
    this.subscription = this.activatedRoute.params.subscribe(params => {
      this.componentService.getDetails(params['component']).subscribe({
        next: (value: ComponentDTO) => {
          this.component = value

          // NEW

          if ( this.element)
             this.componentsComponent.routes.splice(this.componentsComponent.routes.indexOf(this.element, 0), 1);

          this.componentsComponent.routes.push(this.element = {label: this.component.name, route: "/components/" + this.component.name})

          // NEW

          // load instances

          this.componentService.getServiceInstances(this.component.name).subscribe({
            next: (value: ServiceInstanceDTO[]) =>
              this.instances = value
          });
        }
      });
    })
  }

  // implement OnDestroy

  ngOnDestroy() {
    if ( this.element)
      this.componentsComponent.routes.splice(this.componentsComponent.routes.indexOf(this.element, 0), 1);

    this.subscription.unsubscribe();
  }
}