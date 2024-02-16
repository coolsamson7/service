import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { ShellModule } from './app/shell.module';

platformBrowserDynamic()
    .bootstrapModule(ShellModule)
    .catch((err) => console.error(err));
