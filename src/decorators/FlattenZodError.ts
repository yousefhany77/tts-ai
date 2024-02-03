import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Flatten Zod error decorator
 * returns error.message if error is an instance of ZodError
 */

export function FlattenZodError<
  ThisType,
  Args extends any[],
  Return,
  Fn extends (this: ThisType, ...args: Args) => Return,
>(
  _target: ThisType,
  _propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<Fn>
): TypedPropertyDescriptor<Fn> {
  const originalMethod = descriptor.value;
  if (!originalMethod) throw new Error('Method not found');

  const newMethod = function (this: ThisType, ...args: Args) {
    const result = originalMethod.apply(this, args);
    if (result instanceof Promise) {
      return result.catch((error) => {
        if (error instanceof ZodError) {
          throw fromZodError(error);
        }
        throw error;
      });
    }
    return result;
  } as Fn;

  descriptor.value = newMethod;

  return descriptor;
}
