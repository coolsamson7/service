/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropertyEditorRegistry } from './property-editor-registry'

export const RegisterPropertyEditor = (type: string) : ClassDecorator => {
  return (clazz: any) => {
    import('./property-editor.module').then((m) => {
      m.PropertyEditorModule.injector.subscribe((injector) => {
        const registry = injector.get(PropertyEditorRegistry)

        registry.register(type, clazz)
      })
    })
  }
}
