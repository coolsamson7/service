
import { NavigationComponent } from "../widgets/navigation-component.component";
import { Channel, ComponentService } from "../service/component-service.service";
import { Component, ViewChild, ElementRef, HostListener, AfterViewInit} from '@angular/core';

import dagre from 'dagre';
import graphlib from 'graphlib';
import * as joint from 'jointjs';
import { switchMap, combineLatest, Observable, of } from "rxjs";
import { ServiceInstanceDTO } from "../model/service-instance.interface";
import { InterfaceDescriptor } from "../model/service.interface";

interface Result {
    instances: { [component: string] : ServiceInstanceDTO[] }
    services: String[]
    componentServices:  { [server: string] : InterfaceDescriptor[] } 
    servers: string[]
    channels:  { [server: string] :  { [component: string] : Channel} }
    address2instance: { [address: string] : ServiceInstanceDTO[] }
    links:  { [server: string] :  Link[] }
}

interface Node {
    cell: joint.dia.Cell
    children: Node[]
}

interface Link {
    server: string,
    components: string[]
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
            address2instance: {},
            links: {}
        } 

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
        
        let parse = (addresses) => {
            for (let address of addresses.split(",")) {
                let lparen = address.indexOf("(")
                let rparen = address.indexOf(")")

                let channel = address.substring(0, lparen)
                let url = address.substring(lparen + 1, rparen)
            }
        }

        let computeLinks = (result: Result) => {
            for ( let server in result.channels) { // { [server: string] :  { [component: string] : string[]} }
                let channels = result.channels[server]

                if ( Object.getOwnPropertyNames(channels).length > 0)
                   result.links[server] = []

                for ( let component in channels) {
                    let name = channels[component].name
                    let uris = channels[component].uri

                    for ( let uri of uris ) {
                        let address = name + "(" + uri + ")"

                        let instances = result.address2instance[address]

                        for ( let instance of instances) {
                            let addr = instance.host + ":" + instance.port
                        
                            let link = result.links[server].find( link => link.server == addr)

                            if (!link)
                                result.links[server].push({
                                    server: addr,
                                    components: [instance.serviceId]
                                })
                            else {
                                if (! link.components.find(component => component == instance.serviceId))
                                    link.components.push(instance.serviceId)
                            }
                        }
                    }
                }
            }
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

                    for ( let address of instance.metadata['channels'].split(",")) {
                        if (!result.address2instance[address])
                           result.address2instance[address] = []

                        result.address2instance[address].push(instance)
                    }
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

                computeLinks(result)

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
                this.layout(false);
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

    let connect = (a, b, labels: string[], attributes?: any) => {
        var link = new joint.shapes.standard.Link();
        if ( attributes )
           link.attr(attributes)

        let i = 0
        let labelParam = labels.map(label => {
            return {
                position: {
                     offset: {
                            x: 0,
                            y: 20 * i++
                        }
                },
                attrs: {
                    text: {
                        text: label
                    }
                }
            }
        })

        link.source(a);
        link.target(b);
        link.labels(labelParam)
        link.connector('jumpover', { size: 10 });
           
        link.addTo(graph);

        return link
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

        // dunno how to add padding to the first element the right way... :-(
    
        node.embed(makeText("", {
            attrs: {
                body: {
                    fillOpacity:0.0,
                    strokeWidth: 0
            }
        }}))

        return node
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

    let saveChildren = (component: joint.dia.Cell) : Node => {
        let result = {
            cell: component,
            children: []
        }
        //console.log(" ".repeat(level) + component.id + " at (" + component.position().x+ ", " +  component.position().y + ")")

        for ( let child of component.getEmbeddedCells()) {    

            // recursion

            result.children.push(saveChildren(child))
        }

        //component.remove()

        return result
    }

    let embed = (node: Node, parent: joint.dia.Cell) => {
        for ( let child of node.children) {    

            // recursion

            embed(child, node.cell)
        }

        parent.embed(node.cell)
    }

    let embedChildren = (node: Node, parent: joint.dia.Cell) => {
       
        for ( let child of node.children) {    

            // recursion

            embed(child, parent)
        }
    }

    let cells = (node: Node, result: joint.dia.Cell[]) => {

        let collect = (node: Node) => {
            result.push(node.cell)
            for ( let child of node.children)  
                collect(child)
        }

        collect(node)
    }

    let childCells = (node: Node) :  joint.dia.Cell[]  => {
        let result = []

        for ( let child of node.children)
           cells(child, result)

        return result
    }

    let traverse = (component: joint.dia.Cell, level : number = 0) => {
        console.log(" ".repeat(level) + component.id + " at (" + component.position().x+ ", " +  component.position().y + ")")

        for ( let child of component.getEmbeddedCells()) {    

            // recursion

            traverse(child, level + 1)
        }

    }
    // assign components

    let addComponents = (readd: boolean) => {
        for ( let serverName of result.servers) {
            let server = servers[serverName]
            let serverRegion = server.server

            let parent = serverRegion
            if ( readd ) {
                parent = makeRegion(serverName)//serverRegion.clone() //
                //parent.addTo(this.graph)
            }

            let children = []

            for ( let serviceInstance of result.instances[serverName]) {
                // create component

                if (!server.components[serviceInstance.serviceId]) {
                    let component = makeRegion(serviceInstance.serviceId)

                    children.push(component)

                    server.components[serviceInstance.serviceId] = component

                    parent.embed(component)

                    // services

                    for ( let service of result.componentServices[serviceInstance.serviceId]) {
                        component.embed(makeText(service.name as string))
                    }
                } // if
            } // for

            //if ( readd ) {}
            this.layoutCells([parent])

            if ( readd ) {
                traverse(parent, 0)

                console.log("LAYOUT")

                this.layoutCells(parent.getEmbeddedCells())

                traverse(parent, 0)

                console.log("FIT")

                parent.fitToChildren({deep: true, padding: { top: 10, left: 10, right: 10, bottom: 10 }})

                traverse(parent, 0)

                let children =  parent.getEmbeddedCells();

                var dx = serverRegion.getBBox().x - parent.getBBox().x;
                var dy = serverRegion.getBBox().y - parent.getBBox().y;
        
                //for ( let child of children)
                parent.resize(serverRegion.getBBox().width, serverRegion.getBBox().height)
                parent.translate(dx, dy)

                parent.unembed(children)
               

                
                serverRegion.embed(children)
                //this.layoutCells([serverRegion])
                //serverRegion.fitEmbeds({deep: true, padding: { top: 10, left: 10, right: 10, bottom: 10 }})


                 parent.remove()
            }
            else serverRegion.fitToChildren({deep: true, padding: { top: 10, left: 10, right: 10, bottom: 10 }})
        }
    }

    // assign components, do initial layout

    addComponents(false)

    this.layout(true)

    for ( let server in servers) {
        let serverRegion = servers[server].server

        serverRegion.fitToChildren({deep: true, padding: { top: 10, left: 10, right: 10, bottom: 10 }})
        //serverRegion.resize(serverRegion.getBBox().width, serverRegion.getBBox().height)

        console.log(server + ", w: " + serverRegion.getBBox().width + ", h: " + serverRegion.getBBox().height)

        // clear components, so we can readd...
        servers[server].components = {}
    }

    // unlink

    let save = {}

    for ( let server in servers) {
        let serverRegion = servers[server].server
    
        let children =  saveChildren(serverRegion).children//serverRegion.getEmbeddedCells({deep: false});

        save[server] = children
        //console.log("server " + server + " has " + children.length + " children")
        serverRegion.unembed(serverRegion.getEmbeddedCells({deep: false}))

        // and delete from graph//

        for ( let child of children )
           child.cell.remove()      
    }

    // add links

    for ( let server in result.links) {
        for ( let link of result.links[server]) {
           let target = link.server // link.components

           if ( server != target)
            connect(servers[server].server, servers[target].server,  link.components, {
                    line: {
                        stroke: 'orange'
                    }
                })
        }
    }

    // layout

    this.layout(true)

    // add components again...

    //addComponents(true)

    if ( true )
    for ( let server in servers) {
        let serverRegion = servers[server].server

        let children = save[server]

        let _cells = []
        for ( let c of children)
           cells(c, _cells)

        for ( let child of _cells)
           child.addTo(this.graph)

        //this.layoutCells(cells)

        var dx = serverRegion.getBBox().x - _cells[0].getBBox().x;
        var dy = serverRegion.getBBox().y - _cells[0].getBBox().y;

        for ( let child of _cells) 
            child.translate(dx + 20, dy + 10) // the padding

        for ( let child of children) 
            embed(child, serverRegion)

     
        //serverRegion.fitToChildren({deep: true, padding: { top: 10 , left: 10, right: 10, bottom: 10}})
    }
  }

  private layout(layoutEdges: boolean) {
    // auto layout

    /*let layout = new joint.layout.ForceDirected({
        graph: this.graph,
        width: 600, height: 400,
        gravityCenter: { x: 300, y: 200 },
        charge: 180,
        linkDistance: 30
    });
    
    layout.start();*/

    joint.layout.DirectedGraph.layout(this.graph, {
        dagre: dagre,
        graphlib: graphlib,
        setLinkVertices: layoutEdges,
        /*clusterPadding: {
            top: 30,
            left: 10,
            right: 10,
            bottom: 10
        },*/
        nodeSep: 10,
        edgeSep: 10,
        rankSep: 100,
        marginX: 20,
        marginY: 20,
        rankDir: 'RL',
        ranker:  'longest-path',//'tight-tree', //| 'longest-path';'network-simplex',// | 
        setLabels: layoutEdges
    });
  }

  private layoutCells(cells) {
    // auto layout

    /*let layout = new joint.layout.ForceDirected({
        graph: this.graph,
        width: 600, height: 400,
        gravityCenter: { x: 300, y: 200 },
        charge: 180,
        linkDistance: 30
    });
    
    layout.start();*/

    joint.layout.DirectedGraph.layout(cells, {
        dagre: dagre,
        graphlib: graphlib,
        //setLinkVertices: true,
        /*clusterPadding: {
            top: 30,
            left: 10,
            right: 10,
            bottom: 10
        },*/
        nodeSep: 10,
        edgeSep: 10,
        rankSep: 100,
        marginX: 20,
        marginY: 20,
        rankDir: 'RL',
        //ranker:  'longest-path',//'tight-tree', //| 'longest-path';'network-simplex',// | 
        //setLabels: true
    });
  }
}