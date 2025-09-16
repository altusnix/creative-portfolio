import { defineConfig } from 'vite'

export default defineConfig({
  base: '/',
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        format: 'umd',
        name: 'Portfolio',
        entryFileNames: 'portfolio.js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'style.css'
          }
          return '[name].[ext]'
        }
      }
    },
    modulePreload: false,
    polyfillModulePreload: false,
    cssCodeSplit: false
  }
})