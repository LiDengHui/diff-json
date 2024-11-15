import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
export default defineConfig({
  build: {
    lib: {
      entry: './lib/main.ts',
      name: 'index',
      fileName: 'index',
    },
  },
  plugins: [dts()],
})
