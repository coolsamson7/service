import "reflect-metadata"
import { array, boolean, date, enumeration, number, object, reference, string } from "./base-types/index"

enum Color {
    RED = 1,
    GREEN,
    BLUE,
}

enum StringColor {
    RED = "RED",
    GREEN = "GREEN",
    BLUE = "BLUE",
}

describe("validation", () => {
    it("should validate numbers", async () => {
        const constraint = number().min(0).max(10)

        expect(constraint.isValid(1)).toBe(true)
        expect(constraint.isValid(-1)).toBe(false)
    })

    it("should validate strings", async () => {
        const constraint = string().length(2)

        expect(constraint.isValid("11")).toBe(true)
        expect(constraint.isValid("111")).toBe(false)
    })

    it("should validate dates", async () => {
        const constraint = date()

        expect(constraint.isValid(new Date())).toBe(true)
        //expect(constraint.isValid(1)).toBe(false)
    })

    it("should booleans numbers", async () => {
        const constraint = boolean()

        //expect(constraint.isValid(1)).toBe(false)
        expect(constraint.isValid(true)).toBe(true)
    })

    it("should validate number enums", async () => {
        const constraint = enumeration(Color)

        expect(constraint.isValid(Color.RED)).toBe(true)
        expect(constraint.isValid(-1)).toBe(false)
    })

    it("should validate string enums", async () => {
        const constraint = enumeration(StringColor)

        expect(constraint.isValid(StringColor.RED)).toBe(true)
        expect(constraint.isValid("PURPLE")).toBe(false)
    })

    it("should validate arrays", async () => {
        const schema = object({
            elements: array(
                object({
                    firstName: string().max(10),
                    lastName: string().optional(),
                })
            ),
        })

        schema.validate({
            elements: [
                {
                    firstName: "Andi",
                    lastName: "Ernst",
                },
            ],
        })
    })

    it("should validate object", async () => {
        const schema = object({
            firstName: string().max(10),
            lastName: string().max(10),
        })

        expect(
            schema.isValid({
                firstName: "Andreas",
                lastName: "Ernst",
            })
        ).toBe(true)

        expect(
            schema.isValid({
                firstName: "Andreas",
                lastName: "Ernst000000000000",
            })
        ).toBe(false)
    })

    it("should validate references", async () => {
        const priceSchema = object({
            currency: string(),
            value: number(),
        })

        const productSchema = object({
            name: string().max(10),
            price: reference(priceSchema),
        })

        expect(
            productSchema.isValid({
                name: "Foo",
                price: {
                    currency: "EUR",
                    value: 1,
                },
            })
        ).toBe(true)

        expect(
            productSchema.isValid({
                foo: "Bar",
                bar: "Ernst000000000000",
            })
        ).toBe(false)
    })

    it("should create proper violations", async () => {
        const schema = object({
            firstName: string().length(10),
            lastName: string().length(10),
        })

        try {
            expect(
                schema.isValid({
                    firstName: "Andreas",
                    lastName: "Ernst000000000000",
                })
            ).toBe(false)
        } 
        catch (error: any) {
            // should include the length violation

            expect(error.violations.length == 1)
            expect(error.violations[0].type).toBe("string")
            expect(error.violations[0].name).toBe("length")
            expect(error.violations[0].path).toBe("lastName")
        }
    })

    it("should break on wrong type", async () => {
        const schema = object({
            firstName: string().length(10),
            lastName: string().length(2),
        })

        try {
            schema.validate({
                firstName: 1, // ouch
                lastName: "Ernst", // length 2
            })
        } catch (error: any) {
            // should include the length violation

            expect(error.violations.length == 2)
        }
    })

    it("should accept optional", async () => {
        const schema = object({
            firstName: string().max(10),
            lastName: string().length(2).optional(),
        })

        schema.validate({
            firstName: "And", // ouch
            lastName: undefined,
        })
    })
})
