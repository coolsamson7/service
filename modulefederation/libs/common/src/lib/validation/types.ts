import { boolean, date, string, number, short, double, float, integer, long } from "./type"

/*export class Types {
    // instance data

    private static cache: { [type: string]: Type<any> } = {}

    // public

    static register(constraint: Type<any>): Types {
        this.cache[constraint.name!] = constraint

        return this
    }

    static get(type: string): Type<any> {
        // is it cached?

        const constraint = this.cache[type]

        return constraint
    }
}
*/
string("string")
number("number")
date("date")
boolean("boolean")

short("short")
integer("integer")
long("long")
float("float")
double("double")

