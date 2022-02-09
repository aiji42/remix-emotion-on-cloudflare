import { hydrate } from "react-dom";
import { RemixBrowser } from "remix";
import { CacheProvider } from '@emotion/react'
import { cache } from  '~/emotion/cache'

hydrate(<CacheProvider value={cache}><RemixBrowser /></CacheProvider>, document);
