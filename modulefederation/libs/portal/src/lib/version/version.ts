export class Version {
    // instance data

    private numbers: number[]

    // constructor

    constructor(v: string) {
       this.numbers = v.split(".").map(digit => +digit)
    }

    // 1.0.0 < 2
    // 1.0 < 1.1
    // x 1.1 < 1.1
    // 1 < 2.0.0
    // 1.0 = 1??? 1.0.0

    private pos(i: number) {
        return i < this.numbers.length ? this.numbers[i] : 0
    }

    private len() : number {
        return this.numbers.length
    }

    // public

    eq(version: Version) :boolean {
        // exactly same length

        if (this.len() !== version.len())
            return false

        // and same elements

        for ( let i = this.len() - 1; i >= 0; i--)
            if ( this.pos(i) !== version.pos(i))
                return false

        return true
    }

    lt(version: Version) :boolean {
        const len = Math.max(this.numbers.length, version.numbers.length)

        let eq = true
        for ( let i = 0; i < len; i++) {
            if ( this.pos(i) < version.pos(i))
                return true
            else if (this.pos(i) !== version.pos(i))
                eq = false
        }

        return !eq
    }

    le(version: Version) :boolean {
        const len = Math.max(this.numbers.length, version.numbers.length)

        for ( let i = 0; i < len; i++) {
            if ( this.pos(i) > version.pos(i))
                return false
        }

        return true
    }

    gt(version: Version) :boolean {
        const len = Math.max(this.numbers.length, version.numbers.length)

        let eq = true
        for ( let i = 0; i < len; i++) {
            if ( this.pos(i) > version.pos(i))
                return true
            else if (this.pos(i) !== version.pos(i))
                eq = false
        }

        return !eq
    }

    ge(version: Version) :boolean {
        const len = Math.max(this.numbers.length, version.numbers.length)


        for ( let i = 0; i < len; i++) {
            if ( this.pos(i) < version.pos(i))
                return false
        }

        return true
    }
}
