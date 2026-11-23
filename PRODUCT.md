# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

| Who | Role in the system | What they come to do |
|---|---|---|
| Hotel guests | `user` | Book a room, request hotel services, order food to the room, follow and pay for their orders |
| Tourists | `user` | Book local tours, motorbikes, airport pickup and the shuttle |
| Reception staff | `admin` | Handle bookings, requests and support tickets |
| Hotel administrators | `admin` | Manage rooms, services, menu, tours, vouchers and users |
| Hotel managers | `admin` | Read statistics and guest feedback |

## Product Purpose

Smart Hotel Concierge is a web application for booking hotel rooms, hotel services and local tourism services in one place. Guests usually have to contact reception for each of these, which takes time for them and for the staff. Here they can do it online, and the hotel can manage every booking and request in one system.

The project is a graduation project in information technology, due on 4 December 2026.

## Positioning

One account and one website cover the room, the services in the hotel, food delivered to the room, and travel around the hotel, instead of a separate contact for each.

## Operating Context

- The hotel in the product is Smart Hotel Concierge, 12 Bach Dang Street, Hai Chau, Da Nang, Vietnam.
- Prices are in VND. All text in the interface is in English; Vietnamese names are written without accents.
- Guests use the site on phones as well as on desktop. Pages must work at 375px width with no horizontal page scroll.

Each surface has a mode:

| Surface | Mode |
|---|---|
| Guest browsing: home, rooms and room details, services, food menu, tours and transport | Persuade |
| Account pages, booking and request forms, payments, invoices, notifications, support | Operate |
| Admin area | Operate |

## Capabilities and Constraints

**Guests can:** search and filter rooms, check availability by date, book, change or cancel a booking, request breakfast, buffet, massage, laundry and housekeeping, order food and drinks, book motorbikes, airport pickup, the shuttle and tours, pay by a simulated QR code, use vouchers for rooms and food, read invoices and notifications, contact reception through support tickets, and review what they used.

**Admins can:** manage rooms, room types, amenities, services, menu, tours, vouchers and users, update the status of bookings and requests, reply to tickets, and read payments, reviews and statistics.

**Rules the interface must respect:**

- A room booking that overlaps another active booking of the same room is refused.
- Every order is paid by a simulated QR payment within 15 minutes, or it is cancelled automatically. No real money is processed, and the interface must say so.
- A paid room booking is confirmed automatically. Other paid requests wait for an admin.
- Guests see only their own bookings, orders, payments and tickets.
- Roles and all input are checked on the backend; the interface only helps the person get it right.

**Not part of the product yet:** comparison and recommendations (planned), and the optional features listed in the proposal.

## Brand Commitments

- The product name is "Smart Hotel Concierge".
- Text is plain and direct. Buttons name their action; errors name the problem and what to do next.

The visual direction is recorded in `DESIGN.md`.

## Evidence on Hand

- `docs/proposal.md`: scope, business rules and security. It is the source of truth.
- `docs/api.md`: API list and response conventions.
- `docs/planning.md`: progress and decisions.
- The seed data in `database/` is sample data. There are no real customers, reviews or usage figures, and none may be invented in the interface.

## Product Principles

1. **One place for the whole stay.** Every order, from the room to a tour, can be found, followed and paid for in the same way.
2. **State is always visible.** A booking or request shows its status, what happens next and how long is left to act.
3. **Nothing irreversible by accident.** Cancelling, deleting and refunding ask first, with the safe choice focused.
4. **The same control behaves the same way everywhere,** for guests and for admins.

## Accessibility & Inclusion

- Body text has a contrast of at least 4.5:1.
- Everything works with the keyboard, with a visible focus ring. Dialogs hold the focus and give it back.
- Fields have labels, and their hints and errors are linked to them for screen readers.
- Motion is reduced when the person asks for reduced motion.
