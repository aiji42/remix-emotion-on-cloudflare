import { css } from "@emotion/react"
import feedItemDataset from "~/datas/dummy-feed-items.json"
import { FeedItem, Data } from "~/components/FeedItem"
import { LoaderFunction, useLoaderData, Link } from "remix"

export const loader: LoaderFunction = async () => {
  return feedItemDataset
}

export default function Home() {
  const data = useLoaderData<Data[]>()

  return (
    <>
      <h2 css={styles.headline}>ホーム</h2>
      <FeedItem
        data={{
          ...data[data.length - 1],
          url: "/not-found",
          title: "link to not found page",
          thumbnail: undefined,
        }}
        css={styles.feedItem}
      />
      <FeedItem
        data={{
          ...data[data.length - 1],
          url: "/error",
          title: "link to internal server error page",
          thumbnail: undefined,
        }}
        css={styles.feedItem}
      />
      <FeedItem
        data={{
          ...data[data.length - 1],
          url: "/client-error",
          title: "link to client error page",
          thumbnail: undefined,
        }}
        css={styles.feedItem}
      />
      {data.map((feedItemData) => (
        <FeedItem data={feedItemData} key={feedItemData.title} css={styles.feedItem} />
      ))}
    </>
  )
}

const styles = {
  headline: css`
    font-size: var(--font-size-subhead);
    font-weight: bold;
  `,
  feedItem: css`
    margin-top: 16px;
  `,
  error: css`
    font-weight: bold;
    color: coral;
  `,
}
