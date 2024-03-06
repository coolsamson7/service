import { Version } from "./version"

type VersionComparator = (version: Version) => boolean

export class VersionRange {
    // instance data

    private operations: VersionComparator[] = []

    // constructor

    constructor(version: string) {
        this.parse(version)
    }

    // private

    private compare(version: Version, op: string) : VersionComparator{
        switch (op) {
            case "<":
                return (v: Version) => v.lt(version)
            case "<=":
                return (v: Version) => v.le(version)
            case ">":
                return (v: Version) => v.gt(version)
            case ">=":
                return (v: Version) => v.ge(version)
            default:
                throw new Error("bad operator")
        }
    }

    private parse(version: string) {
        const exp = /^(?<op>(>|>=|<|<=))(?<v>\d[.\d]+)(,(?<op1>(>|>=|<|<=))(?<v1>\d[.\d]+))*$/
        const result = exp.exec(version)
        if ( result?.groups ) {
            this.operations.push(this.compare(new Version(result.groups["v"]), result.groups["op"]))

            if ( result?.groups["op1"])
                this.operations.push(this.compare(new Version(result.groups["v1"]), result.groups["op1"]))
        }
        else throw new Error(`could not parse version '${version}'`)
    }

    // public

    matches(version: Version) : boolean {
        for ( const operation of this.operations)
            if ( !operation(version))
                return false

        return true
    }
}
