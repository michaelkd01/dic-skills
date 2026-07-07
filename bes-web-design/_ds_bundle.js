/* @ds-bundle: {"format":3,"namespace":"BPCDesignSystem_ec4586","components":[{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"Eyebrow","sourcePath":"components/data-display/Eyebrow.jsx"},{"name":"Tag","sourcePath":"components/data-display/Tag.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"}],"sourceHashes":{"components/brand/Logo.jsx":"2528bfe1d63c","components/buttons/Button.jsx":"cc6a92f33a17","components/data-display/Eyebrow.jsx":"a0afbb792eac","components/data-display/Tag.jsx":"ebe8fb61bd57","components/forms/Input.jsx":"9b681cccc38e","components/forms/Select.jsx":"9e109f4511ec","components/forms/Textarea.jsx":"3ca4bc75a6e9","components/surfaces/Card.jsx":"513c645d57eb","ui_kits/website/sections.jsx":"a16ffc1a2e9b"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.BPCDesignSystem_ec4586 = window.BPCDesignSystem_ec4586 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */

/**
 * BPC Logo — renders the correct official logo asset for a given lockup +
 * colourway. Never recreates the mark in code; it points at the approved SVGs.
 * Pass `basePath` to match where assets/logos lives relative to the page.
 *
 * Brand rules enforced by usage (not code): never stretch, never drop-shadow,
 * never place a dark variant on a dark background.
 */
