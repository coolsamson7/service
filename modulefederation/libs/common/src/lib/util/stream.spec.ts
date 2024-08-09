import "reflect-metadata"

import { AsyncStream, Collectors, Stream } from "./stream"

interface Price {
    currency: string,
    value: number
  }

async function* createAsyncIterable<S>(source: Iterable<S>) {
    for (const elem of source)
        yield elem;
}

  
describe("query", () => {
    it("should work async", async () => {
        const collection : Price[] = [
            {currency: 'EUR', value: 0},
            {currency: 'EUR', value: 3},
            {currency: 'EUR', value: 1},
            {currency: 'EUR', value: 1},
            {currency: 'EUR', value: 2},
        ]
        
        const result = await AsyncStream.of(createAsyncIterable(collection))
            .filter(price => price.value > 0)
            .collect(Collectors.toArray())

        console.log(result)

        expect(result.length).toBe(3)
    })

    it("should work", () => {
        const collection : Price[] = [
            {currency: 'EUR', value: 0},
            {currency: 'EUR', value: 3},
            {currency: 'EUR', value: 1},
            {currency: 'EUR', value: 1},
            {currency: 'EUR', value: 2},
        ]
        
        const result = Stream.of(collection)
            .tap(value => console.log(value))
            .filter(price => price.value > 0)
            .map(price => price.value)
            .distinct()
            .sort()
            .collect(Collectors.toArray())

        console.log(result)

        expect(result.length).toBe(3)

        const sum =  Stream.of(collection)
            .filter(price => price.value > 0)
            .reduce((total: number, price: Price) => total + price.value, 0);

        console.log(result)

        expect(sum).toBe(7)
    })
})
