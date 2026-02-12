import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    base: '/programming-advance-2025-sonoko73mati2-beep-main/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            input: 'index.html',
            output: {
                entryFileNames: 'src/lib/bundle.js',
                chunkFileNames: 'src/lib/[name].js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                        return 'css/[name][extname]';
                    }
                    return 'assets/[name][extname]';
                }
            }
        }
    },
    server: {
        open: true
    }
});
