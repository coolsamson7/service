/**
 * a StringBuilder is used to concatenate strings
 */
export class StringBuilder {
  // instance data

  private values: string[] = [];

  // public

  /**
   * append the passed value to this builder and return this
   * @param value a string value
   */
  public append(value: string): StringBuilder {
    this.values.push(value);

    return this;
  }

  /**
   * clear the contents
   */
  public clear(): StringBuilder {
    this.values.length = 1;

    return this;
  }

  /**
   * return the concatenated string according to the current collected values.
   */
  public toString(): string {
    return this.values.join('');
  }
}
