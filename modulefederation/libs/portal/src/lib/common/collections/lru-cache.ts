/**
 * simple generic lru cache for string keys.
 */
export class LRUCache<T> {
  // instance data

  private values: Map<string, T> = new Map<string, T>();

  // constructor

  /**
   * create a new <code>LRUCache</code>
   * @param maxEntries the maximum number of entries.
   */
  constructor(private maxEntries = 20) {}

  // public

  /**
   * get the stored value for the key.
   * @param key the key
   */
  public get(key: string): T {
    const hasKey = this.values.has(key);
    let entry: T;
    if (hasKey) {
      // peek the entry, re-insert for LRU strategy

      // @ts-ignore
        entry = this.values.get(key);

      this.values.delete(key);
      this.values.set(key, entry);
    }

    // @ts-ignore
      return entry;
  }

  /**
   * store the value under the key
   * @param key the key
   * @param value the value
   */
  public put(key: string, value: T): T {
    if (this.values.size >= this.maxEntries) {
      // least-recently used cache eviction strategy
      const keyToDelete = this.values.keys().next().value;

      this.values.delete(keyToDelete);
    }

    this.values.set(key, value);

    return value;
  }
}
