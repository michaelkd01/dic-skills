import * as React from "react";

interface SelectOption {
  value: string;
  label: string;
}

/**
 * BPC Select — native dropdown styled to match Input, with a hand-drawn
 * chevron. Hairline border, charcoal focus.
 */
export interface SelectProps {
  /** Eyebrow-style label rendered above the control. */
  label?: string;
  /** Controlled value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Options as strings or {value,label} objects. */
  options?: (string | SelectOption)[];
  /** Disabled state. @default false */
  disabled?: boolean;
  /** Change handler. */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Field id (auto-derived from label if omitted). */
  id?: string;
  /** Wrapper style overrides. */
  style?: React.CSSProperties;
}

export function Select(props: SelectProps): JSX.Element;
