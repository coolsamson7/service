import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ComponentService } from '../service/component-service.service';

import { Subscription } from 'rxjs';
import { Update, UpdateService } from '../service/update-service.service';


@Component({
  selector: 'component-list',
  templateUrl: './component-list.component.html',
  styleUrls: ['./component-list.component.scss']
})
export class ComponentListComponent implements OnInit, OnDestroy {
  // instance data

  components : string[] = []
  selected : string
  subscription : Subscription

  // constructor

  constructor(private router : Router, private route : ActivatedRoute, private componentService : ComponentService, updateService : UpdateService) {
    this.subscription = updateService.getUpdates().subscribe(update => {
      this.update(update)
    })
  }

  // private

  select(id : any) {
    this.router.navigate([id], {relativeTo: this.route});
  }

  // public

  ngOnInit() {
    this.componentService.listAll().subscribe({
      next: (response) => {
        this.components = response;
      }
    })
  }

  // implement OnInit

  ngOnDestroy() {
    this.subscription.unsubscribe()
  }

  // implement OnDestroy

  private update(update : Update) {
    // remove from list

    this.components = this.components.filter(component => !update.deletedServices.find(s => s == component) == null)
  }
}
