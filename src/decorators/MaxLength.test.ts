import { describe, expect, it } from 'vitest';
import { ValidationError } from 'zod-validation-error';
import { MaxLength } from './MaxLength';

describe('MaxLength', () => {
  class MyClass {
    @MaxLength(5)
    public myMethod(text: string): string {
      return text;
    }
  }

  it('should not throw an error when text length is within the limit', () => {
    const instance = new MyClass();
    expect(() => instance.myMethod('hello')).not.toThrowError();
  });

  it('should throw a ValidationError when text length exceeds the limit', () => {
    const instance = new MyClass();
    expect(() => instance.myMethod('hello world')).toThrowError(ValidationError);
  });

  it('should throw a ValidationError when the argument is not a string', () => {
    const instance = new MyClass();
    // @ts-expect-error
    expect(() => instance.myMethod(123)).toThrowError(ValidationError);
  });

  it('should throw a error if used with a non-method', () => {
    const createClass = (): void => {
      class MyClass {
        // @ts-expect-error
        @MaxLength(5)
        // @ts-expect-error
        public myProperty: string;
      }
      new MyClass();
      return;
    };

    expect(createClass).toThrowError('MaxLength decorator can only be used on methods');
  });
});
