import * as React from "react";

/**
 * BPC Tag — small status / category indicator. Pill is the only place BPC uses
 * full rounding. Use sparingly.
 */
export interface TagProps {
  /** Tag label. */
  children?: React.ReactNode;
  /** Visual style. @default "outline" */
  variant?: "outline" | "solid" | "dark";
  /** Corner shape. @default "pill" */
  shape?: "pill" | "square";
  /** Style overrides. */
  style?: React.CSSProperties;
}

export function Tag(props: TagProps): JSX.Element;
