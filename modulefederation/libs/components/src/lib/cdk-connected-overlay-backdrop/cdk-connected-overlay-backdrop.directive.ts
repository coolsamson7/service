import { Directive, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[cdkConnectedOverlayBackdrop]'
})
export class CdkConnectedOverlayBackdropDirective implements OnInit {
  // input

  @Input('cdkConnectedOverlayBackdrop') backdropContainerSelector! : string// = '.pane-container > .content';

  @Input('cdkConnectedOverlayOpen')
  set change(isOpen: boolean) {
    isOpen ? this.showBackdrop() : this.hideBackdrop();
  }

  @Output() onBackdropClick: EventEmitter<any> = new EventEmitter();


  // instance data

  private container!: Element;

  // constructor

  constructor(private el: ElementRef) {
  }

  // private

  private getContainer() {
    return this.el.nativeElement.previousElementSibling.closest(this.backdropContainerSelector);
  }

  private showBackdrop(): void {
    const node = document.createElement('dim');

    node.setAttribute("position", "absolute")
    node.setAttribute("top", "0px")
    node.setAttribute("bottom", "0px")
    node.setAttribute("left", "0px")
    node.setAttribute("right", "0px")

    //background: black;
    //opacity: 0.3;
    //opacity: 0.3;
    //z-index: 899;

    node.addEventListener("click", (event) =>
      this.onBackdropClick.emit(event))

    this.getContainer()?.appendChild(node);
  }

  private hideBackdrop(): void {
    this.getContainer()?.querySelector('dim')?.remove();
  }

  // implement OnInit

  ngOnInit() {
    this.container = this.getContainer();

    !this.container &&
    console.error(`
      No container found for CdkConnectedOverlayBackdropDirective.
      (Selector: '${this.backdropContainerSelector}')
    `);
  }
}
