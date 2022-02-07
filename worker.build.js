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
        '@emotion/react': require.resolve('@emotion/react'),
        '@emotion/cache': require.resolve('@emotion/cache'),
      })
    ]
  })
  .catch(() => process.exit(1))