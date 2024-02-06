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
    if (!descriptor || typeof descriptor.value !== 'function') {
      throw new Error('This decorator can only be used on methods');
    }
    const originalMethod = descriptor.value;

    descriptor.value = function (this: Omit<T, MethodKeys<T>>, ...args: any[]) {
      const result = originalMethod.apply(this, args);
      if (result instanceof Promise) {
        return result.then((res) => {
          for (const prop of props) {
            omit(res, prop);
          }

          return res as Omit<T, MethodKeys<T>>;
        });
      }
      for (const prop of props) {
        omit(result, prop);
      }
      return result as Omit<T, MethodKeys<T>>;
    } as Method;

    return descriptor;
  };
}

type MethodKeys<T> = {
  [K in keyof T]: K;
}[keyof T];

const omit = <T>(res: T, prop: keyof T): T => {
  return Object.defineProperty(res, prop, {
    value: undefined,
  });
};
