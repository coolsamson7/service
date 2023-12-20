import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Portal, PortalElement } from '../navigation.interface';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent implements OnInit {
  // input & output

  @Input({required: true}) portal : Portal;
  @Output() sidenavClose = new EventEmitter();

  // constructor

  constructor(public app : AppComponent) {
  }

  // public

  public select(element : PortalElement) {
    this.app.navigate(element)
    this.sidenavClose.emit();
  }

  // implement OnInit

  ngOnInit() {
  }
}
