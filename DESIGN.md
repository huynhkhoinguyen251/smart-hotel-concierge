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
  chart-rooms: "#1B7FA8"
  chart-services: "#E0921A"
  chart-food: "#1B8A5A"
  chart-tours: "#7A5CC7"
  chart-transport: "#CF4F3A"
typography:
  display:
    fontFamily: "'Be Vietnam Pro', ui-sans-serif, system-ui, 'Segoe UI', sans-serif"
    fontSize: "clamp(2rem, 1.35rem + 2.6vw, 3.25rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
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

- White ground for guests with a navy footer; a light blue-grey ground behind admin content.
- One amber button per view. The buttons inside a list are white.
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

### Charts

The five revenue sources always have these colours, in this order: Rooms (`chart-rooms`), Services (`chart-services`), Food (`chart-food`), Tours (`chart-tours`), Transport (`chart-transport`). They were checked for colour-blind separation. A source keeps its colour everywhere, and these colours are used for nothing else. Counts of one kind (bookings by status, ratings) are bars in sea blue.

**The Ink Numbers Rule.** Text in a chart is ink, never the colour of its series. The name and the number are written beside the mark, so colour is never the only way to read it.

**The One Sun Rule.** Amber is only the fill of a primary button. It is never text, an icon, a star, a border or a background (the chart colour of Services is a data colour, not this one), and amber text on white is forbidden.

**The Sea Means Something Rule.** Sea blue says "you can go here" or "this is the current one". It is not used to decorate. In the admin area it also fills single-colour bars.

## Typography

Be Vietnam Pro everywhere, self-hosted, in weights 400, 500, 600 and 700. It is drawn for Vietnamese and reads well in English at small sizes.

Sizes are fixed in rem, and only the headline over the home photograph (`display`) scales with the window. The fixed sizes are 0.75, 0.875, 1, 1.125, 1.25, 1.5, 1.875 and 2.25. Page titles drop to 1.5 on phones; the title of a room, service, tour or transport page is 2.25, and 1.875 on phones. Hierarchy comes from size and weight together, one clear step at a time. Supporting text stays within 65 to 75 characters per line.

Numbers are tabular, so prices, dates and countdowns line up and do not jump.

**The No Eyebrow Rule.** No small uppercase label above a heading. The heading speaks for itself.

## Layout

Guest browsing pages use one centred column (the `shell` utility): at most 80rem wide, with a gutter of 16px on phones, 24px from 640px and 32px from 1024px. Detail pages use a wide column for content and a narrow column for the action, which stays in view on desktop and follows the content on phones. Admin content sits beside a fixed navy column.

Space is tight inside a group and generous between groups, with more above a heading than below it. The page never scrolls sideways at 375px; wide tables and tab rows scroll inside their own area.

### Guest pages

Each page has its own composition, so a photograph of a dish is never framed like a photograph of a room.

| Page | Composition |
|---|---|
| Header | Solid white, the hotel name as text. The current page is sea blue with an underline. Below 768px the menu is a drawer from the right. |
| Footer | Ink ground, white text: address, main links, photo credits. |
| Home | A full-width photograph, about 70% of the window high. The headline sits over the sea on a flat block of ink at 70%, running off the left edge; the room search is one white bar inside the bottom of the photograph. Then four sections that load on their own: one large room beside two smaller ones; two photographs of uneven size beside a text list of services with prices; one row of six square dishes; one wide tour above three of uneven width. |
| Rooms | Full-width rows divided by lines: photograph 40%, facts in the middle, price and button on the right. The whole row is the link. Filters are a plain column on the left, and a drawer with a count of active filters below 1024px. |
| Room details | A mosaic of photographs that opens larger on click (two photographs: one wide, one tall, the same height; on phones a row to swipe). Facts on one line, amenities with icons, reviews divided by lines. The booking box stays in view on desktop; on phones a bar at the bottom shows the price and leads to it. |
| Food | Rows grouped under Food, Coffee and Drinks: a 4:3 photograph, name, price, and the add or quantity control. The order stays in view on desktop; below 1024px a bar at the bottom opens it in a drawer. |
| Services | Two large photographs per row, 7 and 5 columns wide, and the next row the other way round. A last one on its own puts its text beside the photograph. |
| Tours | The first tour is a wide photograph, the others are smaller and of uneven width. One or two tours are both wide. |
| Transport | A compact list: small square photograph, how it is charged, price and button. |
| Service, tour and transport details | Large photograph, then title, price and description; one panel with the form on the right, and after the description on phones. |

