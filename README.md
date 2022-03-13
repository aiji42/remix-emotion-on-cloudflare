# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Development

You will be running two processes during development:

- The Miniflare server (miniflare is a local environment for Cloudflare Workers)
- The Remix development server

Both are started with one command:

```sh
$ npm run dev
```

Open up [http://127.0.0.1:8787](http://127.0.0.1:8787) and you should be ready to go!

If you want to check the production build, you can stop the dev server and run following commands:

```sh
$ npm run build
$ npm start
```

Then refresh the same URL in your browser (no live reload for production builds).

## Deployment

Use [wrangler](https://developers.cloudflare.com/workers/cli-wrangler) to build and deploy your application to Cloudflare Workers. If you don't have it yet, follow [the installation guide](https://developers.cloudflare.com/workers/cli-wrangler/install-update) to get it setup. Be sure to [authenticate the CLI](https://developers.cloudflare.com/workers/cli-wrangler/authentication) as well.

If you don't already have an account, then [create a cloudflare account here](https://dash.cloudflare.com/sign-up) and after verifying your email address with Cloudflare, go to your dashboard and set up your free custom Cloudflare Workers subdomain.

Once that's done, you should be able to deploy your app:

```sh
npm run deploy
```

## Conform to emotion

### 1. Install emotion packages

```bash
yarn add @emotion/react @emotion/cache @emotion/server
```

### 2. Override remix compiler options

```bash
yarn add -D remix-esbuild-override no-op esbuild-plugin-alias 
```

Update `scripts.postinstall` in package.json. Then run `yarn instal` again to run `postinstall`.

```json
"scripts": {
  "postinstall": "yarn remix setup cloudflare-workers && yarn remix-esbuild-override"
}
```

Add `reactShims.ts` in root directory

```ts
// reactShims.ts
import { jsx } from "@emotion/react";
import * as React from "react";
export { jsx, React };
```

Update `remix.config.js`

```js
// remix.config.js
const path = require("node:path");
const alias = require("esbuild-plugin-alias");

/**
 * @type {import('remix-esbuild-override').AppConfig}
 */
module.exports = {
  serverBuildTarget: "cloudflare-workers",
  server: "./server.js",
  devServerBroadcastDelay: 1000,
  ignoredRouteFiles: [".*"],
  esbuildOverride: (option, { isServer }) => {
    option.jsxFactory = "jsx";
    option.inject = [path.resolve(__dirname, "reactShims.ts")];
    option.plugins = [
      alias({
        through: require.resolve("no-op"),
        "html-tokenize": require.resolve("no-op"),
        multipipe: require.resolve("no-op"),
      }),
      ...option.plugins,
    ];
    if (isServer) option.mainFields = ["browser", "module", "main"];

    return option;
  },
};
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