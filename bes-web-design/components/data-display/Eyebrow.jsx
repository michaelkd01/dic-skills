/* global React */

/**
 * BPC Eyebrow — the all-caps, generously tracked label used above headlines
 * and as section markers. A signature BPC typographic device.
 */
export function Eyebrow({ children, tone = "muted", as = "div", style = {}, ...rest }) {
  const colors = {
    muted: "var(--bpc-fg-3)",
    strong: "var(--bpc-fg-1)",
    inverse: "var(--bpc-oat-40)",
  };
  const Tag = as;
  return (
    <Tag
      style={{
        fontFamily: "var(--bpc-font-sans)",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: colors[tone] || colors.muted,
        margin: 0,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
