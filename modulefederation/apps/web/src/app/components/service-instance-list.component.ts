import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceInstanceDTO } from '../model/service-instance.interface';
import { ComponentDTO } from '../model/component.interface';
import { Subscription } from 'rxjs';
import { ComponentStore } from './component-store';


@Component({
  selector: 'service-instance-list',
  templateUrl: './service-instance-list.component.html',
  styleUrls: ['./service-instance-list.component.scss']
})
export class ServiceInstanceListComponent implements OnInit, OnDestroy {
  // instance data

  @Input() component! : ComponentDTO
  instances : ServiceInstanceDTO[] = []
  selected! : ServiceInstanceDTO
  instanceSubscription! : Subscription
  healthSubscription! : Subscription
  health : any = {}

  // constructor

  constructor(private router : Router, private route : ActivatedRoute, private componentStore : ComponentStore) {
  }

  // public

  select(instance : ServiceInstanceDTO) {
    this.router.navigate([instance.instanceId], {relativeTo: this.route});
  }

  // implement OnInit

  ngOnInit() {
    // stream !

    this.instanceSubscription = this.componentStore.getInstances().subscribe({
      next: (value : ServiceInstanceDTO[]) => this.instances = value
    })

    this.healthSubscription = this.componentStore.getHealths().subscribe({
      next: (value) => this.health = value
    })
  }

  // implement OnDestroy

  ngOnDestroy() {
    this.instanceSubscription.unsubscribe()
    this.healthSubscription.unsubscribe()
  }
}
