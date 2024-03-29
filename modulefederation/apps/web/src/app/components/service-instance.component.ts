/* eslint-disable @angular-eslint/use-lifecycle-interface */

import { Component, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ServiceInstanceDTO } from '../model/service-instance.interface';
import { ComponentsComponent } from './components.component';
import { RouteElement } from '../widgets/navigation-component.component';
import { ComponentStore } from './component-store';
import { AbstractFeature, Feature } from "@modulefederation/portal";


interface Channel {
    name : string,
    uri : string
}

@Component({
    selector: 'service-instance',
    templateUrl: './service-instance.component.html',
    styleUrls: ['./service-instance.component.scss']
})
@Feature({
    id: "instance",
    parent: "component",
    router: {
        path: ":instance"
    },
    label: "",
    categories: [],
    tags: [],
    permissions: []
})
export class ServiceInstanceComponent extends AbstractFeature {
    // instance data

    subscription : Subscription
    healthSubscription! : Subscription
    instanceSubscription! : Subscription
    instance : ServiceInstanceDTO = {
        //component: null,
        instanceId: "",
        serviceId: "",
        host: "",
        port: 1,
        isSecure: false,
        uri: "",
        scheme: "",
        metadata: {}
    }
    health  = "unknown"
    element : RouteElement = {
        label: "",
        route: ""
    }
    channels : Channel[] = []
    dead = false

    // constructor

    constructor(injector: Injector, private activatedRoute : ActivatedRoute, private componentStore : ComponentStore, private componentsComponent : ComponentsComponent) {
        super(injector)

        this.element.route = componentsComponent.topRouteElement().route + "/"

        this.componentsComponent.pushRouteElement(this.element)

        this.subscription = this.activatedRoute.params.subscribe({
            next: (params : any) => {
                this.setInstance(params['instance'])
            }
        });
    }

    // private

    setInstance(id : string) {
        this.instanceSubscription = this.componentStore.getInstances().subscribe({
            next: (instances : ServiceInstanceDTO[]) => {
                const instance = instances.find((instance) => instance.instanceId == id)

                if (instance) {
                    this.instance = instance

                    // set label

                    this.element.label = this.instance.serviceId

                    this.channels = this.parseChannnels(instance.metadata['channels'])

                    this.dead = false
                }
                else {
                    this.channels = []
                    this.dead = true
                }
            }
        })

        this.healthSubscription = this.componentStore.getHealths().subscribe({
            next: (value) => this.health = value[id]
        })
    }

    // implement OnInit

    override ngOnDestroy() {
        super.ngOnDestroy()
        
        if (this.element)
            this.componentsComponent.popRouteElement(this.element);

        this.subscription.unsubscribe();

        if (this.instanceSubscription != null)
            this.instanceSubscription.unsubscribe()

        if (this.healthSubscription != null)
            this.healthSubscription.unsubscribe()
    }

    // implement OnDestroy

    private parseChannnels = (addresses : string) : Channel[] => {
        const result = []

        if (addresses)
            for (const address of addresses.split(",")) {
                const lparen = address.indexOf("(")
                const rparen = address.indexOf(")")

                const channel = address.substring(0, lparen)
                const url = address.substring(lparen + 1, rparen)

                result.push({name: channel, uri: url})
            }

        return result
    }
}
