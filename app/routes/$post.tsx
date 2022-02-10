import React from "react"
import { css } from "@emotion/react"
import feedItemDataset from "~/datas/dummy-feed-items.json"
import { FeedItem, Data as feedItemDataType } from "~/components/FeedItem"
import { LoaderFunction, useCatch, useLoaderData, useParams } from "remix"

export const loader: LoaderFunction = async ({ params }) => {
  if (params.post === "client-error") return {}
  const postData = feedItemDataset.find(({ url }) => url.includes(params.post ?? "dummy"))
  if (params.post === "error")
    throw new Response(null, {
      status: 500,
    })
  if (!postData) throw new Response(null, { status: 404 })

  return postData
}

export default function Post() {
  const data = useLoaderData<feedItemDataType>()
  const params = useParams()

  if (params.post === "client-error") throw new Error("client error")

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
      <p>{caught.statusText}</p>
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
