export interface Collector<S,R> {
  create() : R

  add(element: S) : void

  finish() : R
}

class ArrayCollector<S> implements Collector<S, S[]> {
  // instance data

  private result : S[] = this.create()

  // implement Collector

  create() : S[] {
    return []
  }

  add(element: S) : void {
    this.result.push(element)
  }

  finish() : S[] {
    return this.result
  }
}

export class Collectors {
  static toArray<S>() : Collector<S, S[]> {
    return new ArrayCollector<S>()
  }
}


export class AsyncStream<S> {
  // static 

  static of<S>(source: AsyncIterable<S>) {
    return new AsyncSource<S>(source)
  }

  // constructor

  protected constructor(protected source: AsyncIterable<S>) {
  }

  // fluent


  filter(predicate: (element: S) => boolean): AsyncStream<S> {
    return new AsyncStream(new AsyncFilter(this.source, predicate))
  }

  async collect<R>(collector: Collector<S, R>) : Promise<R> {
    for await (const element of this.source) 
      collector.add(element)

    return collector.finish()
  }
}

export class AsyncFilter<S> extends AsyncStream<S> {
  // constructor

  constructor(source: AsyncIterable<S>, private predicate: (element: S) => boolean | Promise<boolean>) {
    super(source)
  }

  // iterators

  async * [Symbol.asyncIterator](): AsyncIterableIterator<S> {
    for await (const element of this.source) {
      if (this.predicate(element)) 
        yield element
    }
  }
}

export class Stream<S> {
    // static 

    static of<S>(source: Iterable<S>) {
      return new SyncSource<S>(source)
    }

    // constructor
  
    protected constructor(protected source: Iterable<S>) {
    }
  
    // fluent methods

    reduce<R>(reducer: (accumulated: R, element: S) => R, seed: R): R {
      const iterator = this.source[Symbol.iterator]()
  
      let accumulated = seed

      let result = iterator.next()
      while (!result.done) {
        accumulated = reducer(accumulated, result.value)
        result = iterator.next()
      }

      return accumulated
    }
  
    min(): S | undefined {
      let min = undefined
      for (const element of this.source) {
        if ( min === undefined)
          min = element
        else if ( element < min!)
          min = element 
      } // for


      return min
    }

    max(): S | undefined {
      let max = undefined
      for (const element of this.source) {
        if ( max === undefined)
          max = element
        else if ( element > max!)
          max = element 
      } // for


      return max
    }

    collect<R>(collector: Collector<S, R>) : R {
      for (const element of this.source) 
        collector.add(element)

      return collector.finish()
    }
  
    map<R>(selector: (element: S, index: number) => R) : Stream<R> {
      return new Stream<R>(new Map<S, R>(this.source, selector))
    }
  
    filter(predicate: (element: S) => boolean): Stream<S> {
      return new Stream(new Filter(this.source, predicate))
    }

    sort(compare?: (v1: S, v2: S) => number): Stream<S> {
      return new Stream(new Sort(this.source, compare))
    }

    distinct(compare: (v1: S, v2: S) => boolean =  (v1: S, v2: S) => v1 == v2): Stream<S> {
      return new Stream(new Distinct(this.source, compare))
    }

    tap(action: (element: S) => void): Stream<S> {
      return new Stream(new Tap(this.source, action))
    }
  }

  // tap
  
  export class Tap<S> extends Stream<S> {
    // constructor
  
    constructor(source: Iterable<S>, private action: (element: S) => void) {
      super(source)
    }
  
    *[Symbol.iterator](): IterableIterator<S> {
      for (const element of this.source) {
        this.action(element)
          
        yield element
      }
    }
  }

  // sort
  
  export class Sort<S> extends Stream<S> {
    // constructor
  
    constructor(source: Iterable<S>, private compare?: (v1: S, v2: S) => number) {
      super(source)
    }
  
    *[Symbol.iterator](): IterableIterator<S> {
      const sorted : S[] = []

      for (const element of this.source)
        sorted.push(element)

      sorted.sort(this.compare)

      for ( const value of sorted)
        yield value
    }
  }
  
  // filter
  
  export class Filter<S> extends Stream<S> {
    // constructor
  
    constructor(source: Iterable<S>, private predicate: (element: S) => boolean | Promise<boolean>) {
      super(source)
    }

    // iterators

    async * [Symbol.asyncIterator](): AsyncIterableIterator<S> {
      for await (const element of this.source) {
        if (this.predicate(element)) 
          yield element
      }
    }
  
    *[Symbol.iterator](): IterableIterator<S> {
      for (const element of this.source) {
        if (this.predicate(element)) {
          yield element
        }
      }
    }
  }

  // distinct

  export class Distinct<S> extends Stream<S> {
    // constructor
  
    constructor(source: Iterable<S>, private compare: (v1: S, v2: S) => boolean) {
      super(source)
    }
  
    *[Symbol.iterator](): IterableIterator<S> {
      const unique : S[] = []
      for (const element of this.source) {
        let isNew = true
        for ( const v of unique)
          if (this.compare(element,v)) {
            isNew = false
            break
          } 

        if ( isNew ) {
          unique.push(element)
          yield element
        }
      }  // for
    }
  }
  
  
  // map 
  
  export class Map<S, R> extends Stream<S> {
    // constructor
  
    constructor(source: Iterable<S>, private selector: (element: S, index: number) => R) {
      super(source)
    }
  
    // implement IterableIterator<R>
  
    *[Symbol.iterator](): IterableIterator<R> {
      let index = 0
      for (const element of this.source) {
        yield this.selector(element, index++)
      }
    }
  }
  
  // from
  
  export class SyncSource<S> extends Stream<S> implements Iterable<S> {
    // constructor
  
    constructor(source: Iterable<S>) {
      super(source)
    }
    
    // implement Iterable
  
    *[Symbol.iterator](): IterableIterator<S> {
      yield* this.source
    }
  }

  export class AsyncSource<S> extends AsyncStream<S> {
    // constructor
  
    constructor(source: AsyncIterable<S>) {
      super(source)
    }
    
    // iterator

    async * [Symbol.asyncIterator](): AsyncIterableIterator<S> {
      yield* this.source
    }
  }