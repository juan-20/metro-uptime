"use client"

import NextNProgress from 'nextjs-progressbar';

export default function ProgressBar() {
  return (
    <NextNProgress
      color="#29D"
      stopDelayMs={200}
      height={3}
      showOnShallow={true}
    />
  );
} 