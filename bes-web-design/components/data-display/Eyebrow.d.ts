import * as React from "react";

/**
 * BPC Eyebrow — all-caps, generously tracked label above headlines and as a
 * section marker. A signature BPC typographic device.
 */
export interface EyebrowProps {
  /** Label text. */
  children?: React.ReactNode;
  /** Color tone. @default "muted" */
  tone?: "muted" | "strong" | "inverse";
  /** Element to render. @default "div" */
  as?: keyof JSX.IntrinsicElements;
  /** Style overrides. */
  style?: React.CSSProperties;
}

export function Eyebrow(props: EyebrowProps): JSX.Element;
