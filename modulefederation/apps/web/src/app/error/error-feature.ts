import { Component, OnInit } from "@angular/core";
import { Feature } from "@modulefederation/portal";
import { ErrorStorage } from "./error-storage";
import { CommonModule } from "@angular/common";

@Component({
  selector: 'error',
  templateUrl: './error-feature.html',
  styleUrls: ['./error-feature.scss'],
  standalone: true,
  imports: [CommonModule]
})
@Feature({
  id: "error",
  label: "Error",
  icon: "home",
  visibility: ["public", "private"],
  categories: [],
  tags: ["error", "navigation"],
  permissions: []
})
export class ErrorComponent implements OnInit {
  // constructor

  constructor(public storage: ErrorStorage) {
  }

  // implement OnInit

  ngOnInit() : void {
  }
}
