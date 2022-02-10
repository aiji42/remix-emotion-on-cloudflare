import React, { FC } from "react"
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch } from "remix"
import type { MetaFunction } from "remix"
import { css, Global } from "@emotion/react"
import { globalStyles } from "~/components/GlobalStyle"
import { Header } from "~/components/Header"
import { Navigation } from "~/components/Navigation"
import { Ranking } from "~/components/Ranking"
import rankingDataset from "~/datas/dummy-ranking.json"
import { Footer } from "~/components/Footer"

export const meta: MetaFunction = () => {
  return { title: "New Remix App" }
}

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Sans:wght@400;700&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/icon?family=Material+Icons+Round",
    },
  ]
}

const Wrapper: FC = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        <Global styles={globalStyles} />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Wrapper>
      <Header />
      <div css={styles.contents}>
        <Navigation css={styles.navigation} />
        <main css={styles.main}>
          <Outlet />
        </main>
        <aside css={styles.sidebar}>
          <Ranking dataset={rankingDataset} />
          <Footer css={styles.footer} />
        </aside>
      </div>
    </Wrapper>
  )
}

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return (
    <Wrapper>
      <Header />
      <div css={styles.contents}>
        <Navigation css={styles.navigation} />
        <main css={[styles.main, errorStyle.main]}>{error.message}</main>
        <aside css={styles.sidebar}>
          <Ranking dataset={rankingDataset} />
          <Footer css={styles.footer} />
        </aside>
      </div>
    </Wrapper>
  )
}

export const CatchBoundary = () => {
  const caught = useCatch()
  return (
    <Wrapper>
      <Header />
      <div css={styles.contents}>
        <main css={[styles.main, errorStyle.main]}>
          CatchBoundary: {caught.status} {caught.data}
        </main>
      </div>
    </Wrapper>
  )
}

const styles = {
  contents: css`
    display: grid;
    grid-column-gap: 16px;
    grid-template-areas: "navigation navigation main main main main main main sidebar sidebar sidebar sidebar";
    grid-template-columns: repeat(12, minmax(48px, 80px));
    justify-content: center;
    padding: 24px 16px 48px;
  `,
  navigation: css`
    align-self: start;
    display: flex;
    flex-direction: column;
    grid-area: navigation;
    position: sticky;
    top: 88px;
  `,
  main: css`
    grid-area: main;
  `,
  sidebar: css`
    grid-area: sidebar;
  `,
  footer: css`
    margin-top: 16px;
  `,
}

const errorStyle = {
  main: css`
    font-weight: bold;
    color: red;
  `,
}
