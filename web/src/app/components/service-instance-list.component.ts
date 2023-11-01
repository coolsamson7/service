import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ComponentService } from '../service/component-service.service';

import {NavigableListItemDirective, NavigableListComponent} from '../widgets/navigable-list.directive';
import { ServiceInstanceDTO } from '../model/service-instance.interface';
import { ComponentDTO } from '../model/component.interface';
import { ComponentStore } from './component-details.component';


@Component({
  selector: 'service-instance-list',
  templateUrl: './service-instance-list.component.html',
  styleUrls: ['./service-instance-list.component.scss']
})
export class ServiceInstanceListComponent implements OnInit {
   // instance data

   @Input() component: ComponentDTO
   instances: ServiceInstanceDTO[] = []
   selected: ServiceInstanceDTO
   health: any = {}

   // constructor

   constructor(private router: Router, private route: ActivatedRoute, private componentStore: ComponentStore) { }

   // public

   select(instance: ServiceInstanceDTO) {
     this.router.navigate([instance.instanceId], { relativeTo: this.route });
   }

   // implement OnInit

   ngOnInit() {
      this.componentStore.getInstances().subscribe({
          next: (value: ServiceInstanceDTO[]) => {
            this.instances = value

            this.componentStore.getHealths().subscribe({
                next: (value) => {this.health = value}
            })
          }
        });
   }
}
