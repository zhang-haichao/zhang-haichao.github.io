import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://zhang-haichao.github.io',
  output: 'static',
  build: {
    format: 'directory'
  }
});

