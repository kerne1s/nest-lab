import { Transform } from 'class-transformer';

export function TransformBoolean() {
  return Transform(({ obj, key, value }) => {
    const rawValue = obj[key] ?? value;

    if (typeof rawValue === 'boolean') {
      return rawValue;
    }

    if (typeof rawValue !== 'string') {
      return rawValue;
    }

    const normalizedValue = rawValue.toLowerCase();

    switch (normalizedValue) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        return rawValue;
    }
  }, { toClassOnly: true });
}
