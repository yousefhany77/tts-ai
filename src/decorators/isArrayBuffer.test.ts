import { describe, expect, it } from 'vitest';
import { ValidationError } from 'zod-validation-error';
import { IsArrayBuffer } from './isArrayBuffer';

describe('IsArrayBuffer', () => {
  class TestClass {
    @IsArrayBuffer(false)
    public value: ArrayBuffer = new ArrayBuffer(8);
  }

  class TestClassWithNull {
    @IsArrayBuffer(true)
    public value: ArrayBuffer | null = null;
  }

  it('should allow setting an ArrayBuffer value', () => {
    const testClass = new TestClass();
    const buffer = new ArrayBuffer(8);
    expect(() => {
      testClass.value = buffer;
    }).not.toThrow();
    expect(testClass.value).toBe(buffer);
  });

  it('should not allow setting a non ArrayBuffer value', () => {
    expect(() => {
      try {
        const instance = new TestClass();
        // @ts-expect-error
        instance.value = 'not an array buffer';
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });

  it('should not allow setting null when allowNull is false', () => {
    const testClass = new TestClass();
    expect(() => {
      try {
        // @ts-expect-error
        testClass.value = null;
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });

  it('should allow setting null when allowNull is true', () => {
    const testClass = new TestClassWithNull();
    expect(() => {
      testClass.value = null;
    }).not.toThrow();
    expect(testClass.value).toBeNull();
  });
});
