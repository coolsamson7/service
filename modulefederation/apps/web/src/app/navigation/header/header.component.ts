import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  // output

  @Output() public sidenavToggle = new EventEmitter();

  // callbacks

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }
}
