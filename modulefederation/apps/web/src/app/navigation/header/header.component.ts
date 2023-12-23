import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'portal-header',
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
