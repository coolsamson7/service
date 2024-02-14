import { NavigationComponent } from "../widgets/navigation-component.component";
import { Channel, ComponentService } from "../service/component-service.service";
import { AfterViewInit, Component, ElementRef, HostListener, Injector, ViewChild } from '@angular/core';

import * as dagre from 'dagre';
import * as graphlib from 'graphlib';
import * as joint from 'jointjs';
import { combineLatest, Observable, of, switchMap } from "rxjs";
import { ServiceInstanceDTO } from "../model/service-instance.interface";
import { InterfaceDescriptor } from "../model/service.interface";
import { Feature } from "@modulefederation/portal";

interface Result {
    instances : { [component : string] : ServiceInstanceDTO[] }
    services : string[]
    componentServices : { [server : string] : InterfaceDescriptor[] }
    servers : string[]
    channels : { [server : string] : { [component : string] : Channel } }
    address2instance : { [address : string] : ServiceInstanceDTO[] }
    links : { [server : string] : Link[] }
}

interface Node {
    cell : joint.dia.Cell
    children : Node[]
}

interface Link {
    server : string,
    components : string[]
}

@Component({
    selector: 'nodes',
    template: `
    <div #wrapper>
      <div #graph></div>
    </div>`,
    providers: []
})
@Feature({
    id: "nodes",
    label: "Nodes",
    icon: "computer",
    visibility: ["public", "private"],
    categories: [],
    tags: ["navigation"],
    permissions: []
})
export class NodesComponent extends NavigationComponent implements AfterViewInit {
    // instance data

    @ViewChild('wrapper') wrapperElement! : ElementRef;
    @ViewChild('graph') graphElement! : ElementRef;

    paper : any;
    graph : any;
    namespace : any

    // constructor

    constructor(injector: Injector, private componentService : ComponentService) {
        super(injector)

        this.pushRouteElement({
            label: "Nodes",
            route: "/nodes"
        })
    }

    // private

