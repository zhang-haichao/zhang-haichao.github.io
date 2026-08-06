import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://zhang-haichao.github.io',
  output: 'static',
  devToolbar: {
    enabled: false
  },
  build: {
    format: 'directory'
  }
});
