import * as React from "react";

/**
 * BPC Textarea — multi-line companion to Input. Same hairline / charcoal-focus
 * treatment; vertical resize only.
 */
export interface TextareaProps {
  /** Eyebrow-style label rendered above the field. */
  label?: string;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Placeholder text. */
  placeholder?: string;
  /** Visible rows. @default 4 */
  rows?: number;
  /** Disabled state. @default false */
  disabled?: boolean;
  /** Invalid state. @default false */
  invalid?: boolean;
  /** Change handler. */
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  /** Field id (auto-derived from label if omitted). */
  id?: string;
  /** Wrapper style overrides. */
  style?: React.CSSProperties;
}

export function Textarea(props: TextareaProps): JSX.Element;
