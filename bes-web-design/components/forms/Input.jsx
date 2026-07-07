/* global React */
const { useState } = React;

/**
 * BPC Input — hairline-bordered text field with optional label and eyebrow
 * casing. Focus raises the border to charcoal (no glow, no heavy shadow).
 */
export function Input({
  label,
  type = "text",
  value,
  defaultValue,
  placeholder,
  disabled = false,
  invalid = false,
  onChange,
  style = {},
  id,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const inputId = id || (label ? "in-" + label.replace(/\s+/g, "-").toLowerCase() : undefined);

  const borderColor = invalid
    ? "var(--bpc-charcoal)"
    : focus
    ? "var(--bpc-charcoal)"
    : "var(--bpc-border-subtle)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: "var(--bpc-font-sans)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--bpc-fg-3)",
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          fontFamily: "var(--bpc-font-sans)",
          fontSize: 16,
          color: "var(--bpc-fg-1)",
          background: disabled ? "var(--bpc-oat-20)" : "var(--bpc-bg-2)",
          border: "1px solid " + borderColor,
          borderRadius: "var(--bpc-radius-sm)",
          padding: "13px 16px",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          transition: "border-color var(--bpc-duration-base) var(--bpc-ease-standard)",
        }}
        {...rest}
      />
    </div>
  );
}
