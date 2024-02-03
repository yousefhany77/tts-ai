/**
 * Omits the specified properties from the result of the method
 * @param props  The properties to omit from the result of the method
 * @returns  A decorator that omits the specified properties from the result of the method
 */

export function OmitThisProperties<T, Method extends (this: Omit<T, MethodKeys<T>>, ...args: any[]) => any>(
  props: MethodKeys<T>[]
) {
  return function (
    _target: T,
    _propertyKey: keyof T,
    descriptor: TypedPropertyDescriptor<Method>
  ): TypedPropertyDescriptor<Method> {
    if (!descriptor.value) {
      throw new Error('This decorator can only be used on methods');
    }
    const originalMethod = descriptor.value;

    descriptor.value = function (this: Omit<T, MethodKeys<T>>, ...args: any[]) {
      const result = originalMethod.apply(this, args);
      if (result instanceof Promise) {
        return result.then((res) => omit(res, props));
      }
      return omit(result, props);
    } as Method;

    return descriptor;
  };
}

function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  //  write a function to omit the specified properties from the `this` object and return the result
  const result = obj;
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

type MethodKeys<T> = {
  [K in keyof T]: K;
}[keyof T];
