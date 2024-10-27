import "reflect-metadata"

import { array, date, enumeration, number, object, record, reference, string, Type } from "./type"
import { TypeParser } from "./type-parser"

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
    it("should throw parse errors", async () => {
        // wrong keyword

        try {
            TypeParser.parse("number", "is-foo")

            fail("should throw")
        }
        catch(e) {
            console.log(e)
        }

         // missing argument

         try {
            TypeParser.parse("number", ">")

            fail("should throw")
        }
        catch(e) {
            console.log(e)
        }

          // wrong argument

          try {
            TypeParser.parse("number", "> f")

            fail("should throw")
        }
        catch(e) {
            console.log(e)
        }
    }),

    it("should parse", () => {
        // boolean

        let type = TypeParser.parse("boolean", "is-true")

        // string

         type = TypeParser.parse("string", "min-length 1 max-length 10")

        // number

        type = TypeParser.parse("number", "> 1 < 10")

        console.log(type)
    }),

    it("should validate", async () => {
        const constraint = Type.get("Foo")

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
            constraint!.validate(foo)
        }
        catch (err) {
            console.log(err)
        }
    })
})
