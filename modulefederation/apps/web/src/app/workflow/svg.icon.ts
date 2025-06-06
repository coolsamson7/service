/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'svg-icon',
  template: `<div class="icon-wrap"  [class]="style"><span [innerHTML]="svgIcon" class="icon"></span></div>`,
  styleUrl: './svg-icon.scss',
  standalone: true
})
export class SvgIconComponent implements OnChanges {
  // static

  static icons : {[name: string] : SafeHtml}= {}

  // input

  @Input() name!: string
  @Input() style = ""

  // instance data

  public svgIcon : SafeHtml = "";

  // constructor

  constructor(private httpClient: HttpClient, private sanitizer: DomSanitizer) {
  }

  // implement OnChanges

  public ngOnChanges(): void {
    if (this.name) {
      this.svgIcon = SvgIconComponent.icons[this.name]

      if ( ! this.svgIcon) {
        this.httpClient
          .get(`assets/svg/${this.name}.svg`, { responseType: 'text' })
          .subscribe(value => {
            this.svgIcon = this.sanitizer.bypassSecurityTrustHtml(value);
            SvgIconComponent.icons[this.name] = this.svgIcon
          });
        }
    }
  }
}
