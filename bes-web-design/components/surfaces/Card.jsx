/* global React */
const { useState } = React;

/**
 * BPC Card — flat hairline surface by default (radius 0, no shadow). Hover
 * raises the border to charcoal — no shadow jump. Supports an image-led
 * layout (image top, hairline bottom edge) and a rare elevated variant.
 */
export function Card({
  children,
  variant = "flat",        // "flat" | "elevated" | "image"
  image,
  imageAlt = "",
  eyebrow,
  title,
  meta,
  interactive = false,
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = useState(false);

  const base = {
    background: "var(--bpc-bg-2)",
    borderRadius: "var(--bpc-radius-none)",
    overflow: "hidden",
    transition:
      "border-color var(--bpc-duration-base) var(--bpc-ease-standard), box-shadow var(--bpc-duration-base) var(--bpc-ease-standard)",
    cursor: interactive ? "pointer" : "default",
    ...style,
  };

  const variantStyle =
    variant === "elevated"
      ? {
          border: "1px solid transparent",
          boxShadow: hover && interactive ? "var(--bpc-shadow-lg)" : "var(--bpc-shadow-md)",
        }
      : {
          border:
            "1px solid " +
            (hover && interactive ? "var(--bpc-charcoal)" : "var(--bpc-border-hairline)"),
        };

  const hasHeader = eyebrow || title || meta;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variantStyle }}
      {...rest}
    >
      {(variant === "image" || image) && image && (
        <div style={{ aspectRatio: "4 / 3", overflow: "hidden", borderBottom: "1px solid var(--bpc-border-hairline)" }}>
          <img
            src={image}
            alt={imageAlt}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      )}
      {(hasHeader || children) && (
        <div style={{ padding: "var(--bpc-space-6)" }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--bpc-fg-3)",
                marginBottom: 16,
              }}
            >
              {eyebrow}
            </div>
          )}
          {title && (
            <div
              style={{
                fontFamily: "var(--bpc-font-sans)",
                fontWeight: 600,
                fontSize: 20,
                lineHeight: 1.2,
                color: "var(--bpc-fg-1)",
                marginBottom: meta || children ? 10 : 0,
              }}
            >
              {title}
            </div>
          )}
          {meta && (
            <div style={{ fontSize: 14, color: "var(--bpc-fg-3)", lineHeight: 1.5 }}>{meta}</div>
          )}
          {children && <div style={{ marginTop: hasHeader ? 16 : 0 }}>{children}</div>}
        </div>
      )}
    </div>
  );
}
