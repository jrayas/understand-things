import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" makes the site work at any address, so you never need
// to type your repository name here.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