function Logo({
  variant = "lockup",
  // "lockup" | "horizontal" | "iso" | "textmark" | "box"
  color = "black",
  // "black" | "white" | "db" | "lb" | "o"
  height = 48,
  basePath = "assets/logos",
  alt = "Bespoke Property Concierge",
  style = {},
  ...rest
}) {
  const C = String(color).toUpperCase(); // BLACK | WHITE | DB | LB | O
  const fileMap = {
    lockup: "BPC_LOGOLOCKUP_" + C + ".svg",
    horizontal: "BPC_HORIZONTALLOGO_" + C + ".svg",
    iso: "BPC_LOGOISO_" + C + ".svg",
    textmark: "BPC_TEXTMARK_" + C + ".svg",
    box: "BPC_BOX_" + C + ".svg"
  };
  const file = fileMap[variant] || fileMap.lockup;
  return /*#__PURE__*/React.createElement("img", _extends({
    src: basePath.replace(/\/$/, "") + "/" + file,
    alt: alt,
    style: {
      height,
      width: "auto",
      display: "block",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
const {
  useState
} = React;

/**
 * BPC Button — hard-edged, restrained. Primary inverts fill↔ground on hover;
 * press shrinks to 96%. CTA labels are often the all-caps tracked "eyebrow"
 * treatment (uppercase prop).
 */
function Button({
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
    sm: {
      fontSize: 12,
      padding: "8px 16px"
    },
    md: {
      fontSize: 14,
      padding: "13px 24px"
    },
    lg: {
      fontSize: 15,
      padding: "17px 32px"
    }
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
    transition: "background var(--bpc-duration-base) var(--bpc-ease-standard), color var(--bpc-duration-base) var(--bpc-ease-standard), opacity var(--bpc-duration-fast) var(--bpc-ease-standard), transform var(--bpc-duration-fast) var(--bpc-ease-standard)",
    transform: press && !disabled ? "scale(0.96)" : "scale(1)",
    opacity: disabled ? 0.4 : 1,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    whiteSpace: "nowrap",
    ...sizes[size]
  };
  const variants = {
    primary: {
      background: hover && !disabled ? "var(--bpc-pastel)" : "var(--bpc-charcoal)",
      color: hover && !disabled ? "var(--bpc-charcoal)" : "var(--bpc-pastel)",
      borderColor: "var(--bpc-charcoal)"
    },
    secondary: {
      background: hover && !disabled ? "var(--bpc-charcoal)" : "transparent",
      color: hover && !disabled ? "var(--bpc-pastel)" : "var(--bpc-charcoal)",
      borderColor: "var(--bpc-charcoal)"
    },
    ghost: {
      background: "transparent",
      color: "var(--bpc-charcoal)",
      borderColor: "transparent",
      opacity: disabled ? 0.4 : hover ? 0.6 : 1,
      padding: sizes[size].padding.replace(/\d+px$/, "8px")
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */

/**
 * BPC Eyebrow — the all-caps, generously tracked label used above headlines
 * and as section markers. A signature BPC typographic device.
 */
function Eyebrow({
  children,
  tone = "muted",
  as = "div",
  style = {},
  ...rest
}) {
  const colors = {
    muted: "var(--bpc-fg-3)",
    strong: "var(--bpc-fg-1)",
    inverse: "var(--bpc-oat-40)"
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    style: {
      fontFamily: "var(--bpc-font-sans)",
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: colors[tone] || colors.muted,
      margin: 0,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */

/**
 * BPC Tag — small status / category indicator. Pill (999px) is the only place
 * BPC uses full rounding. Defaults to a quiet hairline outline; "solid" and
 * "dark" give more presence. Use sparingly.
 */
function Tag({
  children,
  variant = "outline",
  shape = "pill",
  style = {},
  ...rest
}) {
  const shapes = {
    pill: "var(--bpc-radius-pill)",
    square: "var(--bpc-radius-sm)"
  };
  const variants = {
    outline: {
      background: "transparent",
      color: "var(--bpc-fg-2)",
      border: "1px solid var(--bpc-border-subtle)"
    },
    solid: {
      background: "var(--bpc-oat)",
      color: "var(--bpc-espresso)",
      border: "1px solid transparent"
    },
    dark: {
      background: "var(--bpc-charcoal)",
      color: "var(--bpc-pastel)",
      border: "1px solid var(--bpc-charcoal)"
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
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
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
const {
  useState
} = React;

/**
 * BPC Input — hairline-bordered text field with optional label and eyebrow
 * casing. Focus raises the border to charcoal (no glow, no heavy shadow).
 */
function Input({
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
  const borderColor = invalid ? "var(--bpc-charcoal)" : focus ? "var(--bpc-charcoal)" : "var(--bpc-border-subtle)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: "var(--bpc-font-sans)",
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--bpc-fg-3)"
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
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
      transition: "border-color var(--bpc-duration-base) var(--bpc-ease-standard)"
    }
  }, rest)));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
const {
  useState
} = React;

/**
 * BPC Select — native dropdown styled to match Input. Hairline border,
 * charcoal focus, hard edges. Pass options as [{value,label}] or strings.
 */
function Select({
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
  const opts = options.map(o => typeof o === "string" ? {
    value: o,
    label: o
  } : o);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: "var(--bpc-font-sans)",
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--bpc-fg-3)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: inputId,
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
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
      transition: "border-color var(--bpc-duration-base) var(--bpc-ease-standard)"
    }
  }, rest), opts.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
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
      rotate: "45deg"
    }
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
const {
  useState
} = React;

/**
 * BPC Textarea — multi-line companion to Input. Same hairline / focus
 * treatment; vertical resize only.
 */
function Textarea({
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
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 8,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: "var(--bpc-font-sans)",
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--bpc-fg-3)"
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: inputId,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    rows: rows,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
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
      transition: "border-color var(--bpc-duration-base) var(--bpc-ease-standard)"
    }
  }, rest)));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React */
const {
  useState
} = React;

/**
 * BPC Card — flat hairline surface by default (radius 0, no shadow). Hover
 * raises the border to charcoal — no shadow jump. Supports an image-led
 * layout (image top, hairline bottom edge) and a rare elevated variant.
 */
function Card({
  children,
  variant = "flat",
  // "flat" | "elevated" | "image"
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
    transition: "border-color var(--bpc-duration-base) var(--bpc-ease-standard), box-shadow var(--bpc-duration-base) var(--bpc-ease-standard)",
    cursor: interactive ? "pointer" : "default",
    ...style
  };
  const variantStyle = variant === "elevated" ? {
    border: "1px solid transparent",
    boxShadow: hover && interactive ? "var(--bpc-shadow-lg)" : "var(--bpc-shadow-md)"
  } : {
    border: "1px solid " + (hover && interactive ? "var(--bpc-charcoal)" : "var(--bpc-border-hairline)")
  };
  const hasHeader = eyebrow || title || meta;
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...base,
      ...variantStyle
    }
  }, rest), (variant === "image" || image) && image && /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: "4 / 3",
      overflow: "hidden",
      borderBottom: "1px solid var(--bpc-border-hairline)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block"
    }
  })), (hasHeader || children) && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--bpc-space-6)"
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      color: "var(--bpc-fg-3)",
      marginBottom: 16
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--bpc-font-sans)",
      fontWeight: 600,
      fontSize: 20,
      lineHeight: 1.2,
      color: "var(--bpc-fg-1)",
      marginBottom: meta || children ? 10 : 0
    }
  }, title), meta && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: "var(--bpc-fg-3)",
      lineHeight: 1.5
    }
  }, meta), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: hasHeader ? 16 : 0
    }
  }, children)));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/sections.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* global React, DesignSystem_ec4586 */
