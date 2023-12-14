import {Route} from '@angular/router';

export const appRoutes : Route[] = [
    {
        path: '',
        loadChildren: () =>
            import('./remote-entry/remote-entry.module').then((m) => m.RemoteEntryModule),
    },
];
