# Mobile Responsiveness Fixes

Here is a comprehensive log of the CSS modifications made to address layout overflows, text alignments, and overall mobile user experience issues across the portfolio:

## Global Changes
- **Global Text Overflow**: Added `overflow-wrap: break-word;` and `word-wrap: break-word;` to the `body` styling. This ensures that any excessively long strings (e.g., URLs, email addresses, or raw code) will break smoothly to the next line instead of forcing horizontal scrolling or breaking out of their containers.

## Hero Section
- **Hero Title Resizing (`.hero-name`)**:
  - Adjusted the mobile typography clamps. At `>= 768px`, changed `clamp(2rem, 8vw, 3rem)` to `clamp(1.8rem, 7.5vw, 2.8rem)` and introduced `word-break: break-word;`.
  - At `<= 480px`, modified `clamp(1.75rem, 9vw, 2.5rem)` to `clamp(1.4rem, 8vw, 2.2rem)`.
  - These tweaks ensure that the name doesn't stretch past the screen edges on extremely small screens and wraps elegantly when needed.

## Section Layouts
- **Section Headers (`.section-header`)**:
  - Applied `display: flex`, `flex-direction: column`, `align-items: center`, and `text-align: center` specifically in the mobile breakpoints (`<= 768px`).
  - This perfectly centers section titles (e.g., "ABOUT_ME", "SKILLS_ARSENAL") and their respective green underscore lines for a polished appearance.

## About Section
- **Mock Terminal (`.terminal-body`)**:
  - Scaled down the font size from `0.8rem` to `0.75rem` for mobile (`<= 768px`).
  - Added `word-break: break-word;` to guarantee that long sentences inside the terminal output will wrap instead of disrupting the border or demanding scrolling.

## Contact Section
- **Contact Links (`.link-url`)**:
  - Mobile constraints strictly enforced links with a `.link-url` span to a `max-width` of 130px.
  - Implemented `white-space: nowrap;`, `overflow: hidden;`, and `text-overflow: ellipsis;`. 
  - Adjusted alignment with `display: inline-block; vertical-align: bottom;`.
  - This styling ensures that very long URLs or emails (e.g., GitHub or LinkedIn URLs) will cleanly truncate with an ellipsis (`...`) instead of wrapping awkwardly or destroying the form container's layout padding.

These adjustments systematically enhance layout fit, text flow, and alignments, fixing the view on smaller viewports and bringing it closer to the pristine aesthetics available on PC.
