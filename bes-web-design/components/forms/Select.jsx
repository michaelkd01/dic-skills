/* global React */
const { useState } = React;

/**
 * BPC Select — native dropdown styled to match Input. Hairline border,
 * charcoal focus, hard edges. Pass options as [{value,label}] or strings.
 */
export function Select({
  label,
  value,
  defaultValue,
  options = [],
  disabled = false,
  onChange,
  style = {},
  id,
  ...rest
}) {
  const [focus, setFocus] = useState(false);
  const inputId = id || (label ? "sel-" + label.replace(/\s+/g, "-").toLowerCase() : undefined);
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));

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
      <div style={{ position: "relative" }}>
        <select
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            appearance: "none",
            WebkitAppearance: "none",
            fontFamily: "var(--bpc-font-sans)",
            fontSize: 16,
            color: "var(--bpc-fg-1)",
            background: disabled ? "var(--bpc-oat-20)" : "var(--bpc-bg-2)",
            border: "1px solid " + (focus ? "var(--bpc-charcoal)" : "var(--bpc-border-subtle)"),
            borderRadius: "var(--bpc-radius-sm)",
            padding: "13px 40px 13px 16px",
            outline: "none",
            width: "100%",
            boxSizing: "border-box",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "border-color var(--bpc-duration-base) var(--bpc-ease-standard)",
          }}
          {...rest}
        >
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            width: 8,
            height: 8,
            borderRight: "1.5px solid var(--bpc-fg-3)",
            borderBottom: "1.5px solid var(--bpc-fg-3)",
            marginTop: -3,
            rotate: "45deg",
          }}
        />
      </div>
    </div>
  );
}
