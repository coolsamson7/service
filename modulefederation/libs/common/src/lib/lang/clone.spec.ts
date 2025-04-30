import { cloneDeep } from "./clone";


describe('cloneDeep', () => {
  it('shouldClone', () => {
    const source = {
      a: "a",
      array: [{
        b: {
          c: "c"}
        }]
      }

    const result = cloneDeep(source)

    expect(result.a).toBe("a");
    expect(result.array[0].b.c).to("c");
  });
});
