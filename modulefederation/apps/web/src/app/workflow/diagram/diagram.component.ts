/* eslint-disable prefer-const */
//import { Modeling } from 'moddle';
//import { Element } from './../../../../node_modules/@types/moddle/index.d';
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AfterContentInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  SimpleChanges,
  EventEmitter,
  Inject
} from '@angular/core';


import { HttpClient } from '@angular/common/http';

import type Canvas from 'diagram-js/lib/core/Canvas';
import type Overlays from 'diagram-js/lib/features/overlays/Overlays';
import type { ImportDoneEvent, ImportXMLResult, SaveXMLResult } from 'bpmn-js/lib/BaseViewer';


import BpmnJS from 'bpmn-js/lib/Modeler';

import { from, Observable, tap } from 'rxjs';
import { Shape } from 'bpmn-js/lib/model/Types';

import { BaseElement } from 'bpmn-moddle'
import  { Element  } from "moddle"
import { AdministrationService } from '../service/administration-service';
import { DiagramConfiguration, DiagramConfigurationToken } from './diagram.configuration';
import ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import { ModelValidation, ValidationError } from '../validation';
import { OverlayAttrs, OverlaysFilter } from 'diagram-js/lib/features/overlays/Overlays';
import { Root, RootLike } from 'diagram-js/lib/model/Types';


//

//
@Component({
  selector: 'diagram',
  templateUrl: "./diagram.component.html",
  styleUrl: "./diagram.component.scss",
})
export class DiagramComponent implements AfterContentInit, OnChanges, OnDestroy, OnInit {
  // input & output

  @Input() process?: string;

  @Output() importDone: EventEmitter<ImportDoneEvent> = new EventEmitter();
  @Output() selectionChanged = new EventEmitter< Shape | undefined>();

  // instance data

  @ViewChild('ref', { static: true }) private el!: ElementRef;

  modeler: BpmnJS

  currentShape : Shape | undefined = undefined
  currentElement : Element | undefined = undefined

  overlays!: Overlays;

  errors : ValidationError[] = []

  canvas: Canvas | undefined
  elementRegistry : ElementRegistry | undefined

  selection: any

  // constructor

  constructor(private modelValidation: ModelValidation, private http: HttpClient, private administrationService: AdministrationService, @Inject(DiagramConfigurationToken) configuration: DiagramConfiguration) {
    this.modeler = new BpmnJS({
      moddleExtensions: configuration.extensions
    });

    this.overlays = this.modeler.get("overlays")
    this.selection = this.modeler.get("selection");

    this.modeler.on('import.done', (data) => {
      const { error, warnings } = data;

      this.canvas = this.modeler.get<Canvas>('canvas')
      this.canvas!.zoom('fit-viewport')
      this.elementRegistry = this.modeler.get("elementRegistry")
      this.validateModel()
    })
  }

  // private

  private select(shape: Shape) {
    this.selection.select(shape)
  }

  private addOverlay(shape: Shape | string, attributes: OverlayAttrs): string {
    return this.overlays.add(shape as string, "error", attributes)
  }

  private removeOverlay(filter: OverlaysFilter) {
    this.overlays.remove(filter)
  }

  private addMarker(shape: Shape) {
    const BASIC_WARN_HTML =
    '<div class="sgv-warn-container">' +
        '<img class="sgv-warn-icon" src="assets/svg/warning.svg"></img>' +
    '<div class="sgv-tooltip-content">'


     this.addOverlay(shape.id, {
          position: {
            bottom: 10,
            left: 10
          },
          html: BASIC_WARN_HTML
        });
  }

  private getProcess() : RootLike | undefined {
    return this.canvas?.getRootElement();
/*
    if ( root['di']?.bpmnElement)
      return root['di']?.bpmnElement
    else
      return undefined*/
  }

  computeXML() : Promise<SaveXMLResult> {
    return this.modeler.saveXML({format: true})
  }

 setProcess(xml: string): Observable<ImportXMLResult> {
    return from(this.modeler.importXML(xml))
  }

  selectError(error: ValidationError) {
    this.select(error.shape)
  }

  // implement AfterContentInit

  ngAfterContentInit(): void {
    this.modeler.attachTo(this.el.nativeElement);
  }

   // implement OnInit

  ngOnInit(): void {
    // set xml

    if ( this.process)
      this.setProcess(this.process)

    // add listeners

    this.modeler.on('selection.changed', (ev) => {
      const e : any = ev

      if ( e.newSelection != undefined &&  e.newSelection.length == 1) {
         const selection : Shape =  e.newSelection[0]

         const di : BaseElement = selection.di

        this.currentShape = (di as any);
        this.currentElement = (di as any).bpmnElement;
      }
      else {
        this.currentShape = this.getProcess() as Shape
        this.currentElement = this.currentShape?.businessObject
      }

      this.selectionChanged.emit(this.currentShape)
    });

    //this.modeler.on('element.changed', (e) => {
    //
    //});
  }

  type(error: ValidationError) {
    let type = error.shape.type

    let colon = type.indexOf(":")

    return type.substring(colon + 1)
  }

  validateModel() : boolean {
    this.removeOverlay({
      type: "error"
    })
    this.errors = []
    if ( this.getProcess()?.businessObject)
     this.errors = this.modelValidation.validate(this.getProcess()!.businessObject, this.elementRegistry!)

    let lastShape = undefined
    for ( let error of this.errors) {
      if ( error.shape !== lastShape) {
        this.addMarker(error.shape)

        lastShape = error.shape
      }
    }

    return this. errors.length > 0
  }

   // implement OnChanges

  ngOnChanges(changes: SimpleChanges) {
    // re-import whenever the url changes
    if (changes['process']) {
      let process = changes['process'].currentValue

      this.setProcess(process).subscribe(result => {
        this.elementRegistry = this.modeler.get("elementRegistry");

        this.validateModel()
      }
      );
    }
  }

   // implement OnDestroy

  ngOnDestroy(): void {
    this.modeler.destroy();
  }
}
