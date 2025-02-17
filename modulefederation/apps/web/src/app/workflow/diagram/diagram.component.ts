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
import { map, switchMap } from 'rxjs/operators';

import type Canvas from 'diagram-js/lib/core/Canvas';
import type { ImportDoneEvent, ImportXMLResult, SaveXMLResult } from 'bpmn-js/lib/BaseViewer';


import BpmnJS from 'bpmn-js/lib/Modeler';

import { from, Observable, Subscription } from 'rxjs';
import { Shape } from 'bpmn-js/lib/model/Types';
//import Modeling from 'bpmn-js/lib/features/modeling/Modeling';


import { BaseElement } from 'bpmn-moddle'
import  { Element  } from "moddle"
//import { DiagramModule } from './diagram.module';
import { BPMNAdministrationService } from '../service/administration-service';
import { DiagramConfiguration, DiagramConfigurationToken } from './diagram.configuration';

@Component({
  selector: 'diagram',
  templateUrl: "./diagram.component.html",
  styleUrl: "./diagram.component.scss",
})
export class DiagramComponent implements AfterContentInit, OnChanges, OnDestroy, OnInit {
  // input & output

  @Input() url?: string;
  @Output() importDone: EventEmitter<ImportDoneEvent> = new EventEmitter();

  // instance data

  @ViewChild('ref', { static: true }) private el!: ElementRef;

  bpmnJS: BpmnJS

  currentElement : Element | undefined = undefined

  // constructor

  constructor(private http: HttpClient, private administrationService: BPMNAdministrationService, @Inject(DiagramConfigurationToken) configuration: DiagramConfiguration) {
    this.bpmnJS = new BpmnJS({
      moddleExtensions: configuration.extensions
    });
  
    
    // test


    administrationService.getProcessDefinitions().subscribe(descriptors => {
      let descriptor = descriptors[0]

      administrationService.readProcessDefinition(descriptor).subscribe(xml => {
        console.log(xml)
      })
    })

    //
    this.bpmnJS.on<ImportDoneEvent>('import.done', ({ error }) => {
      if (!error) {
        this.bpmnJS.get<Canvas>('canvas').zoom('fit-viewport');
      }


    });
  }

  // private

  private getProcess() {
    const canvas : Canvas = this.bpmnJS.get('canvas');

    const root = canvas.getRootElement();

    if ( root['di']?.bpmnElement)
      return root['di']?.bpmnElement
    else
      return undefined
  }

   /**
   * Load diagram from URL and emit completion event
   */
   loadUrl(url: string): Subscription {

    return (
      this.http.get(url, { responseType: 'text' }).pipe(
        switchMap((xml: string) => this.importDiagram(xml)),
        map(result => result.warnings),
      ).subscribe(
        (warnings) => {
          this.importDone.emit({
            warnings
          });
        },
        (err) => {
          this.importDone.emit({
            error: err,
            warnings: []
          });
        }
      )
    );
  }

  computeXML() : Promise<SaveXMLResult> {
    return this.bpmnJS.saveXML({format: true})
  }

  /**
   * Creates a Promise to import the given XML into the current
   * BpmnJS instance, then returns it as an Observable.
   *
   * @see https://github.com/bpmn-io/bpmn-js-callbacks-to-promises#importxml
   */
 importDiagram(xml: string): Observable<ImportXMLResult> {
    return from(this.bpmnJS.importXML(xml));
  }

  // implement AfterContentInit

  ngAfterContentInit(): void {
    this.bpmnJS.attachTo(this.el.nativeElement);
  }

   // implement OnInit

  ngOnInit(): void {
    if (this.url) {
      this.loadUrl(this.url);
    }

    // add listeners

    this.bpmnJS.on('selection.changed', (ev) => {
      console.log("selection.changed")

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

      // TEST

      this.bpmnJS.saveXML({format: true}).then((result => console.log(result.xml)))
    });

    this.bpmnJS.on('element.changed', (e) => {
      console.log("element.changed")
    });

  }

   // implement OnChanges

  ngOnChanges(changes: SimpleChanges) {
    // re-import whenever the url changes
    if (changes['url']) {
      this.loadUrl(changes['url'].currentValue);
    }
  }

   // implement OnDestroy

  ngOnDestroy(): void {
    this.bpmnJS.destroy();
  }
}
