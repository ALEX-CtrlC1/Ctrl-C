/* ==========================================================================
   SITE CONFIGURATION — edit this file to update links across the site.
   --------------------------------------------------------------------------
   Any link marked in the HTML with data-href="github", data-href="repo"
   or data-href="email" is rewritten from these values when the page loads.

   NOTE: never put secrets (API keys, tokens, passwords, exchange keys) in
   this file or anywhere else in this website. Everything here is public.
   ========================================================================== */

window.SITE_CONFIG = {
  // ScaleX Research GitHub organisation. No trailing slash.
  githubUrl: "https://github.com/scalex-research",

  // Public contact address, used for "Contact" mailto links.
  // [CONTACT EMAIL] — replace with the real address. Leave as-is to keep
  // the placeholder visible rather than shipping an invented address.
  contactEmail: ""
};

// Mark that JavaScript is available (enables subtle reveal animations).
// Runs in <head> so there is no flash of un-animated content.
document.documentElement.classList.add("js");
