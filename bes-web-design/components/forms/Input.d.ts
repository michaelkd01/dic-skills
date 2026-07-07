import * as React from "react";

/**
 * BPC Input — hairline-bordered text field with optional eyebrow label.
 * Focus raises the border to charcoal; no glow.
 */
export interface InputProps {
  /** Eyebrow-style label rendered above the field. */
  label?: string;
  /** Input type. @default "text" */
  type?: string;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Disabled state. @default false */
  disabled?: boolean;
  /** Invalid state (border stays charcoal). @default false */
  invalid?: boolean;
  /** Change handler. */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Field id (auto-derived from label if omitted). */
  id?: string;
  /** Wrapper style overrides. */
  style?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
