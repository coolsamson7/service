import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './components/home/home.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

@NgModule({
    declarations: [
        HomeComponent,
    ],
    imports: [
        CommonModule,
        FlexLayoutModule,
        MatIconModule,
        MatTabsModule,
        MatCardModule,
    ]
})
export class HomeModule {
}
