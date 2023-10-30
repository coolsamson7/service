import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // output

  @Output() public sidenavToggle = new EventEmitter();
  
  // constructor

  constructor(public app: AppComponent) { }

  // public

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  // implement OnInit

  ngOnInit(): void {
  }
  
}