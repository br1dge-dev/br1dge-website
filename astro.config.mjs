// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Vite plugin to properly resolve Strudel packages
function strudelResolvers() {
  return {
    name: 'strudel-resolvers',
    config() {
      return {
        resolve: {
          alias: {
            '@strudel/core': join(__dirname, 'node_modules/@strudel/core/dist/index.mjs'),
            '@strudel/webaudio': join(__dirname, 'node_modules/@strudel/webaudio/dist/index.mjs'),
            '@strudel/transpiler': join(__dirname, 'node_modules/@strudel/transpiler/dist/index.mjs'),
            '@strudel/mini': join(__dirname, 'node_modules/@strudel/mini/dist/index.mjs'),
          }
        }
      };
    }
  };
}

// https://astro.build/config
export default defineConfig({
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss(), strudelResolvers()],
    optimizeDeps: {
      include: [
        '@strudel/core',
        '@strudel/webaudio', 
        '@strudel/transpiler',
        '@strudel/mini'
      ]
    },
    server: {
      fs: {
        allow: ['..']
      }
    }
  },
  adapter: vercel()
});