export function get<T>(object: any, key: string, defaultValue: T | undefined = undefined): T | undefined {
  const path = key.split(".")

  let index = 0
  const length = path.length

  while (object != null && index < length)
    object = Reflect.get(object, path[index++])

  if (index && index == length)
    return <T>object
  else
    return defaultValue
}
