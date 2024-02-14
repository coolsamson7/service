import { inject } from "@angular/core";
import { AbstractFeature } from "../feature";
import { registerMixins } from "../mixin/mixin";
import { GConstructor } from "../common/lang/constructor.type";
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from "@angular/router";
import { FeatureConfig } from "../feature-config";
import { FeatureData } from "../portal-manager";


export interface Routing {
    router: Router
    activatedRoute: ActivatedRoute
    featureStack: FeatureData[]
    navigationIsLoading : boolean

    // methods

    getCurrentFeature() : FeatureData

    // more...

}

export function WithRouting<T extends GConstructor<AbstractFeature>>(base: T) :GConstructor<Routing> &  T  {
    return registerMixins(class WithRoutingClass extends base implements Routing {
        // instance data

        router: Router
        activatedRoute : ActivatedRoute
        featureStack: FeatureData[] = []
        navigationIsLoading = false

        // constructor

        constructor(...args: any[]) {
            super(...args);

            this.router = inject(Router)
            this.activatedRoute = inject(ActivatedRoute)

            this.trackRoutes()
        }

        // private

        private trackRoutes() {
            // local functions
      
            const collectFeatures = (route: ActivatedRoute, featureStack: FeatureConfig[] = []) => {
              route.data.subscribe((data: any) => {
                if (data.feature) // hmmmm
                    featureStack.push(data.feature as FeatureData)
              })
      
              // recursion
      
              for ( const child of route.children)
                collectFeatures(child, featureStack)
            }
      
            // subscribe to events
      
            this.router.events.subscribe(event => {
              switch (true) {
                case event instanceof NavigationStart: {
                  this.navigationIsLoading = true;
                  break;
                }
      
                case event instanceof NavigationEnd:
                  collectFeatures(this.activatedRoute, this.featureStack = [])
                  this.navigationIsLoading = false;
                  break;
      
                case event instanceof NavigationCancel:
                case event instanceof NavigationError: {
                  this.navigationIsLoading = false;
                  break;
                }
                default: {
                  break;
                }
              }
            });
          }


        // implement Routing

        getCurrentFeature() : FeatureData {
            return this.featureStack[0]
        }
    }, WithRouting)
  }
