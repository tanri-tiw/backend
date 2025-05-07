export const getEnv = (key, defValue) => {
  const value = process.env[key];
  if (value === undefined) {
    if (defValue) {
      return defValue;
    }
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
};
