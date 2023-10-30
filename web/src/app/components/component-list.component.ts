import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ComponentService } from '../service/component-service.service';

import {NavigableListItemDirective, NavigableListComponent} from '../widgets/navigable-list.directive';


@Component({
  selector: 'component-list',
  templateUrl: './component-list.component.html',
  styleUrls: ['./component-list.component.css']
})
export class ComponentListComponent implements OnInit {
   // instance data

   components: String[] = []
   selected: String

   // constructor

   constructor(private router: Router, private route: ActivatedRoute, private componentService: ComponentService) { }
    
   // public

    select(id: any) {
      this.router.navigate([id], { relativeTo: this.route });
    }

     // implement OnInit

     ngOnInit() {
       this.componentService.listAll().subscribe(
        (response) => { this.components = response; console.log(response);},
        (error) => { console.log(error); });

     }
}