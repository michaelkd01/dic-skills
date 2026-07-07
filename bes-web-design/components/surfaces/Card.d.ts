import * as React from "react";

/**
 * BPC Card — flat hairline surface (radius 0, no shadow) with optional
 * image-led layout. Hover raises the border to charcoal.
 *
 * @startingPoint section="Surfaces" subtitle="Flat hairline · image-led · elevated" viewport="700x260"
 */
export interface CardProps {
  /** Free-form body content below the header block. */
  children?: React.ReactNode;
  /** Surface style. @default "flat" */
  variant?: "flat" | "elevated" | "image";
  /** Image URL — renders an image-led header (4:3, hairline bottom edge). */
  image?: string;
  /** Alt text for the image. */
  imageAlt?: string;
  /** Eyebrow label above the title. */
  eyebrow?: string;
  /** Card title (Familjen Grotesk semibold). */
  title?: string;
  /** Meta / supporting line below the title. */
  meta?: string;
  /** Enable hover border/shadow + pointer cursor. @default false */
  interactive?: boolean;
  /** Click handler. */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Style overrides. */
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
