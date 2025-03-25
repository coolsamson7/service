import { Component, Input } from "@angular/core"


@Component( {
  selector: 'badge',
  templateUrl: './badge.component.html',
  styleUrl: "./badge.component.scss"
})
export class BadgeComponent {
  // input

  @Input() number!: number
}
