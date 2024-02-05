import { isObject } from "./isObject";

export function mergeDeep(target: any, source: any): any {
    const output = Object.assign({}, target);

    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key: any) => {
        if (isObject(source[key])) {
          if (!(key in target))
            Object.assign(output, {[key]: source[key]});

          else
            output[key] = mergeDeep(target[key], source[key]);

        }
        else
          Object.assign(output, {[key]: source[key]});

      });
    }

    return output;
}
