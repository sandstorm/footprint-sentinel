import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts'],
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FootprintSentinel', // Global variable name for UMD build
      formats: ['es', 'cjs', 'umd'],
      fileName: format => {
        if (format === 'es') return 'index.mjs'
        if (format === 'cjs') return 'index.cjs'
        if (format === 'umd') return 'index.umd.js'
        return 'index.js'
      },
    },
    rollupOptions: {
      // No external dependencies for vanilla package
      external: [],
      output: {
        globals: {},
      },
    },
    sourcemap: true,
    minify: 'terser', // Better minification for libraries
    target: 'es2020',
  },
})
