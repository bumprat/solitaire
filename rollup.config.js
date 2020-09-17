import path from 'path'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { exec } from 'child_process'
import { terser } from 'rollup-plugin-terser'
import copy from 'rollup-plugin-copy'
import babel from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss'
import postcssPresetEnv from 'postcss-preset-env'

const mode = process.env.NODE_ENV
if (mode === 'development') {
  exec('rmdir dev /s/q ')
} else {
  exec('rmdir dist /s/q ')
}
export default [
  {
    input: path.join('src', 'Solitaire.ts'),
    output: {
      dir: mode === 'development' ? 'dev' : 'dist',
      format: 'umd',
      name: 'Solitaire',
      sourcemap: mode === 'development'
    },
    plugins: [
      commonjs(),
      babel({
        babelHelpers: 'runtime',
        extensions: ['.ts', '.tsx', '.js']
      }),
      nodeResolve({
        customResolveOptions: {
          // I store projects on a encrypted potable drive,
          // which creates symlink as driver root path.
          preserveSymlinks: true,
          extensions: ['.ts', '.tsx', '.js']
        }
      }),
      postcss({
        plugins: [postcssPresetEnv],
        extract: 'solitaire.css'
      }),
      ...(mode === 'development' ? [] : [terser()])
    ]
  },
  {
    input: path.join(
      'src',
      mode === 'development' ? 'index.dev.ts' : 'index.ts'
    ),
    output: {
      dir: mode === 'development' ? 'dev' : 'dist',
      format: 'iife',
      name: 'main',
      sourcemap: mode === 'development'
    },
    plugins: [
      commonjs(),
      babel({
        babelHelpers: 'runtime',
        extensions: ['.ts', '.tsx', '.js']
      }),
      nodeResolve({
        customResolveOptions: {
          // I store projects on a encrypted potable drive,
          // which creates symlink as driver root path.
          preserveSymlinks: true,
          extensions: ['.ts', '.tsx', '.js']
        }
      }),
      postcss({
        plugins: [postcssPresetEnv],
        extract: 'index.css'
      }),
      ...(mode === 'development'
        ? [
          serve({
            contentBase: ['dev', 'src/static', './'],
            open: true
          }),
          livereload()
        ]
        : [
          terser(),
          copy({
            targets: [{ src: 'src/static/*', dest: 'dist' }]
          })
        ])
    ]
  }
]
