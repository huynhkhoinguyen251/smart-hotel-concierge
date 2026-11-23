---
name: Smart Hotel Concierge
description: A hotel and travel booking interface in the colours of the Da Nang coast.
colors:
  ink: "#0B2A3C"
  ink-soft: "#48606F"
  ink-faint: "#5C7280"
  sea: "#0E5A7A"
  sea-hover: "#0B4A65"
  sea-active: "#083A50"
  sea-tint: "#E6F0F4"
  sea-line: "#9CC3D3"
  sun: "#F5A524"
  sun-hover: "#FFB63D"
  sun-active: "#E0921A"
  white: "#FFFFFF"
  ground: "#F2F6F9"
  line: "#C9D6DE"
  line-soft: "#E3EAEF"
  success: "#1B7A4B"
  success-tint: "#E6F4EC"
  success-deep: "#145C38"
  warning: "#B45309"
  warning-tint: "#FDF0E2"
  warning-deep: "#8A3F06"
  danger: "#C0322B"
  danger-hover: "#A52822"
  danger-active: "#8A1F1A"
  danger-tint: "#FCECEA"
typography:
  page-title:
    fontFamily: "'Be Vietnam Pro', ui-sans-serif, system-ui, 'Segoe UI', sans-serif"
    fontSize: 1.875rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  section-title:
    fontFamily: "'Be Vietnam Pro', ui-sans-serif, system-ui, 'Segoe UI', sans-serif"
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1.55
  body:
    fontFamily: "'Be Vietnam Pro', ui-sans-serif, system-ui, 'Segoe UI', sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  control:
    fontFamily: "'Be Vietnam Pro', ui-sans-serif, system-ui, 'Segoe UI', sans-serif"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.57
  button:
    fontFamily: "'Be Vietnam Pro', ui-sans-serif, system-ui, 'Segoe UI', sans-serif"
    fontSize: 0.875rem
    fontWeight: 600
    lineHeight: 1.57
  label:
    fontFamily: "'Be Vietnam Pro', ui-sans-serif, system-ui, 'Segoe UI', sans-serif"
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.57
  note:
    fontFamily: "'Be Vietnam Pro', ui-sans-serif, system-ui, 'Segoe UI', sans-serif"
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.33
rounded:
  small: 4px
  control: 6px
  panel: 8px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  button-primary:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: 40px
  button-primary-hover:
    backgroundColor: "{colors.sun-hover}"
    textColor: "{colors.ink}"
  button-primary-active:
    backgroundColor: "{colors.sun-active}"
    textColor: "{colors.ink}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: 40px
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: 40px
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    height: 40px
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: 24px
  tab-active:
    textColor: "{colors.sea}"
    typography: "{typography.label}"
  badge-warning:
    backgroundColor: "{colors.warning-tint}"
    textColor: "{colors.warning-deep}"
    rounded: "{rounded.small}"
  badge-success:
    backgroundColor: "{colors.success-tint}"
    textColor: "{colors.success-deep}"
    rounded: "{rounded.small}"
---

# Design System: Smart Hotel Concierge

## Overview

**Creative North Star: "Da Nang coast"**

White like the page of a travel notebook, navy ink for reading, sea blue for everything that can be followed or is selected, and one patch of sunlight for the thing to do next. The hotel is on the coast, so the colour comes from the place and not from a hotel category.

Guest browsing pages persuade: photographs of rooms, food and tours carry them and the interface stays quiet around them. Account pages, booking forms and the admin area operate: dense enough to work in, calm enough to read for an hour, and identical from page to page.

**Key Characteristics:**

- White ground for guests; a light blue-grey ground behind admin content.
- One amber button per view, or per item in a list of things to add.
- Sea blue marks links, focus, selection and tabs, and nothing decorative.
- Flat surfaces, thin lines, small radius.
- One typeface in four weights.

## Colors

### Primary

- **Sunlight** (`sun`): the fill of primary buttons, always with ink text.
- **Sea** (`sea`): links, focus rings, selected options, the current tab, the current step, rating stars and text selection.

### Neutral

- **Ink** (`ink`): headings and body text.
- **Soft ink** (`ink-soft`): supporting text, field hints and labels of values.
- **Faint ink** (`ink-faint`): placeholders. It still passes 4.5:1 on white.
- **White** (`white`): page ground, cards, fields.
- **Ground** (`ground`): the admin page ground.
- **Line** (`line`) and **Soft line** (`line-soft`): borders of controls, and dividers and card borders.

