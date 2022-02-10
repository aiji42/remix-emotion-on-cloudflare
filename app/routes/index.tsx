import { css } from "@emotion/react"
import feedItemDataset from "~/datas/dummy-feed-items.json"
import { FeedItem, Data as feedItemDataType } from "~/components/FeedItem"
import { LoaderFunction, useLoaderData } from "remix"

export const loader: LoaderFunction = async () => {
  return feedItemDataset
}

export default function Home() {
  const data = useLoaderData()

  return (
    <>
      <h2 css={styles.headline}>ホーム</h2>
      {data.map((feedItemData: feedItemDataType) => (
        <FeedItem data={feedItemData} key={feedItemData.title} css={styles.feedItem} />
      ))}
    </>
  );
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
};
