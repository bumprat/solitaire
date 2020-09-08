import path from 'path'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import css from 'rollup-plugin-css-only'
import typescript from '@rollup/plugin-typescript'
import { exec } from 'child_process'

const mode = process.env.NODE_ENV
if (mode === 'development') {
  exec('rmdir dev /s/q ')
} else {
  exec('rmdir dist /s/q ')
}
export default {
  input: path.join('src', 'Solitaire.ts'),
  output: {
    // file: 'solitaire.js',
    dir: mode === 'development'
      ? 'dev'
      : 'dist',
    format: 'iife',
    name: 'Solitaire',
    sourcemap: mode === 'development'
  },
  plugins: [
    typescript({
      outDir: mode === 'development'
        ? 'dev'
        : 'dist',
      rootDir: './src',
      sourceMap: mode === 'development',
      target: 'ES3',
      declaration: mode === 'development'
    }),
    nodeResolve({
      customResolveOptions: {
        // I store projects on a encrypted potable drive,
        // which creates symlink as driver root path.
        preserveSymlinks: true
      }
    }),
    commonjs(),
    css(),
    ...(mode === 'development'
      ? [serve({
        contentBase: [
          'dev',
          'static',
          './'
        ],
        open: true
      }), livereload()]
      : [])
  ]
}
