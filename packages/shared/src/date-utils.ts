export const toUtcDate = (input: Date | string): Date => {
  const value = input instanceof Date ? input : new Date(input);
  return new Date(Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
    value.getUTCHours(),
    value.getUTCMinutes(),
    value.getUTCSeconds(),
    value.getUTCMilliseconds()
  ));
};

export const nowUtc = (): Date => new Date();
