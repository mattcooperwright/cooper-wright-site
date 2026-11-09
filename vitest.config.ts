import { configDefaults, defineConfig } from 'vitest/config';

// apps/ holds separate projects with their own test runners.
export default defineConfig({
  test: { exclude: [...configDefaults.exclude, 'apps/**'] },
});
