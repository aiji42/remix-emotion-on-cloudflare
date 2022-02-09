const alias = require('esbuild-plugin-alias')
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
        'through': require.resolve('no-op'),
        'html-tokenize': require.resolve('no-op'),
        'multipipe': require.resolve('no-op'),
        '@emotion/react': require.resolve('@emotion/react'),
        '@emotion/cache': require.resolve('@emotion/cache'),
      })
    ]
  })
  .catch(() => process.exit(1))
