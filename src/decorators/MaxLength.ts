import { ValidationError } from 'zod-validation-error';
export const createErrorMsg = (maxLength: number, received: number): string =>
  `Value must be less than ${maxLength} characters received ${received} characters.`;
/**
 *
 * MaxLength decorator for string length validation for method parameters
 * @param length
 */
export function MaxLength(length: number) {
  return function <This>(
    _target: ThisType<This>,
    _propertyKey: keyof This,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
  ): void {
    const originalMethod = descriptor?.value;
    if (typeof originalMethod !== 'function' || !originalMethod)
      throw new Error('MaxLength decorator can only be used on methods');
    descriptor.value = function (...args: any[]): unknown {
      const [text] = args;
      if (typeof text !== 'string') throw new ValidationError('Value must be a string');
      if (text.length > length) throw new ValidationError(createErrorMsg(length, text.length));
      return originalMethod.apply(this, args) as unknown;
    };
  };
}
