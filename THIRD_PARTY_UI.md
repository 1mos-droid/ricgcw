# Interface components and credits

The application integrates these maintained React components, adapted to the existing React/MUI architecture. Adaptations use local CSS instead of adding a competing Tailwind reset. Keyboard interactions use the existing MUI primitives.

| Source | Component | Used in | Adaptation |
| --- | --- | --- | --- |
| [Sileo](https://sileo.aaryan.design/) | Toaster and notification API, npm package | WorkspaceContext, all operational notifications | Theme colors and mobile-safe placement |
| [Kokonut UI](https://github.com/kokonut-labs/kokonutui) | Loader, Slide Text Button | Route loader, authentication, shared action buttons | JSX, MUI button adapter, local CSS |
| [SmoothUI](https://smoothui.dev/docs/components/reveal-text) | Reveal Text | Authentication and dashboard headings | JSX, 200ms entrance, reduced motion |
| [Watermelon UI](https://registry.watermelon.sh/r/continuous-tabs-base.json) | Continuous Tabs | Authentication, dashboard and shared segmented controls | Controlled state and MUI keyboard/focus behavior |
| [Rare UI](https://rareui.com/components/passwordinput) | Password Input | Sign in, signup | Animated eye and strength algorithm with native MUI input; custom glyph/caret rendering omitted |

Source files retain copyright comments. This church management application uses Rare UI as part of the product, not as a redistributed component library. Rare UI credit is visible in the login footer and this document.

TUIOS was identified as a terminal workspace, not a React component library. “oooh” remains unidentified. “Open Motion” points to multiple projects, including video tooling; no unverified package is installed under those names.

Sanctuary photograph: [Unsplash image source](https://images.unsplash.com/photo-1438032005730-c779502df39b), distributed locally as `public/community-worship.jpg`. Decorative stock photograph, not a representation of RICGCW premises.

## MIT components

Copyright (c) 2025 kokonutUI

Copyright (c) 2024 Eduardo Calvo

Copyright (c) 2026 Watermelon Platform Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Rare UI license

MIT + Commons Clause License Condition v1.0 + Attribution

Copyright (c) 2026 Swami Malode

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, and distribute the Software as part of an
application, website, or product, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

Attribution Requirement

Any project that ships any part of the Software must credit Rare UI with a
visible link to https://rareui.com, placed where a visitor or user can find it,
such as a site footer, an about page, a credits screen or a README. The credit
and the copyright notice above must not be removed from the source you copied.

Commons Clause Restriction

You may use this Software, including for any commercial purpose, so long as you
do not sell, sublicense, or redistribute the components themselves, whether
alone, in a bundle, or as a ported version.

No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
