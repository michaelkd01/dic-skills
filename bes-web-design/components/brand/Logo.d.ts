import * as React from "react";

/**
 * BPC Logo — renders the correct official logo SVG for a given lockup and
 * colourway. Points at the approved assets; never recreates the mark.
 */
export interface LogoProps {
  /** Which lockup. @default "lockup" */
  variant?: "lockup" | "horizontal" | "iso" | "textmark" | "box";
  /** Colourway. black/white are primary; db/lb/o are the secondary brown palette (lockup & iso only). @default "black" */
  color?: "black" | "white" | "db" | "lb" | "o";
  /** Rendered height in px. @default 48 */
  height?: number;
  /** Path to the assets/logos folder relative to the page. @default "assets/logos" */
  basePath?: string;
  /** Alt text. @default "Bespoke Property Concierge" */
  alt?: string;
  /** Style overrides. */
  style?: React.CSSProperties;
}

export function Logo(props: LogoProps): JSX.Element;