### Account pages

| Part | Composition |
|---|---|
| Lists (bookings, requests, orders, trips, payments, reviews, support, notifications) | Title, then one white panel: status tabs, rows divided by lines, pages. A row is the title as a link, the status beside it, one line of reference, the key facts, and the total on the right (below on phones). All of the row can be clicked. An order waiting for payment shows the time left and a white "Pay now" button. Loading, empty and error states stay inside the panel; every empty state has one next action. |
| Order details | The same white panel as in the admin area (`components/detail`): title, status and date, the progress, then content on the left and price, payment and cancellation on the right. While the order waits for payment, the payment comes first, before the progress, and "I have paid" is the only amber button. |
| Payment | Amount and time left, the QR code, the steps and the button. The code is black on white, 208px, with a quiet zone. The time left turns red in the last two minutes. |
| Booking | Two panels: the stay and voucher, and a summary with the photograph, the price and the amber button, which stays in view. On phones the summary follows. |
| Invoice | One white sheet on the ground colour, thin rules, amounts aligned right, the status in words. In print only the sheet remains, black on white. |
| Log in and register | The form on the left, lined up with the hotel name, and the beach photograph on the right. Below 1024px only the form. |
| Not found, no access, page failed to load | Left-aligned: one heading, one sentence, one button. |

**The Unread Rule.** An unread notification has a bold title and a dot with hidden text, never only a colour.

**The Photograph Rule.** Photographs have a fixed ratio or height, so nothing moves when they load. They are lazy, except the home photograph, which is preloaded. A missing photograph is replaced by a drawing of the coast in flat tints of sea blue.

**The Whole Block Rule.** Where a row or block leads to one page, all of it can be clicked, but there is only one link in it for the keyboard.

### Admin pages

| Part | Composition |
|---|---|
| Side column | Ink ground, white text, line icons; the current item is white on sea. Dashboard stands alone, then Front desk, Hotel and Money. It collapses to icons with tooltips (by itself below 1280px, and the choice is remembered). Below 1024px it is a drawer from the left. |
| Top bar | White: the group and section, Back to site (in the drawer on phones), notifications, and an account menu with Logout. |
| Content | Ground colour, at most 84rem wide. On every navigation the page starts at the top and keyboard focus moves to the content. |
| Dashboard | What needs attention first, as a list of counts that are links; a zero is quiet. Then one line of plain figures. Then charts and tables, in white panels divided by lines. |
| List | One white panel: status tabs, a toolbar with search and filters, the table, the pages. Loading, empty and error states stay inside it. While it reloads, the old rows stay and fade. |
| Details | One white panel: title, status and date on the left, the actions on the right at the same height, the progress, then content on the left and guest, price and payment on the right, divided by lines. On phones everything follows in one column. |
| Form | One white panel, two columns on desktop and one on phones. |

**The Two Rows Rule.** Switching between sections (Requests / Catalog) is a solid block with a white chip; filtering by status is a row of underlined tabs. The two never look alike.

## Elevation & Depth

Surfaces are flat. A card is a thin line on white, with no shadow.

Only things that float have a shadow: menus, calendars, dropdown lists and dialogs. Shadows always fall downwards with a soft blur and are tinted with ink. There are no glows, no hard offset shadows and no blurred glass.

**The No Nested Card Rule.** A card never contains a card. Inside a card, separate with space or a line.

## Shapes

