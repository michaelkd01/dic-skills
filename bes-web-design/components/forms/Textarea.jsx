/* global React */
const { useState } = React;

/**
 * BPC Textarea — multi-line companion to Input. Same hairline / focus
 * treatment; vertical resize only.
 */
export function Textarea({
  label,
  value,
  defaultValue,
  placeholder,
  rows = 4,
  disabled = false,
  invalid = false,
  onChange,
  style = {},
  id,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const inputId = id || (label ? "ta-" + label.replace(/\s+/g, "-").toLowerCase() : undefined);
  const borderColor = invalid || focus ? "var(--bpc-charcoal)" : "var(--bpc-border-subtle)";

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
      <textarea
        id={inputId}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          fontFamily: "var(--bpc-font-sans)",
          fontSize: 16,
          lineHeight: 1.5,
          color: "var(--bpc-fg-1)",
          background: disabled ? "var(--bpc-oat-20)" : "var(--bpc-bg-2)",
          border: "1px solid " + borderColor,
          borderRadius: "var(--bpc-radius-sm)",
          padding: "13px 16px",
          outline: "none",
          width: "100%",
          boxSizing: "border-box",
          resize: "vertical",
          transition: "border-color var(--bpc-duration-base) var(--bpc-ease-standard)",
        }}
        {...rest}
      />
    </div>
  );
}
