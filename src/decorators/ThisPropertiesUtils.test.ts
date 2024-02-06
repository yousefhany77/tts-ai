import { describe, expect, it } from 'vitest';
import { OmitThisProperties } from './ThisPropertiesUtils';

describe('OmitThisProperties', () => {
  class MyClass {
    public prop1: string;
    public prop2: number;

    constructor(prop1: string, prop2: number) {
      this.prop1 = prop1;
      this.prop2 = prop2;
    }

    @OmitThisProperties(['prop1'])
    public myMethod(): { prop1: string; prop2: number } {
      return this;
    }

    @OmitThisProperties(['myMethod'])
    public async myAsyncMethod(): Promise<this> {
      return new Promise((resolve) => {
        resolve(this);
      });
    }
  }

  it('should omit specified properties from a Promise', async () => {
    const instance = new MyClass('value1', 2);
    const result = await instance.myAsyncMethod();
    expect(function () {
      result.myMethod();
    }).toThrowError('result.myMethod is not a function');
  });

  it('should omit specified properties from the result of a method', () => {
    const instance = new MyClass('value1', 2);
    const result = instance.myMethod();
    expect(result).toEqual({ prop2: 2 });
  });

  it('should throw an error when used on a non-method property', () => {
    function declareClass(): void {
      class MyClass {
        // @ts-expect-error
        @OmitThisProperties(['prop1'])
        public prop1: string = 'value1';
      }
      new MyClass();
    }

    expect(declareClass).toThrowError(new Error('This decorator can only be used on methods'));
  });
});
