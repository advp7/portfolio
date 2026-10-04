// Cross-component events and helpers, kept tiny so importing them doesn't
// pull lazily-loaded components (palette, modal) into the main bundle.

/** Fired by the nav hint button (and anything else) to open the palette */
export const OPEN_PALETTE_EVENT = "open-command-palette";
/** Fired by the palette / assistant; Projects opens the matching case study */
export const OPEN_CASE_STUDY_EVENT = "open-case-study";

export const isMac = () =>
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);
