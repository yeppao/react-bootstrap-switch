import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

// eslint-disable-next-line no-undef
const pkg = require('./package.json');

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        name: 'rbs',
      },
      {
        file: pkg.module,
        format: 'es',
      }
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      postcss({ 
        extract: 'react-bootstrap-switch.css' 
      }),
      terser(),
    ],
  },
  {
    input: "src/example/index.tsx",
    output: [
      {
        file: "example/bundle.js",
        format: "iife",
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      }
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      postcss({ extract: true }),
      terser(),
    ],
  },
  {
    input: "dist/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts({ allowJs: true })],
    external: [/\.(css|less|scss)$/],
  },
];