    fetchData() : Observable<Result> {
        const result : Result = {
            instances: {},
            services: [],
            servers: [],
            channels: {},
            componentServices: {},
            address2instance: {},
            links: {}
        }


        const parse = (addresses : string) => {
            for (const address of addresses.split(",")) {
                const lparen = address.indexOf("(")
                const rparen = address.indexOf(")")

                const channel = address.substring(0, lparen)
                const url = address.substring(lparen + 1, rparen)
            }
        }

        const computeLinks = (result : Result) => {
            for (const server in result.channels) { // { [server: string] :  { [component: string] : string[]} }
                const channels = result.channels[server]

                if (Object.getOwnPropertyNames(channels).length > 0)
                    result.links[server] = []

                for (const component in channels) {
                    const name = channels[component].name
                    const uris = channels[component].uri

                    for (const uri of uris) {
                        const address = name + "(" + uri + ")"

                        const instances = result.address2instance[address]

                        for (const instance of instances) {
                            const addr = instance.host + ":" + instance.port

                            const link = result.links[server].find(link => link.server == addr)

                            if (!link)
                                result.links[server].push({
                                    server: addr,
                                    components: [instance.serviceId]
                                })
                            else {
                                if (!link.components.find(component => component == instance.serviceId))
                                    link.components.push(instance.serviceId)
                            }
                        }
                    }
                }
            }
        }

        const sortResults = (instancesArray : ServiceInstanceDTO[][], result : Result) => {
            const servers : { [name : string] : boolean } = {}

            for (const instances of instancesArray)
                for (const instance of instances) {
                    const server = serverName(instance)

                    if (!servers[server]) {
                        result.servers.push(server)
                        servers[server] = true
                        result.instances[server] = []
                    }

                    result.instances[server].push(instance)

                    for (const address of instance.metadata['channels'].split(",")) {
                        if (!result.address2instance[address])
                            result.address2instance[address] = []

                        result.address2instance[address].push(instance)
                    }
                }
        }

        const serverName = (serviceInstance : ServiceInstanceDTO) => {
            return serviceInstance.instanceId.substring(0, serviceInstance.instanceId.lastIndexOf(":"))
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
                    const i = server.lastIndexOf(':')
                    const host = server.substring(0, i)
                    const port = server.substring(i + 1)

                    return this.componentService.getOpenChannels({host: host, port: +port})
                }))
            }),
            switchMap(channels => {
                for (let i = 0; i < result.servers.length; i++)
                    result.channels[result.servers[i]] = channels[i]

                computeLinks(result)

                return combineLatest(result.services.map(service => this.componentService.getServices(service)))
            }),
            switchMap(services => {
                for (let i = 0; i < result.services.length; i++) {
                    result.componentServices[result.services[i]] = services[i]
                }

                return of(result)
            })
        )
    }

    // host listener

    @HostListener('window:resize', ['$event'])
    onResize(event : any) {
        if (this.paper && this.graph)
            this.paper.setDimensions(event.target.innerWidth, event.target.innerHeight);
    }

    // implement OnInit

    override ngOnInit() {
        super.ngOnInit()

        this.namespace = joint.shapes;
        this.graph = new joint.dia.Graph({}, {cellNamespace: this.namespace});
    }

    // implement AfterViewInit

    override ngAfterViewInit() {
        super.ngAfterViewInit()

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

    private buildGraph(graph : any, result : Result) {
        // new

        const merge = (obj1 : any, obj2 : any) => {
            if (obj1 == undefined) {
                return obj2
            }
            else if (obj2 == undefined) {
                return obj1
            }
            else if (typeof obj1 !== 'object' || typeof obj2 !== 'object')
                throw new TypeError('Both arguments must be objects');

            const merged = {...obj1};

            for (const key in obj2) {
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

        const connect = (a : any, b : any, labels : string[], attributes? : any) => {
            const link = new joint.shapes.standard.Link();
            if (attributes)
                link.attr(attributes)

            let i = 0
            const labelParam = labels.map(label => {
                return {
                    position: {
                        offset: {
                            x: 0,
                            y: 20 * i++
                        }
                    },
                    attrs: {
                        text: {
                            text: afterLastDot(label)
                        }
                    }
                }
            })

            link
                .source(a)
                .target(b)
                .labels(labelParam)
                .connector('jumpover', {size: 10})
                .addTo(graph)

            return link
        }

        const makeNode = (name : string, attributes? : any) => {
            const node = new joint.shapes.basic.Rect(merge({
                size: {
                    width: 300,
                    height: 35
                },
                attrs: {
                    text: {
                        text: name
                    }
                }
            }, attributes || {}));

            node.addTo(graph)

            return node
        }

        const makeText = (name : string, attributes? : any) => {
            const node = new joint.shapes.basic.Rect(merge({
                size: {
                    width: 300,
                    height: 25
                },
                attrs: {
                    rect: {
                        opacity: 0,
                        fillOpacity: 0,
                    },
                    text: {
                        fill: 'black',
                        text: name
                    }
                }
            }, attributes || {}));

            node.addTo(graph)

            return node
        }

        const makeRegion = (name : string, attributes? : any) => {
            const node = new joint.shapes.standard.HeaderedRectangle(merge({
                size: {
                    width: 300
                },
                attrs: {
                    body: {
                        fill: 'grey'
                    },
                    header: {
                        cursor: 'pointer'
                    },
                    headerText: {
                        cursor: 'pointer',
                        text: name,
                        fill: 'black'
                    }
                }
            }, attributes || {}));

            node.addTo(graph)

            // dunno how to add padding to the first element the right way... :-(

            node.embed(makeText("", {
                attrs: {
                    rect: {
                        opacity: 0,
                        fillOpacity: 0,
                        strokeWidth: 0
                    }
                }
            }))

            return node
        }

        // collect servers & components

        const servers : { [name : string] : any } = {}

        for (const server of result.servers) {
            servers[server] = {
                server: makeRegion(server, {
                    attrs: {
                        header: {
                            fill: '#3f51b5'
                        },
                        headerText: {
                            fill: 'white'
                        },
                        body: {
                            fill: 'lightBlue'
                        }
                    }
                }),
                components: {}
            }
        }

        // create a hioerarchical structure that references a cell hierarchy
        // we will use this structure to restore parent-child relationships afterwards

        const fetchStructure = (component : joint.dia.Cell) : Node => {
            const result = {
                cell: component,
                children: []
            }

            for (const child of component.getEmbeddedCells()) { // @ts-ignore
                result.children.push(fetchStructure(child))
            }

            return result
        }

        // restore the saved embedding information

        const embed = (node : Node, parent : joint.dia.Cell) => {
            for (const child of node.children) {

                // recursion

                embed(child, node.cell)
            }

            parent.embed(node.cell)
        }

        // collect all cells of a hierarchical struture

        const collectCells = (node : Node, result : joint.dia.Cell[]) => {
            // local function

            const collect = (node : Node) => {
                result.push(node.cell)
                for (const child of node.children)
                    collect(child)
            }

            collect(node)
        }

        // assign components

        const afterLastDot = (str : string) : string => {
            const i = str.lastIndexOf('.')
            if (i >= 0)
                return str.substring(i + 1)
            else
                return str
        }

        const addComponents = () => {
            for (const serverName of result.servers) {
                const server = servers[serverName]
                const serverRegion = server.server

                const parent = serverRegion


                for (const serviceInstance of result.instances[serverName]) {
                    // create component

                    if (!server.components[serviceInstance.serviceId]) {
                        const component = makeRegion(afterLastDot(serviceInstance.serviceId), {
                            attrs: {
                                header: {
                                    fill: '#3f51b5'
                                },
                                headerText: {
                                    fill: 'white'
                                },
                                body: {
                                    fill: 'white'
                                }
                            }
                        })

                        server.components[serviceInstance.serviceId] = component

                        parent.embed(component)

                        // services

                        for (const service of result.componentServices[serviceInstance.serviceId]) {
                            component.embed(makeText(afterLastDot(service.name)))
                        }
                    } // if
                } // for
            }
        }

        // assign components, do initial layout

        addComponents()

        this.layout(true)

        for (const server in servers) {
            const serverRegion = servers[server].server

            serverRegion.fitToChildren({deep: true, padding: {top: 10, left: 10, right: 10, bottom: 10}})
        }

        // we need to delet and save all embedded elements since the layout algorithm would break otherwise
        // oh boy!

        const save : { [name : string] : Node[] } = {}

        for (const server in servers) {
            const serverRegion = servers[server].server

            const children = fetchStructure(serverRegion).children

            save[server] = children

            // and delete from graph

            for (const child of children)
                child.cell.remove()
        }

        // add links

        for (const server in result.links) {
            for (const link of result.links[server]) {
                const target = link.server // link.components

                if (server != target)
                    connect(servers[server].server, servers[target].server, link.components, {
                        line: {
                            stroke: 'black',
                            strokeDasharray: '4 2',
                        }
                    })
            }
        }

        // layout

        this.layout(true)

        // and restore saved elements

        for (const server in servers) {
            const serverRegion = servers[server].server

            const children = save[server]

            // extract cells

            const cells : joint.dia.Cell[] = []
            for (const c of children)
                collectCells(c, cells)

            if (cells.length > 0) {
                const dx = serverRegion.getBBox().x - cells[0].getBBox().x;
                const dy = serverRegion.getBBox().y - cells[0].getBBox().y;

                // add to graph & translate

                for (const cell of cells) {
                    cell.addTo(this.graph)
                    // @ts-ignore TODO??
                    cell.translate(dx + 20, dy + 10) // the padding
                }

                // embed

                for (const child of children)
                    embed(child, serverRegion)
            }
        }
    }

    private layout(layoutEdges : boolean) {
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
            nodeSep: 5,
            edgeSep: 10,
            rankSep: 100,
            marginX: 10,
            marginY: 10,
            rankDir: 'RL',
            //ranker:  'longest-path',//'tight-tree', //| 'longest-path';'network-simplex',// |
            setLabels: layoutEdges
        });
    }
}
