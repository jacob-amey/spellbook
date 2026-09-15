import type { SVGProps } from "react";

const paths = {
  "arrow-right": "M5 12h14m-6-6 6 6-6 6",
  "arrow-left": "M19 12H5m6-6-6 6 6 6",
  shuffle: "m17 3 4 4-4 4M3 17h3c5 0 7-10 12-10h3M3 7h3c1.5 0 2.8.9 4 2.3M14 14.7c1.2 1.4 2.5 2.3 4 2.3h3m-4-4 4 4-4 4",
  cards: "M8 4h11v15H8zM5 7H3v14h11",
  filters: "M4 7h9m4 0h3M4 17h3m4 0h9M13 4v6M7 14v6",
} as const;

export function Icon({ name, className = "h-4 w-4", ...props }: SVGProps<SVGSVGElement> & { name: keyof typeof paths }) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  );
}
