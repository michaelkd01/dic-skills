import * as React from "react";

/**
 * BPC Button — hard-edged, restrained primary/secondary/ghost button.
 * Primary inverts fill↔ground on hover; press shrinks to 96%.
 *
 * @startingPoint section="Buttons" subtitle="Primary / secondary / ghost · sm·md·lg" viewport="700x200"
 */
export interface ButtonProps {
  /** Button label / contents. */
  children?: React.ReactNode;
  /** Visual style. @default "primary" */
  variant?: "primary" | "secondary" | "ghost";
  /** Size. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Render the label as all-caps tracked eyebrow text (common for CTAs). @default false */
  uppercase?: boolean;
  /** Disabled state. @default false */
  disabled?: boolean;
  /** Native button type. @default "button" */
  type?: "button" | "submit" | "reset";
  /** Click handler. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Style overrides merged last. */
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
