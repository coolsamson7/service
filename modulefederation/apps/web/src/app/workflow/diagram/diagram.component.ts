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
import type { ImportDoneEvent, ImportXMLResult, SaveXMLResult } from 'bpmn-js/lib/BaseViewer';


import BpmnJS from 'bpmn-js/lib/Modeler';

import { from, Observable } from 'rxjs';
import { Shape } from 'bpmn-js/lib/model/Types';
//import Modeling from 'bpmn-js/lib/features/modeling/Modeling';


import { BaseElement } from 'bpmn-moddle'
import  { Element  } from "moddle"
import { AdministrationService } from '../service/administration-service';
import { DiagramConfiguration, DiagramConfigurationToken } from './diagram.configuration';

@Component({
  selector: 'diagram',
  templateUrl: "./diagram.component.html",
  styleUrl: "./diagram.component.scss",
})
export class DiagramComponent implements AfterContentInit, OnChanges, OnDestroy, OnInit {
  // input & output

  @Input() process?: string;

  @Output() importDone: EventEmitter<ImportDoneEvent> = new EventEmitter();
  @Output() selectionChanged = new EventEmitter< Element | undefined>();

  // instance data

  @ViewChild('ref', { static: true }) private el!: ElementRef;

  modeler: BpmnJS

  currentElement : Element | undefined = undefined

  // constructor

  constructor(private http: HttpClient, private administrationService: AdministrationService, @Inject(DiagramConfigurationToken) configuration: DiagramConfiguration) {
    this.modeler = new BpmnJS({
      moddleExtensions: configuration.extensions
    });
  
    
    /* test


    administrationService.getProcessDefinitions().subscribe(descriptors => {
      let descriptor = descriptors[0]

      administrationService.readProcessDefinition(descriptor).subscribe(xml => {
        console.log(xml)
      })
    })*/

    // TODO

    this.modeler.on<ImportDoneEvent>('import.done', ({ error }) => {
      if (!error) {
        this.modeler.get<Canvas>('canvas').zoom('fit-viewport');
      }


    });
  }

  // private

  private getProcess() {
    const canvas : Canvas = this.modeler.get('canvas');

    const root = canvas.getRootElement();

    if ( root['di']?.bpmnElement)
      return root['di']?.bpmnElement
    else
      return undefined
  }

  computeXML() : Promise<SaveXMLResult> {
    return this.modeler.saveXML({format: true})
  }

 setProcess(xml: string): Observable<ImportXMLResult> {
    return from(this.modeler.importXML(xml));
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

        this.currentElement = (di as any).bpmnElement;
      }
      else {
        let process : any  = this.getProcess()
        this.currentElement = process//this.getProcess()
      }

      this.selectionChanged.emit(this.currentElement)
    });

    this.modeler.on('element.changed', (e) => {
      console.log("element.changed")
    });

  }

   // implement OnChanges

  ngOnChanges(changes: SimpleChanges) {
    // re-import whenever the url changes
    if (changes['process']) {
      let process = changes['process'].currentValue

      this.setProcess(process);
    }
  }

   // implement OnDestroy

  ngOnDestroy(): void {
    this.modeler.destroy();
  }
}
