import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { MatListModule } from "@angular/material/list";
import { MatTabsModule } from "@angular/material/tabs";
import { MatInputModule } from "@angular/material/input";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatTreeModule } from "@angular/material/tree";
import { MatButtonModule } from "@angular/material/button";
import { NamespaceTreeComponent } from "./namespace-tree.component";
import { MatMenuModule } from "@angular/material/menu";

@NgModule({
    declarations: [
    ],
    imports: [
        NamespaceTreeComponent,

        CommonModule,
        RouterModule,
        MatListModule,
        MatTabsModule,
        MatInputModule,
        MatMenuModule,
        MatFormFieldModule,
        MatTreeModule,
        MatButtonModule,
        MatIconModule
    ]
})
export class TranslationModule {
}
