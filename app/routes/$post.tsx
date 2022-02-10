import React from "react"
import { css } from "@emotion/react"
import feedItemDataset from "~/datas/dummy-feed-items.json"
import { FeedItem, Data as feedItemDataType } from "~/components/FeedItem"
import { LoaderFunction, useCatch, useLoaderData } from "remix"

export const loader: LoaderFunction = async ({ params }) => {
  const postData = feedItemDataset.find(({ url }) => url.includes(params.post ?? "dummy"))
  if (!postData) throw new Response("Post is not found", { status: 404 })
  if (Math.random() > 0.7)
    throw new Response("これはCatchBoundaryの検証のためにランダムで発生させているエラーです", {
      status: 500,
    })

  return postData
}

export default function Post() {
  const data = useLoaderData<feedItemDataType>()

  return (
    <>
      <h2 css={styles.headline}>{data.title}</h2>
      <FeedItem data={data} single css={styles.feedItem} />
    </>
  )
}

export const ErrorBoundary = ({ error }: { error: Error }) => {
  return <span css={styles.error}>Nested Post ErrorBoundary: {error.message}</span>
}

export const CatchBoundary = () => {
  const caught = useCatch()
  return (
    <>
      <p css={styles.error}>Nested Post CatchBoundary: status code is {caught.status}</p>
      <p>{caught.data}</p>
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
