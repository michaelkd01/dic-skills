/* global React */

/**
 * BPC Logo — renders the correct official logo asset for a given lockup +
 * colourway. Never recreates the mark in code; it points at the approved SVGs.
 * Pass `basePath` to match where assets/logos lives relative to the page.
 *
 * Brand rules enforced by usage (not code): never stretch, never drop-shadow,
 * never place a dark variant on a dark background.
 */
export function Logo({
  variant = "lockup",      // "lockup" | "horizontal" | "iso" | "textmark" | "box"
  color = "black",         // "black" | "white" | "db" | "lb" | "o"
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
    box: "BPC_BOX_" + C + ".svg",
  };
  const file = fileMap[variant] || fileMap.lockup;
  return (
    <img
      src={basePath.replace(/\/$/, "") + "/" + file}
      alt={alt}
      style={{ height, width: "auto", display: "block", ...style }}
      {...rest}
    />
  );
}