const {
  useState,
  useEffect
} = React;
const {
  Logo,
  Button,
  Eyebrow,
  Card,
  Tag,
  Input,
  Textarea,
  Select
} = window.BPCDesignSystem_ec4586;
const GUTTER = "clamp(24px, 6vw, 96px)";
const MAXW = 1280;

/* ---- Navigation ------------------------------------------------------- */
function Nav({
  onEnquire
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const onHero = !scrolled;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: "sticky",
      top: 0,
      zIndex: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `20px ${GUTTER}`,
      background: scrolled ? "rgba(249,248,247,0.85)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? "1px solid var(--bpc-border-hairline)" : "1px solid transparent",
      transition: "background 240ms var(--bpc-ease-standard), border-color 240ms"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "horizontal",
    color: onHero ? "white" : "black",
    height: 32,
    basePath: "../../assets/logos"
  }), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      gap: 40
    }
  }, ["Our service", "Approach", "Residences", "Journal"].map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    style: {
      fontSize: 13,
      fontWeight: 500,
      letterSpacing: "0.02em",
      borderBottom: "none",
      color: onHero ? "var(--bpc-pastel)" : "var(--bpc-charcoal)",
      transition: "color 240ms"
    }
  }, l))), /*#__PURE__*/React.createElement(Button, {
    variant: onHero ? "primary" : "secondary",
    size: "sm",
    uppercase: true,
    onClick: onEnquire,
    style: onHero ? {
      background: "var(--bpc-pastel)",
      color: "var(--bpc-charcoal)",
      borderColor: "var(--bpc-pastel)"
    } : {}
  }, "Enquire"));
}

/* ---- Hero -------------------------------------------------------------- */
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      position: "relative",
      minHeight: 760,
      height: "100vh",
      marginTop: -72,
      background: "linear-gradient(180deg, rgba(24,24,24,0.20) 0%, rgba(24,24,24,0.44) 100%), url('../../assets/imagery/house_JLeung.jpg') center/cover",
      display: "flex",
      alignItems: "flex-end",
      padding: `0 ${GUTTER} clamp(64px,10vh,120px)`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 820
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "inverse",
    style: {
      color: "rgba(255,255,255,0.82)",
      letterSpacing: "0.26em",
      marginBottom: 36
    }
  }, "Bespoke Property Concierge"), /*#__PURE__*/React.createElement("h1", {
    className: "bpc-display",
    style: {
      fontSize: "clamp(48px,8vw,88px)",
      color: "var(--bpc-pastel)",
      margin: 0
    }
  }, "Tailored", /*#__PURE__*/React.createElement("br", null), "stewardship for", /*#__PURE__*/React.createElement("br", null), "prestige homes.")));
}

/* ---- Intro ------------------------------------------------------------- */
function Intro() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: `clamp(96px,16vh,200px) ${GUTTER}`,
      maxWidth: MAXW,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 780,
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 40,
      letterSpacing: "0.26em"
    }
  }, "No two homes are the same"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "clamp(22px,2.6vw,28px)",
      lineHeight: 1.5,
      color: "var(--bpc-fg-1)",
      margin: 0,
      fontWeight: 400,
      letterSpacing: "-0.005em"
    }
  }, "Bespoke Property Concierge brings tailored stewardship to premium, high-value residential homes. Through the careful oversight of maintenance, improvements and long-term care, BPC delivers an unmatched experience for homeowners who expect the very best.")));
}

