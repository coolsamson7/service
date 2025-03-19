/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropertyEditorRegistry } from './property-editor-registry'

export const RegisterPropertyEditor = (type: string) : ClassDecorator => {
  return (clazz: any) => {
    import('./property-panel.module').then((m) => {
      m.PropertyPanelModule.injector.subscribe((injector) => {
        const registry = injector.get(PropertyEditorRegistry)

        registry.register(type, clazz)
      })
    })
  }
}
