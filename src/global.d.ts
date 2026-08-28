import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      marquee: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { scrollamount?: string }, HTMLElement>;
    }
  }
}