/* ---- Service pillars --------------------------------------------------- */
function ServiceGrid() {
  const items = [{
    eyebrow: "01 — Oversight",
    title: "Proactive maintenance, meticulously planned.",
    body: "Quarterly inspections, seasonal schedules, and a single point of accountability for every trade and contractor on your property."
  }, {
    eyebrow: "02 — Improvements",
    title: "Considered upgrades, without the coordination burden.",
    body: "From interior refreshes to full renovations, your Concierge manages scope, panel, and timeline on your behalf."
  }, {
    eyebrow: "03 — Long-term care",
    title: "The steward your home deserves — for decades.",
    body: "A living record of every improvement, every supplier, every decision — handed over between Concierges without friction."
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: `0 ${GUTTER} clamp(96px,16vh,160px)`,
      maxWidth: MAXW,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 80,
      maxWidth: 560
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 24
    }
  }, "The service"), /*#__PURE__*/React.createElement("div", {
    className: "bpc-display",
    style: {
      fontSize: "clamp(36px,5vw,52px)"
    }
  }, "Three pillars of care")), items.map(i => /*#__PURE__*/React.createElement("div", {
    key: i.eyebrow,
    style: {
      padding: "64px 0 72px",
      borderTop: "1px solid var(--bpc-border-hairline)",
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)",
      gap: 64,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      letterSpacing: "0.2em",
      paddingTop: 8
    }
  }, i.eyebrow), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "clamp(26px,3.4vw,36px)",
      fontWeight: 500,
      letterSpacing: "-0.018em",
      lineHeight: 1.15,
      margin: "0 0 28px",
      maxWidth: 620
    }
  }, i.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      lineHeight: 1.7,
      color: "var(--bpc-fg-2)",
      maxWidth: 560,
      margin: 0
    }
  }, i.body)))));
}

/* ---- Philosophy quote (dark) ------------------------------------------ */
function QuoteBlock() {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: "var(--bpc-charcoal)",
      color: "var(--bpc-pastel)",
      padding: `clamp(112px,18vh,200px) ${GUTTER}`,
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 900,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    tone: "inverse",
    style: {
      letterSpacing: "0.26em",
      marginBottom: 48
    }
  }, "Our philosophy"), /*#__PURE__*/React.createElement("blockquote", {
    className: "bpc-display",
    style: {
      fontSize: "clamp(28px,4.4vw,44px)",
      lineHeight: 1.25,
      margin: 0
    }
  }, "Much like the people who own them,", /*#__PURE__*/React.createElement("br", null), "no two homes are the same."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "rgba(249,248,247,0.6)",
      marginTop: 48,
      letterSpacing: "0.16em",
      textTransform: "uppercase"
    }
  }, "Bespoke Property Concierge intends to keep it that way")));
}

/* ---- Residences (image cards) ----------------------------------------- */
function Residences() {
  const list = [{
    image: "../../assets/imagery/QL.jpg",
    eyebrow: "Residence",
    title: "Hamilton Hill",
    meta: "Brisbane · Under stewardship since 2024"
  }, {
    image: "../../assets/imagery/JaneDain.jpg",
    eyebrow: "Residence",
    title: "Sunshine Coast Estate",
    meta: "Noosa · Seasonal care programme"
  }, {
    image: "../../assets/imagery/alef-morais.jpg",
    eyebrow: "Residence",
    title: "The Riverhouse",
    meta: "New Farm · Full renovation oversight"
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: `clamp(96px,16vh,160px) ${GUTTER}`,
      maxWidth: MAXW,
      margin: "0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      marginBottom: 56,
      flexWrap: "wrap",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 24
    }
  }, "Under our care"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "clamp(28px,4vw,40px)",
      fontWeight: 600,
      letterSpacing: "-0.015em",
      margin: 0
    }
  }, "A select portfolio")), /*#__PURE__*/React.createElement(Tag, null, "By invitation")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 24
    }
  }, list.map(r => /*#__PURE__*/React.createElement(Card, _extends({
    key: r.title,
    variant: "image",
    interactive: true
  }, r)))));
}

