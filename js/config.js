/* ==========================================================================
   SITE CONFIGURATION — edit this file to update links across every page.
   --------------------------------------------------------------------------
   Any link marked in the HTML with data-href="github", data-href="repo"
   or data-href="email" is rewritten from these values when the page loads.

   NOTE: never put secrets (API keys, tokens, passwords) in this file or
   anywhere else in this website. Everything here is public.
   ========================================================================== */

window.SITE_CONFIG = {
  // Your GitHub organisation or user URL. No trailing slash.
  githubUrl: "https://github.com/[YOUR-GITHUB-ORG]",

  // Public contact address, used for "Contact" mailto links.
  contactEmail: "[contact@your-domain.com]"
};

// Mark that JavaScript is available (enables subtle reveal animations).
// Runs in <head> so there is no flash of un-animated content.
document.documentElement.classList.add("js");
