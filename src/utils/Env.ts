class EnvValue {
  constructor(public value: string | number | boolean) {}

  toString(): string {
    return String(this.value);
  }
  toNumber(): number {
    return Number(this.value);
  }
  toBoolean(): boolean {
    return this.value === 'true';
  }
}

export class Env {
  static get(key: string, defaultValue?: string | number | boolean): EnvValue {
    const value = process.env[key] || defaultValue;

    if (!value) {
      throw new Error(`Environment variable ${key} not found`);
    }

    return new EnvValue(value);
  }
}
