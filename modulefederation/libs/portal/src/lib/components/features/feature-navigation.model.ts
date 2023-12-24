export interface NavigationItem {
    routeLink : string;
    icon? : string;
    label : string;
    expanded? : boolean;
    items? : NavigationItem[];
    visible? : boolean
}