Controls have a 6px radius, cards, dialogs and photographs 8px, badges and small buttons 4px. Circles are kept for steps and avatars. No pills, no one-sided coloured borders, no gradients.

## Components

### Buttons

Primary is amber with ink text and appears once per view, secondary is white with a line, danger is red with white text. Default height is 40px and small is 32px; on phones small buttons and page numbers grow to 40px. Hover and active change the fill; secondary turns its text and border sea blue. While loading, a button shows a spinning icon and cannot be pressed again.

In a table row at most one button is visible: the next step, or Edit. Everything else is in a "More" menu, with destructive actions there in red text. On a details page a destructive action is a white button with red text and line; a filled red button appears only in the dialog that asks again. A disabled action says why in text under it.

### Tables

From 1024px: a quiet header without dividers, rows divided by lines, text at the top of the cell. The first column is the name and the link to the details; the status badges follow it; numbers are right-aligned and never wrap. A table that is too wide scrolls inside its panel with the actions always in view. Every admin list fits at 1440px with the side column open. Below 1024px each row is a compact block: name and amount, badges, labelled values in two columns, then the actions.

### Charts

Revenue by month is a stack of columns at most 24px wide, with a 2px white gap between segments and a 4px radius on the top segment only. Gridlines are solid hairlines, the axis is compact ("20M VND"), the legend is always shown, and the tooltip has every source and the total. The same numbers are in a table below it. Comparisons are horizontal bars with the value as text. There are no doughnuts and no double axes. Charts do not animate, and their skeleton has the same height.

### Fields

The label is above the field, the hint or error below. An error turns the border red and replaces the hint. Focus turns the border sea blue. Dates read as "10 Jul 2027" and times as "10 Jul 2027, 14:30", so a day is never mistaken for a month. On phones the date and time panel opens at the bottom of the screen. The calendar is downloaded only where it is needed; until then a field of the same size stands in its place.

### Tabs

Filter tabs are links with a 2px sea underline under the current one. On phones the row scrolls inside its area without a scrollbar and brings the current tab into view.

A choice between two ways of doing the same thing, such as uploading a file or pasting a URL, is a segmented control.

### Badges and progress

Badges show a status in deep text on a tint. Progress shows the steps of an order, with a check mark for finished steps and a sea circle for the current one; steps stack vertically on phones.

### Dialogs

Centred, with the title at the top and the buttons at the bottom. Long content scrolls in between and the buttons stay in view. A confirmation starts with the safe button focused. Escape and a click outside close a dialog unless it is saving.

### Loading, empty and error

A loading page shows a grey outline of its content; a small spinner is only for a part of a page. An empty list says what is missing and offers the next step. An error says what went wrong and offers to try again. If a page file cannot be downloaded, the header stays and the content says so with a "Reload page" button.

### Icons

Line icons from `@ant-design/icons`, in one weight. Amenities use a small set drawn for the project, also in one weight, because the library has no bathtub, balcony or hair dryer. No emoji and no text characters used as icons.

### Motion

State changes take 150 to 200 milliseconds. A photograph that leads somewhere grows by 2.5% over 300 milliseconds when pointed at; nothing else moves. With reduced motion, changes are immediate.

## Do's and Don'ts

### Do:

- **Do** give each view one obvious amber action, and make the buttons in its lists white.
- **Do** keep text at 4.5:1 or better, including placeholders and badges.
- **Do** use the shared controls; a date, a select or a dialog looks and behaves the same everywhere.
- **Do** design the hover, focus, disabled, loading, empty and error states with the default one.
- **Do** check every page at 375px.

### Don't:

- **Don't** use amber for anything except a primary button.
- **Don't** put a red button in every row of a table.
- **Don't** say the hotel is on the beach; it is on Bach Dang Street.
- **Don't** put a card in a card, or use cards where a line or space is enough.
- **Don't** add gradients, glass, glows, pills or coloured side borders.
- **Don't** write uppercase labels above headings.
- **Don't** use emoji or arrows typed as text in place of icons.
- **Don't** show a scrollbar on a row of tabs.
