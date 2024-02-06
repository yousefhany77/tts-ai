import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { ValidationError } from 'zod-validation-error';
import { FlattenZodError } from './FlattenZodError';

describe('FlattenZodError', () => {
  class MyClass {
    @FlattenZodError
    public myMethod(): Promise<string> {
      return Promise.reject(new ZodError([]));
    }
  }

  it('should catch and flatten ZodError for Promise return type', async () => {
    const instance = new MyClass();
    await expect(instance.myMethod()).rejects.toThrowError(ValidationError);
  });

  it('should not catch non-ZodError for Promise return type', async () => {
    class CustomError extends Error {}
    class MyClass {
      @FlattenZodError
      public myMethod(): Promise<string> {
        return Promise.reject(new CustomError('Custom error'));
      }
    }

    const instance = new MyClass();
    await expect(instance.myMethod()).rejects.toThrowError('Custom error');
  });

  it('should throw an error when used on a non-method property', () => {
    function declareClass(): void {
      class MyClass {
        // @ts-expect-error
        @FlattenZodError
        public prop1: string = 'value1';
      }
      new MyClass();
    }

    expect(declareClass).toThrowError(new Error('This decorator can only be used on methods'));
  });
});
