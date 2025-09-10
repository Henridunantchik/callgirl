export const getEvn = (envname) => {
  const env = import.meta.env;

  // Return the environment variable value
  const value = env[envname];

  // Log missing environment variables in development
  if (!value && import.meta.env.DEV) {
    console.warn(`Missing environment variable: ${envname}`);
  }

  return value;
};
