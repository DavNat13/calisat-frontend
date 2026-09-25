import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'msal', test: /@azure.msal-browser/ },
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
  },
})
