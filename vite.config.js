import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
    plugins: [
        tailwindcss(),
        react(),
        {
            name: 'copy-assets',
            writeBundle() {
                const src = path.resolve(__dirname, 'public/assets');
                const dest = path.resolve(__dirname, 'backend/public/dist/assets');
                if (fs.existsSync(src)) {
                    const files = fs.readdirSync(src);
                    files.forEach(file => {
                        fs.copyFileSync(path.join(src, file), path.join(dest, file));
                    });
                }
            }
        }
    ],
    build: {
        outDir: 'backend/public/dist',
        emptyOutDir: true,
        chunkSizeWarningLimit: 1500,
        rollupOptions: {
            output: {
                entryFileNames: 'assets/index.js',
                chunkFileNames: 'assets/[name].js',
                assetFileNames: 'assets/[name].[ext]',
            },
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                quietDeps: true,
                silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
            },
        },
    },
    server: {
        host: '0.0.0.0',
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
});