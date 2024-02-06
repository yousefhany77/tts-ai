import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Env } from './Env';

describe('Env', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should return the value of an existing environment variable', () => {
    process.env.MY_VARIABLE = 'my value';
    const result = Env.get('MY_VARIABLE');
    expect(result.value).toEqual('my value');
  });

  it('should return the default value if the environment variable is not found', () => {
    const result = Env.get('NON_EXISTING_VARIABLE', 'default value');
    expect(result.value).toEqual('default value');
  });

  it('should throw an error if the environment variable is not found and no default value is provided', () => {
    expect(() => {
      Env.get('NON_EXISTING_VARIABLE');
    }).toThrowError('Environment variable NON_EXISTING_VARIABLE not found');
  });

  it('should use the provided error message if the environment variable is not found and no default value is provided', () => {
    expect(() => {
      Env.get('NON_EXISTING_VARIABLE', undefined, { errorMessage: 'Custom error message' });
    }).toThrowError('Custom error message');
  });

  it('should return the value as a string', () => {
    process.env.MY_VARIABLE = '123';
    const result = Env.get('MY_VARIABLE');
    expect(result.toString()).toEqual('123');
  });

  it('should return the value as a number', () => {
    process.env.MY_VARIABLE = '123';
    const result = Env.get('MY_VARIABLE');
    expect(result.toNumber()).toEqual(123);
  });

  it('should return the value as a boolean', () => {
    process.env.MY_VARIABLE = 'true';
    const result = Env.get('MY_VARIABLE');
    expect(result.toBoolean()).toEqual(true);
  });
});
