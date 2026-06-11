"use client";

import NextTopLoader from "nextjs-toploader";

export default function ProgressBar() {
  return (
    <NextTopLoader
      color="linear-gradient(to right, var(--color-secondary-1, #f2bc57), var(--color-primary-1, #d3242c))"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px var(--color-primary-2, #dc5056), 0 0 5px var(--color-secondary-1, #f2bc57)"
    />
  );
}