### State

Green for success, orange for waiting, red for danger. Each has a tint for backgrounds and a deep tone for text on that tint. Badges put deep text on a tint; they never use a saturated fill.

**The One Sun Rule.** Amber is only the fill of a primary button. It is never text, an icon, a star, a border or a background, and amber text on white is forbidden.

**The Sea Means Something Rule.** Sea blue says "you can go here" or "this is the current one". It is not used to decorate.

## Typography

Be Vietnam Pro everywhere, self-hosted, in weights 400, 500, 600 and 700. It is drawn for Vietnamese and reads well in English at small sizes.

Sizes are fixed in rem and do not scale with the window: 0.75, 0.875, 1, 1.125, 1.25, 1.5, 1.875 and 2.25. Page titles drop to 1.5 on phones. Hierarchy comes from size and weight together, one clear step at a time. Supporting text stays within 65 to 75 characters per line.

Numbers are tabular, so prices, dates and countdowns line up and do not jump.

**The No Eyebrow Rule.** No small uppercase label above a heading. The heading speaks for itself.

## Layout

Guest content sits in a centred column with a 16px gutter on phones. Detail pages use a wide column for content and a narrow column for the action, which stays in view on desktop and follows the content on phones. Admin content sits beside a fixed sidebar.

Space is tight inside a group and generous between groups, with more above a heading than below it. The page never scrolls sideways at 375px; wide tables and tab rows scroll inside their own area.

## Elevation & Depth

Surfaces are flat. A card is a thin line on white, with no shadow.

Only things that float have a shadow: menus, calendars, dropdown lists and dialogs. Shadows always fall downwards with a soft blur and are tinted with ink. There are no glows, no hard offset shadows and no blurred glass.

**The No Nested Card Rule.** A card never contains a card. Inside a card, separate with space or a line.

## Shapes

Controls have a 6px radius, cards and dialogs 8px, badges and small buttons 4px. Circles are kept for steps and avatars. No pills, no one-sided coloured borders, no gradients.

## Components

### Buttons

Primary is amber with ink text, secondary is white with a line, danger is red with white text. Default height is 40px and small is 32px. Hover and active change the fill; secondary turns its text and border sea blue. While loading, a button shows a spinning icon and cannot be pressed again.

### Fields

The label is above the field, the hint or error below. An error turns the border red and replaces the hint. Focus turns the border sea blue. Dates read as "10 Jul 2027" and times as "10 Jul 2027, 14:30", so a day is never mistaken for a month. On phones the date and time panel opens at the bottom of the screen.

### Tabs

Filter tabs are links with a 2px sea underline under the current one. On phones the row scrolls inside its area without a scrollbar and brings the current tab into view.

### Badges and progress

Badges show a status in deep text on a tint. Progress shows the steps of an order, with a check mark for finished steps and a sea circle for the current one; steps stack vertically on phones.

### Dialogs

Centred, with the title at the top and the buttons at the bottom. Long content scrolls in between. A confirmation starts with the safe button focused. Escape and a click outside close a dialog unless it is saving.

### Loading, empty and error

A loading page shows a grey outline of its content; a small spinner is only for a part of a page. An empty list says what is missing and offers the next step. An error says what went wrong and offers to try again.

### Icons

Line icons from one library, in one weight. No emoji and no text characters used as icons.

### Motion

State changes take 150 to 200 milliseconds and nothing moves for decoration. With reduced motion, changes are immediate.

## Do's and Don'ts

### Do:

- **Do** give each view one obvious amber action.
- **Do** keep text at 4.5:1 or better, including placeholders and badges.
- **Do** use the shared controls; a date, a select or a dialog looks and behaves the same everywhere.
- **Do** design the hover, focus, disabled, loading, empty and error states with the default one.
- **Do** check every page at 375px.

### Don't:

- **Don't** use amber for anything except a primary button.
- **Don't** put a card in a card, or use cards where a line or space is enough.
- **Don't** add gradients, glass, glows, pills or coloured side borders.
- **Don't** write uppercase labels above headings.
- **Don't** use emoji or arrows typed as text in place of icons.
- **Don't** show a scrollbar on a row of tabs.
