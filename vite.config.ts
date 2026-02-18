import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                background: resolve(__dirname, 'src/background/service-worker.ts'),
                content: resolve(__dirname, 'src/content/github-injector.ts'),
                styles: resolve(__dirname, 'src/content/styles.css'),
                popup: resolve(__dirname, 'src/popup/popup.html'),
                options: resolve(__dirname, 'src/options/options.html'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name]-[hash].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        },
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: process.env.NODE_ENV === 'development',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
});
