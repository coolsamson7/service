import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy, UrlSegment} from '@angular/router';

/**
 * This is a special {@link RouteReuseStrategy} that will base the decision of the feature meta-data as defined in the property "router.reuse"
 */
export class FeatureReuseStrategy implements RouteReuseStrategy {
  // instance data

  private storedHandles: { [key: string]: DetachedRouteHandle } = {};

  // private

  private createIdentifier(route: ActivatedRouteSnapshot) {
    // Build the complete path from the root to the input route

    const segments: UrlSegment[][] = route.pathFromRoot.map((r) => r.url);
    const subpaths = ([] as UrlSegment[]).concat(...segments).map((segment) => segment.path);

    // Result: ${route_depth}-${path}

    return `${segments.length}-${subpaths.join('/')}`;
  }

  // implement RouteReuseStrategy

  /**
   * @inheritDoc
   */
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  /**
   * @inheritDoc
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const id = this.createIdentifier(route);
    const handle = this.storedHandles[id];

    return route.routeConfig != null && !!handle;
  }

  /**
   * @inheritDoc
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data['feature']?.router?.reuse || false;
  }

  /**
   * @inheritDoc
   */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    const id = this.createIdentifier(route);

    if (route.data['feature']?.router?.reuse)
      this.storedHandles[id] = handle;
  }

  /**
   * @inheritDoc
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const id = this.createIdentifier(route);

    if (!route.routeConfig || !this.storedHandles[id])
      return null;
    else
      return this.storedHandles[id];
  }
}
