/* global React */

/**
 * BPC Tag — small status / category indicator. Pill (999px) is the only place
 * BPC uses full rounding. Defaults to a quiet hairline outline; "solid" and
 * "dark" give more presence. Use sparingly.
 */
export function Tag({ children, variant = "outline", shape = "pill", style = {}, ...rest }) {
  const shapes = {
    pill: "var(--bpc-radius-pill)",
    square: "var(--bpc-radius-sm)",
  };
  const variants = {
    outline: {
      background: "transparent",
      color: "var(--bpc-fg-2)",
      border: "1px solid var(--bpc-border-subtle)",
    },
    solid: {
      background: "var(--bpc-oat)",
      color: "var(--bpc-espresso)",
      border: "1px solid transparent",
    },
    dark: {
      background: "var(--bpc-charcoal)",
      color: "var(--bpc-pastel)",
      border: "1px solid var(--bpc-charcoal)",
    },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--bpc-font-sans)",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        lineHeight: 1,
        padding: "7px 14px",
        borderRadius: shapes[shape],
        whiteSpace: "nowrap",
        ...variants[variant],
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
