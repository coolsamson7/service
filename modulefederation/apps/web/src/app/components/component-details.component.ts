/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/use-lifecycle-interface */



import { Component, Injector } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ComponentDTO } from '../model/component.interface';
import { ComponentsComponent } from './components.component';
import { RouteElement } from '../widgets/navigation-component.component';
import { Update, UpdateService } from '../service/update-service.service';
import { ComponentStore } from './component-store';
import { Subscription } from 'rxjs';
import { AbstractFeature, Feature } from "@modulefederation/portal";


@Component({
    selector: 'component-details',
    templateUrl: './component-details.component.html',
    styleUrls: ['./component-details.component.scss'],
    providers: [ComponentStore]
})
@Feature({
    id: "component",
    parent: "components",
    router: {
        path: ":component"
    },
    label: "",
    categories: [],
    tags: [],
    permissions: []
})
export class ComponentDetailsComponent extends AbstractFeature {
    // instance data

    component : ComponentDTO = {
        name: "",
        label: "",
        description: "",
        model: {
            //component: null,
            services: [],
            models: []
        },
        channels: []
    }
    subscription! : Subscription
    element : RouteElement = {
        label: "",
        route: "/components/"
    }
    open! : boolean[]
    dead = false

    updateSubscription : Subscription

    // constructor

    constructor(injector: Injector, private activatedRoute : ActivatedRoute, private componentStore : ComponentStore, private componentsComponent : ComponentsComponent, updateService : UpdateService) {
        super(injector)

        componentsComponent.pushRouteElement(this.element)

        this.updateSubscription = updateService.getUpdates().subscribe({
            next: update => {
                this.update(update)
            }
        });
    }

    // public

    toggle(i : number) {
        this.open[i] = !this.open[i]
    }

    // private

    override ngOnInit() {
        super.ngOnInit()

        this.subscription = this.activatedRoute.params.subscribe(params => {
            this.setComponent(params["component"])
        })
    }

    // network

    override ngOnDestroy() {
        super.ngOnDestroy()
        
        if (this.element)
            this.componentsComponent.popRouteElement(this.element);

        this.subscription.unsubscribe();
        this.updateSubscription.unsubscribe();

        this.componentStore.destroy()
    }

    // implement OnInit

    private update(update : Update) {
        this.componentStore.update(update)

        if (this.dead) {
            if (update.addedServices.find(service => service == this.component.name) != null)
                this.dead = false
        }
        else {
            if (update.deletedServices.find(service => service == this.component.name) != null)
                this.dead = true
        }
    }

    // implement OnDestroy

    private setComponent(componentName : string) {
        this.componentStore.setup(componentName);

        // this is a stream also called after upates!

        this.componentStore.getComponent().subscribe({
            next: (value : ComponentDTO | null) => {
                if (value != null) {
                    this.component = value
                    this.dead = false

                    this.open = Array<boolean>(1 + value.model.services.length + value.model.models.length).fill(false)

                    if (this.element.label.length == 0) {
                        this.element.label = componentName
                        this.element.route += componentName
                    }
                } // if
                else {
                    this.dead = true
                }
            }
        })
    }
}
