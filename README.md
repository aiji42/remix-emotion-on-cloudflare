# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

You will be running two processes during development:

- The Miniflare server (miniflare is a local environment for Cloudflare Workers)
- The Remix development server

```sh
# in one tab, start the remix dev server
$ npm run dev

# in another, start the miniflare server
$ npm start
```

Open up [http://127.0.0.1:8787](http://127.0.0.1:8787) and you should be ready to go!

If you'd rather run everything in a single tab, you can look at [concurrently](https://npm.im/concurrently) or similar tools to run both processes in one tab.

## Deployment

Use [wrangler](https://developers.cloudflare.com/workers/cli-wrangler) to build and deploy your application to Cloudflare Workers. If you don't have it yet, follow [the installation guide](https://developers.cloudflare.com/workers/cli-wrangler/install-update) to get it setup. Be sure to [authenticate the CLI](https://developers.cloudflare.com/workers/cli-wrangler/authentication) as well.

If you don't already have an account, then [create a cloudflare account here](https://dash.cloudflare.com/sign-up) and after verifying your email address with Cloudflare, go to your dashboard and set up your free custom Cloudflare Workers subdomain.

Once that's done, you should be able to deploy your app:

```sh
npm run deploy
```

## Conform to emotion

### 1. Patch the remix-run compiler

Patch @remix-run/dev compiler (esbuild) so that it can omit emotion's jsx pragma `/** @jsx jsx */`. (Also, make it possible to use use the shorthand syntax `<></>` for React fragments).  
https://github.com/remix-run/remix/issues/1633

```bash
yarn add @emotion/react @emotion/cache @emotion/server
yarn add -D patch-package
```

Create patches/@remix-run+dev+1.1.3.patch
```
diff --git a/node_modules/@remix-run/dev/compiler.js b/node_modules/@remix-run/dev/compiler.js
index 1a6cabc..3cf652f 100644
--- a/node_modules/@remix-run/dev/compiler.js
+++ b/node_modules/@remix-run/dev/compiler.js
@@ -297,6 +297,7 @@ async function createBrowserBuild(config, options) {
     platform: "browser",
     format: "esm",
     external: externals,
+    jsxFactory: "jsx",
     inject: [reactShim],
     loader: loaders.loaders,
     bundle: true,
@@ -329,6 +330,7 @@ async function createServerBuild(config, options) {
     format: config.serverModuleFormat,
     mainFields: config.serverModuleFormat === "esm" ? ["module", "main"] : ["main", "module"],
     target: options.target,
+    jsxFactory: "jsx",
     inject: [reactShim],
     loader: loaders.loaders,
     bundle: true,
diff --git a/node_modules/@remix-run/dev/compiler/shims/react.ts b/node_modules/@remix-run/dev/compiler/shims/react.ts
index eb0f102..b86e5da 100644
--- a/node_modules/@remix-run/dev/compiler/shims/react.ts
+++ b/node_modules/@remix-run/dev/compiler/shims/react.ts
@@ -1,2 +1,3 @@
+import { jsx } from "@emotion/react";
 import * as React from "react";
-export { React };
+export { jsx, React };
```

Update package.json `postinstall`
```diff
  "scripts": {
    "build": "remix build",
    "dev": "remix watch",
-   "postinstall": "remix setup cloudflare-workers",
+   "postinstall": "remix setup cloudflare-workers && npx patch-package",
```

Re-run yarn or npm
```bash
yarn
```

### 2. Configure esbuild for cloudflare workers

Since the runtime of cloudflare workers is not Node, it is judged as a browser when emotion is executed. Therefore, it has to force the cjs module to be imported.  
Since @emotion/server uses Node native modules such as buffer, it needs to disable them. Fortunately, in Remix, there is no problem even if they are not available.

```bash
yarn add -D no-op esbuild esbuild-plugin-alias
```

Create worker.build.js
```js
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
```

Update package.json `build:worker` and `dev:worker`
```diff
  "scripts": {
    "build": "remix build",
    "dev": "remix watch",
    "postinstall": "remix setup cloudflare-workers && npx patch-package",
-   "build:worker": "esbuild --define:process.env.NODE_ENV='\"production\"' --minify --bundle --sourcemap --outdir=dist ./worker",
+   "build:worker": "NODE_ENV=production node worker.build.js",
-   "dev:worker": "esbuild --define:process.env.NODE_ENV='\"development\"' --bundle --sourcemap --outdir=dist ./worker",
+   "dev:worker": "node worker.build.js",
    "start": "miniflare --build-command \"npm run dev:worker\" --watch",
    "deploy": "npm run build && wrangler publish"
  },
```

### 3. Adapt emotion to SSR

When using emotion in SSR, the style needs to be written in the head of the document returned from the server first. Otherwise, the style will be broken until the hydration is completed.  
https://emotion.sh/docs/ssr#advanced-approach

Update app/entry.client.tsx
```tsx
import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";
import { CacheProvider } from '@emotion/react'
import createCache from "@emotion/cache";

const cache = createCache({ key: 'css' })

hydrate(<CacheProvider value={cache}><RemixBrowser /></CacheProvider>, document);
```

Update app/entry.server.tsx
```tsx
import { renderToString } from "react-dom/server";
import { RemixServer } from "remix";
import { CacheProvider } from '@emotion/react'
import type { EntryContext } from "remix"
import createEmotionServer from '@emotion/server/create-instance'
import createCache from "@emotion/cache";

const cache = createCache({ key: 'css' })
const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache)

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(
    <CacheProvider value={cache}>
      <RemixServer context={remixContext} url={request.url} />
    </CacheProvider>
  );

  const chunks = extractCriticalToChunks(markup)
  const styles = constructStyleTagsFromChunks(chunks)

  responseHeaders.set("Content-Type", "text/html");

  return new Response("<!DOCTYPE html>" + markup.replace('<\/head>', styles + '</head>'), {
    status: responseStatusCode,
    headers: responseHeaders
  });
}
```