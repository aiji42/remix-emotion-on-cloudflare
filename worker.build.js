const alias = require('esbuild-plugin-alias')
const path = require('path')
const isProd = process.env.NODE_ENV === 'production'

require('esbuild')
  .build({
    entryPoints: ['./worker'],
    bundle: true,
    sourcemap: true,
    minify: isProd,
    outdir: 'dist',
    define: {},
    plugins: [
      alias({
        'through': path.resolve(__dirname, 'app/polyfills/through.js'),
        'html-tokenize': path.resolve(__dirname, 'app/polyfills/html-tokenize.js'),
        'multipipe' :path.resolve(__dirname, 'app/polyfills/multipipe.js'),
        '@emotion/react': require.resolve('@emotion/react'),
        '@emotion/cache': require.resolve('@emotion/cache'),
      })
    ]
  })
  .catch(() => process.exit(1))
