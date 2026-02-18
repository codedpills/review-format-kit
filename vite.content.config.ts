import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/content/github-injector.ts'),
            name: 'content',
            formats: ['iife'],
            fileName: () => 'content.js',
        },
        outDir: 'dist',
        emptyOutDir: false, // Don't empty as main build runs first
        rollupOptions: {
            output: {
                extend: true,
            },
        },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});
