/* global React */
const { useState } = React;

/**
 * BPC Button — hard-edged, restrained. Primary inverts fill↔ground on hover;
 * press shrinks to 96%. CTA labels are often the all-caps tracked "eyebrow"
 * treatment (uppercase prop).
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  uppercase = false,
  disabled = false,
  type = "button",
  onClick,
  style = {},
  ...rest
}) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);

  const sizes = {
    sm: { fontSize: 12, padding: "8px 16px" },
    md: { fontSize: 14, padding: "13px 24px" },
    lg: { fontSize: 15, padding: "17px 32px" },
  };

  const base = {
    fontFamily: "var(--bpc-font-sans)",
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: uppercase ? "0.18em" : "0.01em",
    textTransform: uppercase ? "uppercase" : "none",
    borderRadius: "var(--bpc-radius-sm)",
    border: "1px solid var(--bpc-charcoal)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition:
      "background var(--bpc-duration-base) var(--bpc-ease-standard), color var(--bpc-duration-base) var(--bpc-ease-standard), opacity var(--bpc-duration-fast) var(--bpc-ease-standard), transform var(--bpc-duration-fast) var(--bpc-ease-standard)",
    transform: press && !disabled ? "scale(0.96)" : "scale(1)",
    opacity: disabled ? 0.4 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    whiteSpace: "nowrap",
    ...sizes[size],
  };

  const variants = {
    primary: {
      background: hover && !disabled ? "var(--bpc-pastel)" : "var(--bpc-charcoal)",
      color: hover && !disabled ? "var(--bpc-charcoal)" : "var(--bpc-pastel)",
      borderColor: "var(--bpc-charcoal)",
    },
    secondary: {
      background: hover && !disabled ? "var(--bpc-charcoal)" : "transparent",
      color: hover && !disabled ? "var(--bpc-pastel)" : "var(--bpc-charcoal)",
      borderColor: "var(--bpc-charcoal)",
    },
    ghost: {
      background: "transparent",
      color: "var(--bpc-charcoal)",
      borderColor: "transparent",
      opacity: disabled ? 0.4 : hover ? 0.6 : 1,
      padding: sizes[size].padding.replace(/\d+px$/, "8px"),
    },
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{ ...base, ...variants[variant], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}
