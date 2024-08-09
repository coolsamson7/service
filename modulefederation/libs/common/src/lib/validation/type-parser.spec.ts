import "reflect-metadata"

import { array, date, enumeration, number, object, record, reference, string } from "./base-types/index"
import { Types }from "./types"

interface Bar {
    name: string
    properties: { [key: string]: Color }
}

enum Color {
    RED = 1,
    GREEN,
    BLUE,
}

enumeration(Color, "Color")

interface Foo {
    name: string
    number: number
    birthday: Date
    bar: Bar
    bars: Bar[]
    color: Color
}

const barSchema = object({
    name: string(),
    properties: record(string()),
}, "Bar")


object({
        name: string().min(1).max(10),
        number: number().greaterThan(1).lessThanEquals(2),
        birthday: date(),
        email: string().email(),
        bar: reference(barSchema),
        bars: array(barSchema).min(1).max(10),
        color: enumeration(Color),
    }, "Foo")

describe("constraint parser", () => {
    it("should parse & validate", async () => {
        const constraint = Types.get("Foo")

        const foo = {
            name: "foo",
            number: 2,
            email: "bla@foo",
            birthday: new Date(),
            bar: {
                name: "bar",
                properties: {
                    a: "a",
                },
                color: Color.RED,
            },
            bars: [
                {
                    name: "bar",
                    properties: {
                        a: "a",
                    },
                },
            ],
            color: Color.RED,
        }

        expect(constraint).toBeDefined()

        try {
            constraint.validate(foo)
        }
        catch (err) {
            console.log(err)
        }
    })
})
