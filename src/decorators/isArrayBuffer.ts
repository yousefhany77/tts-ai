/**
 * @IsArrayBuffer decorator
 */
export function IsArrayBuffer<ThisType>(allowNull: boolean = false) {
  return function _IsArrayBuffer(target: ThisType, propertyKey: string): void {
    let val: unknown = target[propertyKey as keyof ThisType];

    const getter = function (): ArrayBuffer | undefined | null {
      if (val instanceof ArrayBuffer) {
        return val;
      }
      return allowNull ? undefined : null;
    };

    const setter = function (next: ArrayBuffer | undefined | null): void {
      if (next instanceof ArrayBuffer) {
        val = next;
      } else {
        if (next === null && allowNull) {
          val = null;
          return;
        }
        throw new Error('The value must be an ArrayBuffer' + next);
      }
    };

    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      configurable: false,
      enumerable: true,
    });
  };
}