/* ---- Enquiry CTA + modal ---------------------------------------------- */
function CTASection({
  onEnquire
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: `clamp(112px,18vh,200px) ${GUTTER}`,
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      letterSpacing: "0.26em",
      marginBottom: 36
    }
  }, "By invitation"), /*#__PURE__*/React.createElement("h2", {
    className: "bpc-display",
    style: {
      fontSize: "clamp(34px,5.4vw,56px)",
      margin: "0 auto 48px",
      maxWidth: 900
    }
  }, "A private conversation,", /*#__PURE__*/React.createElement("br", null), "when you are ready."), /*#__PURE__*/React.createElement(Button, {
    size: "lg",
    uppercase: true,
    onClick: onEnquire
  }, "Request an introduction"));
}
function EnquiryModal({
  open,
  onClose
}) {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (open) setSent(false);
  }, [open]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 50,
      background: "rgba(24,24,24,0.42)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      background: "var(--bpc-bg-2)",
      width: "100%",
      maxWidth: 520,
      padding: "clamp(32px,5vw,56px)",
      boxShadow: "var(--bpc-shadow-lg)",
      maxHeight: "90vh",
      overflowY: "auto"
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "32px 0"
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "iso",
    color: "black",
    height: 56,
    basePath: "../../assets/logos",
    style: {
      margin: "0 auto 28px"
    }
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 24,
      fontWeight: 600,
      margin: "0 0 12px"
    }
  }, "Thank you."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--bpc-fg-2)",
      margin: "0 0 28px",
      maxWidth: 360,
      marginInline: "auto"
    }
  }, "A member of the BPC team will be in touch within two business days to arrange a private conversation."), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onClose
  }, "Close")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 16
    }
  }, "Request an introduction"), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 26,
      fontWeight: 600,
      letterSpacing: "-0.015em",
      margin: "0 0 28px"
    }
  }, "Tell us about your home."), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 20
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Full name",
    placeholder: "Jane Dain",
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    type: "email",
    placeholder: "jane@residence.com",
    required: true
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Where is the property?",
    options: ["Brisbane", "Sunshine Coast", "Gold Coast", "Elsewhere"]
  }), /*#__PURE__*/React.createElement(Textarea, {
    label: "A little about your needs",
    placeholder: "Optional",
    rows: 3
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    size: "lg",
    uppercase: true,
    style: {
      marginTop: 8
    }
  }, "Send enquiry")))));
}

/* ---- Footer ------------------------------------------------------------ */
function Footer() {
  const cols = [{
    h: "Service",
    l: ["Oversight", "Improvements", "Long-term care", "Panel"]
  }, {
    h: "Studio",
    l: ["About", "Journal", "Careers", "Press"]
  }, {
    h: "Contact",
    l: ["Brisbane +61 7 0000 0000", "hello@bespokeconcierge.com"]
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: "var(--bpc-bg-1)",
      padding: `clamp(72px,12vh,120px) ${GUTTER} 56px`,
      borderTop: "1px solid var(--bpc-border-hairline)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: MAXW,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "2fr 1fr 1fr 1fr",
      gap: 64,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    variant: "horizontal",
    color: "black",
    height: 34,
    basePath: "../../assets/logos",
    style: {
      marginBottom: 28
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--bpc-fg-2)",
      maxWidth: 320,
      lineHeight: 1.7,
      margin: 0
    }
  }, "Tailored stewardship for prestige homes. Proactive, private, and held to a standard of quiet excellence.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.h
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    style: {
      marginBottom: 22,
      fontSize: 10
    }
  }, c.h), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, c.l.map(x => /*#__PURE__*/React.createElement("div", {
    key: x,
    style: {
      fontSize: 13,
      color: "var(--bpc-fg-1)",
      lineHeight: 1.5
    }
  }, x)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: MAXW,
      margin: "80px auto 0",
      paddingTop: 28,
      borderTop: "1px solid var(--bpc-border-hairline)",
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      color: "var(--bpc-fg-3)",
      flexWrap: "wrap",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, "\xA9 2026 Bespoke Property Concierge"), /*#__PURE__*/React.createElement("div", null, "Brisbane \xB7 Australia")));
}
function App() {
  const [enquire, setEnquire] = useState(false);
  const open = () => setEnquire(true);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Nav, {
    onEnquire: open
  }), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(Intro, null), /*#__PURE__*/React.createElement(ServiceGrid, null), /*#__PURE__*/React.createElement(QuoteBlock, null), /*#__PURE__*/React.createElement(Residences, null), /*#__PURE__*/React.createElement(CTASection, {
    onEnquire: open
  }), /*#__PURE__*/React.createElement(Footer, null), /*#__PURE__*/React.createElement(EnquiryModal, {
    open: enquire,
    onClose: () => setEnquire(false)
  }));
}
const __bpcRoot = document.getElementById("root");
if (__bpcRoot) ReactDOM.createRoot(__bpcRoot).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/sections.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Card = __ds_scope.Card;

})();
