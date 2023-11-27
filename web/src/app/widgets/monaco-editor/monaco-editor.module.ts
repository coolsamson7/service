import { CommonModule } from "@angular/common";
import { ModuleWithProviders, NgModule } from "@angular/core";
import { MonacoEditorConfig, MONACO_EDITOR_CONFIG } from "./monaco-editor";
import { MonacoEditorComponent } from "./monaco-editor.component";

@NgModule({
    imports: [CommonModule],
    declarations: [MonacoEditorComponent],
    exports: [MonacoEditorComponent]
})
export class MonacoEditorModule {
    public static forRoot(config: MonacoEditorConfig = {}): ModuleWithProviders<MonacoEditorModule> {
        return {
            ngModule: MonacoEditorModule,
            providers: [
                {
                    provide: MONACO_EDITOR_CONFIG,
                    useValue: config
                }
            ]
        };
    }
}