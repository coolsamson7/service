import { ConfigurationSource } from "../common"

export interface ConfigurationProperty {
  type: "object" | "string" | "boolean" | "number"
  name: string
  value: any
}

/**
 * <code>DeploymentConfigurationSource</code> is fed by a deployment.
 */
export class DeploymentConfigurationSource implements ConfigurationSource {
    // instance data

    private value = {}

    // constructor

    constructor(private configuration: string) {
        this.parse(JSON.parse(configuration))
    }

    // private

    private parse(property: ConfigurationProperty) {
        const traverse = (properties: ConfigurationProperty[], result: any) => {
            for ( const property of properties) {
                if ( property.type == "object")
                    traverse(property.value as ConfigurationProperty[],  result[property.name] = {})
                
                else
                    result[property.name] = property.value
            }
        }

        traverse(property.value as ConfigurationProperty[], this.value)
    }

    // implement ConfigurationSource

    isLoaded() : boolean {
        return true
    }

    values() : any {
        return this.value
    }

    load(): Promise<any> {
        return Promise.resolve(this.value)
    }
}
