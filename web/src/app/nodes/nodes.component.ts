
import { NavigationComponent } from "../widgets/navigation-component.component";
import { ComponentService } from "../service/component-service.service";
import { Component, ViewChild, ElementRef, HostListener, AfterViewInit} from '@angular/core';

import dagre from 'dagre';
import graphlib from 'graphlib';
import * as joint from 'jointjs';
import { switchMap, combineLatest, Observable, of } from "rxjs";
import { ServiceInstanceDTO } from "../model/service-instance.interface";
import { ChannelAddressDTO } from "../model/channel-address.interface";
import { InterfaceDescriptor } from "../model/service.interface";

interface Result {
    instances: { [component: string] : ServiceInstanceDTO[] }
    services: String[]
    componentServices:  { [server: string] : InterfaceDescriptor[] } 
    servers: string[]
    channels:  { [server: string] :  { [component: string] : string[]} }
    address2instances?: { [address: string] : ServiceInstanceDTO[] } // TODO
}


@Component({
    selector: 'nodes',
    //templateUrl: './nodes.component.html',
    //styleUrls: ['./nodes.component.scss'],
    template: `<div #wrapper><div #graph></div></div>`,
    providers: []
  })
  export class NodesComponent extends NavigationComponent implements AfterViewInit{
    // instance data

    nodes: String[] = []
    selected: string

    // NEW

    @ViewChild('wrapper') wrapperElement: ElementRef;
    @ViewChild('graph') graphElement: ElementRef;
    paper: any;
    graph: any;
    timer: any = null;


// NEW

    // constructor

    constructor(private componentService: ComponentService) {
        super()
    
        this.pushRouteElement({
            label: "Nodes",
            route: "/nodes"
        })
    }

    fetchData() : Observable<Result> {
        let result : Result = {
            instances: {},
            services: [],
            servers:[],
            channels: {},
            componentServices: {},
            address2instances: {}
        } 

        let sortResults = (instancesArray : ServiceInstanceDTO[][], result: Result) => {
            let servers = {}

            for ( let instances of instancesArray) 
                for ( let instance of instances) {
                    let server = serverName(instance)
                    if ( !servers[server]) {
                        result.servers.push(server)
                        servers[server] = true
                        result.instances[server] = []
                    }

                    result.instances[server].push(instance)
                }
        }

        let serverName = (serviceInstance: ServiceInstanceDTO) => {
            return  serviceInstance.instanceId.substring(0, serviceInstance.instanceId.lastIndexOf(":"))
        }

        return this.componentService.listAll().pipe(
            switchMap(services => {
                result.services = services
                return combineLatest(services.map((service) => {
                    return this.componentService.getServiceInstances(service)
                }
               ))
              }),
            switchMap(instancesArray => {
                sortResults(instancesArray, result)
                
                return combineLatest(result.servers.map(server => {
                    let i = server.lastIndexOf(':')
                    let host = server.substring(0, i)
                    let port = server.substring(i+1)

                    return this.componentService.getOpenChannels({host: host, port: +port})
                }))
            }),
            switchMap(channels => {
                for ( let i = 0; i < result.servers.length; i++)
                   result.channels[result.servers[i]] = channels[i]

                return combineLatest(result.services.map(service => this.componentService.getServices(service)))
            }),
            switchMap(services => {
                for ( let i = 0; i < result.services.length; i++) {
                    result.componentServices[result.services[i] as string] = services[i]
                }

                return of(result)
            })
            )
    }

   // host listener

   @HostListener('window:resize', ['$event'])
   onResize(event) {
      if (this.paper && this.graph) {
        this.paper.setDimensions(event.target.innerWidth, event.target.innerHeight);
        if (!this.timer) {
            this.timer = setTimeout(() => {
                this.doLayout();
                this.timer = null;
            }, 500);
        }
     }
   }

   namespace

   // implement OnInit

   ngOnInit() {
        this.namespace =  joint.shapes;
        this. graph = new joint.dia.Graph({}, { cellNamespace: this.namespace });

        // TEST

        let str = "rest(http://localhost:8080),dispatch(http://localhost:8080)"
        for (let address of str.split(",")) {
            let lparen = address.indexOf("(")
            let rparen = address.indexOf(")")

            let m = address.substring(lparen + 1, rparen)

            let url = new URL(m)

            url.host
            url.port
            url.protocol
        }
   }

   // implement AfterViewInit

   ngAfterViewInit() {
      // create paper

      this.paper = new joint.dia.Paper({
        el: this.graphElement.nativeElement,
        model: this.graph,
        gridSize: 1,
        'async': true,
        interactive: true,
        cellViewNamespace: this.namespace,
        defaultConnectionPoint: {
          name: 'boundary',
          args: {
              sticky: true
          }
        }
    } as any);

    this.fetchData().subscribe((result) => {
        this.buildGraph(this.graph, result)

         // resize paper

         this.paper.setDimensions(
            this.wrapperElement.nativeElement.offsetWidth, 
            this.wrapperElement.nativeElement.offsetHeight
            )
  
         // layout
      
         this.doLayout();
    })
  }

  // private

  private buildGraph(graph, result: Result) {
    // new

    let merge = (obj1, obj2) => {
        if ( obj1 == undefined) {
          return obj2   
        }
        else if ( obj2 == undefined) {
            return obj1   
        }
        else if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
           throw new TypeError('Both arguments must be objects');


        const merged = { ...obj1 };

        for (let key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key]))
                    merged[key] = merge(merged[key], obj2[key]);
                
                else
                    merged[key] = obj2[key];
            
            }
        }
                
        return merged;
    }

    // local functions

    let connect = (a, b, attributes?: any) => {
        let vertex = new joint.shapes.fsa.Arrow(merge({
            source: { id: a.id },
            target: { id: b.id }
        }, attributes || {}));

        vertex.addTo(graph)

        return vertex
    }

    let makeNode = (name: string, attributes?: any) => {
        let node = new joint.shapes.basic.Rect(merge({
            size: {
                width: 300,
                height: 35
            },
            attrs: {
                text: {
                    text: name
                }
            }
        }, attributes || {}));

        node.addTo(graph)

        return node
    }

    let makeText = (name: string, attributes?: any) => {
        let node = new joint.shapes.standard.Rectangle(merge({   
            size: {
                width: 300,
                height: 25
            },
            attrs: {
                text: {
                    fill: 'white',
                    text: name
                }
            }
        }, attributes || {}));

        node.addTo(graph)

        return node
    }

    let makeRegion = (name: string, attributes?: any) => {
        let node = new joint.shapes.standard.HeaderedRectangle(merge({
            size: {
                width: 300,
                height: 200
            },
            attrs: {
                body: {
                    fill: 'grey'
                },
                headerText: {
                    text: name,
                    fill: 'black'
                }
            }
        }, attributes || {}));

        node.addTo(graph)

        return node.embed(makeText("", {
            attrs: {
                body: {
                    fillOpacity:0.0,
                    strokeWidth: 0
            }
        }}))
    }

    // collect servers & components

    let serverName = (instanceId: string) => {
        return  instanceId.substring(0, instanceId.lastIndexOf(":"))
    }

    let servers = {}

    for ( let server of result.servers) {
        servers[server] = {
            server: makeRegion(server, { 
                attrs: {
                    body: {
                        fill:  'red'
                }}}),
            components: {}
        }
    }

    // assign components

    for ( let serverName of result.servers) {
        for ( let serviceInstance of result.instances[serverName]) {
            let server = servers[serverName]

            // create component

            if (!server.components[serviceInstance.serviceId]) {
                let component = makeRegion(serviceInstance.serviceId)

                server.components[serviceInstance.serviceId] = component

                server.server.embed(component)

                // services

                for ( let service of result.componentServices[serviceInstance.serviceId]) {
                    component.embed(makeText(service.name as string))
                }
            }
        }
    }

    // open channels

    // fit

    let lastServerRegion = null

    for ( let server in servers) {
        let serverRegion = servers[server].server

        //if ( lastServerRegion )
        //   connect(lastServerRegion, serverRegion)

       serverRegion.fitToChildren({deep: true, padding: { top: 10}})

       lastServerRegion = serverRegion
    }
  }

  private doLayout() {
    // auto layout

    joint.layout.DirectedGraph.layout(this.graph, {
        dagre: dagre,
        graphlib: graphlib,
        setLinkVertices: false,
        nodeSep: 10,
        edgeSep: 10,
        rankSep: 100,
        marginX: 20,
        marginY: 20,
        rankDir: 'RL'
    });
  }
}