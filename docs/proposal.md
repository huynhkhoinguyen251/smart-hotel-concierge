# Project Proposal

## Project Title

Smart Hotel Concierge and Tourism Service Booking Web Application

## 1. Project Description / Concept

The project is a web application that helps hotel guests book rooms and use hotel services through one online platform. In many hotels, guests usually need to contact the reception directly when they want to book a room, order food, book a massage, request laundry service, or ask for room cleaning. This process can take time and may not be convenient for both customers and hotel staff.

This project aims to solve that problem by creating a smart hotel service booking system. The system allows users to search for rooms, check room availability, book hotel services, order food or drinks, and contact the hotel reception online. Besides hotel services, the system also supports tourism-related services such as motorbike rental, airport pickup, and local tour booking.

The main purpose of this project is to improve the customer experience in a hotel. Guests can manage many services from one website instead of contacting different hotel departments manually. At the same time, the hotel admin can manage bookings, rooms, services, orders, users, and customer feedback more easily.

The system has two roles: **user** and **admin**. Users can register, log in, book rooms, request services, and review services. Admins can manage rooms, services, bookings, orders, and users, and view simple statistics. Reception staff and hotel managers use the admin role.

## 2. Project Objectives

The main objectives of this project are:

- To develop a web application for hotel room booking and hotel service booking.
- To allow users to check room availability and book rooms online.
- To prevent double booking of the same room for overlapping dates.
- To provide hotel services such as food ordering, laundry, housekeeping, massage booking, and breakfast booking.
- To support tourism services such as motorbike rental, airport pickup, and local tour booking.
- To help hotel staff manage all bookings and service requests in one system.
- To provide a simple admin dashboard for managing data and viewing basic statistics.
- To improve the convenience and experience of hotel guests.

## 3. Target Users

| Target user | Needs | System role |
|---|---|---|
| Hotel guests | Book rooms and services online | User |
| Tourists | Use hotel services and local travel support | User |
| Hotel reception staff | Manage guest requests | Admin |
| Hotel administrators | Manage rooms, services, bookings, and users | Admin |
| Hotel managers | View statistics and customer feedback | Admin |

## 4. Project Scope

Features are divided into three priority levels so that the essential system is finished first.

| Priority | Meaning | When it is built |
|---|---|---|
| **Core** | Required for the project to be considered complete | 10–24 November 2026 |
| **Extended** | Planned, and built after all Core features work | 25–27 November 2026 |
| **Optional** | Built only if time remains | Only if time remains before testing starts on 28 November 2026 |

The database is designed for Core and Extended features from the start, so that adding Extended features does not require redesigning existing tables.

### 4.1 Core Features — User

- Register a new account.
- Log in and log out.
- View and update their profile.
- Search and filter available rooms.
- View room details, including price, room type, images, facilities, and rating.
- Check room availability by date.
- Book a room online.
- View booking history.
- Cancel or update a booking under the rules in Section 5.
- Book hotel services:
  - Breakfast booking
  - Buffet booking
  - Massage booking
  - Laundry service
  - Housekeeping service
- Order food, coffee, or drinks with room delivery.
- Book motorbike rental.
- Book airport pickup or shuttle service.
- Book local tours or nearby tourism services.
- Contact reception through a support ticket.
- Review and rate rooms, services, or food orders.
- Read food reviews in a shared section of the menu page.

### 4.2 Core Features — Admin

- Log in to the admin dashboard.
- Manage user accounts.
- Add, edit, and delete rooms.
- Manage room types and room prices.
- Update room availability.
- Manage room bookings.
- Manage hotel services.
- Manage food and drink orders.
- Manage laundry, housekeeping, massage, and breakfast requests.
- Manage motorbike rental and airport pickup bookings.
- Manage local tour information.
- Update booking and service status.
- Reply to support tickets.
- View customer reviews and ratings.
- View basic statistics:
  - Total bookings
  - Total revenue
  - Most booked rooms
  - Most used services
  - Number of users
  - Customer feedback summary

### 4.3 Extended Features

- Booking and service status notifications inside the application.
- Payment simulation. No real payment is processed.
- Invoice generation.
- Voucher and discount system, including admin management of vouchers.
- Comparison of rooms or services by price, quality, and rating.
- Smart recommendation of rooms and services using rules based on booking history, ratings, and popularity.

### 4.4 Optional Features

- Voice search using the browser's speech recognition, on supported browsers.
- Sign-in with a Google account.
- Online check-in and check-out.
- Real-time chat with reception.
- Multi-language support (English and Vietnamese).
- QR code for quick service requests.
- AI chatbot for basic customer support.

## 5. Business Rules

### Room availability

- A room is unavailable for a requested stay if it has a booking with status `pending`, `confirmed`, or `checked_in` whose dates overlap the request.
- Two stays overlap when `existing.check_in < requested.check_out` and `existing.check_out > requested.check_in`. A guest may therefore check in on the day another guest checks out.
- The check-out date must be after the check-in date, and the check-in date cannot be in the past.
- The availability check and the booking insert run in one database transaction, so two users cannot book the same room for overlapping dates at the same time.

### Bookings

- A user can update the dates of a booking only while it is `pending`, and availability is checked again.
- Check-in time is 14:00 on the check-in date.
- A user can cancel a booking while it is `pending` or `confirmed`, up to 24 hours before check-in. After that, only an admin can cancel it.
- When a booking is cancelled, its hotel service requests that are still `pending` or `confirmed` are cancelled automatically.
- An admin can mark a booking as `checked_in` only from the check-in date onwards.
- A stay can be at most 30 nights, and the check-in date can be at most one year ahead.
- A booking stores the price at the time of booking, so later price changes do not affect it.
- Each booking is for one room. A user can have many bookings, including several rooms for the same dates.

### Services and orders

- Food delivery, laundry, and housekeeping require a booking with status `checked_in`.
- Breakfast, buffet, and massage require a booking with status `confirmed` or `checked_in`.
- Tourism services (motorbike rental, airport pickup, local tours) can be booked by any logged-in user.
- The system does not track individual motorbikes or limit their number. An admin approves a request (`confirmed`) or rejects it (`cancelled`).
- When approving a motorbike rental, the admin must enter the licence plate, and the user can then see it. The plate is optional for airport pickup and shuttle.
- Each motorbike rental request is for one motorbike (`quantity` = 1). A user who needs more motorbikes creates more requests.
- Service and order items store the price at the time of the request.
- A user can cancel a service, food, or tourism request only while it is `pending`. An admin can cancel it while it is `pending` or `confirmed`.

### Reviews

- A user can review a room only after a booking for it reaches `checked_out`.
- A user can review a service only after their request for it reaches `completed`.
- A user can review a food order only after it reaches `completed`. The review covers the whole order, not individual items.
- Each completed booking, service request, or food order can be reviewed once.
- Ratings are whole numbers from 1 to 5.

### Status flows

| Item | Normal flow | Can end early with |
|---|---|---|
| Room booking | `pending` → `confirmed` → `checked_in` → `checked_out` | `cancelled` (from `pending` or `confirmed`) |
| Service and tourism request | `pending` → `confirmed` → `in_progress` → `completed` | `cancelled` (from `pending` or `confirmed`) |
| Food order | `pending` → `confirmed` → `preparing` → `delivering` → `completed` | `cancelled` (from `pending` or `confirmed`) |
| Support ticket | `open` → `in_progress` → `resolved` | — |
| Simulated payment | `unpaid` → `paid` → `refunded` | — |

## 6. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | ReactJS with Vite, JavaScript | User and admin interfaces |
| UI | Tailwind CSS | Styling |
| API client | Axios | Connecting the frontend to the backend |
| Charts | Chart.js | Admin dashboard statistics |
| Backend | Node.js with Express.js | REST API and business logic |
| Database | MySQL 8.0 with mysql2 | Relational data storage |
| Authentication | JWT and Bcrypt | Login sessions and password hashing |
| Image upload | Multer with local storage | Room, service, menu, and tour images |
| API testing | Postman | Testing each API as it is built |
| UI design | Figma | Wireframes |
| Version control | Git and GitHub | Source code management |
| Editor | Visual Studio Code | Development |

MySQL was chosen because the system's data is strongly relational: users, bookings, rooms, services, and payments are connected, and booking requires transactions to prevent double booking.

Image storage may move to Cloudinary if the chosen hosting service does not keep uploaded files.

The system follows the **MVC (Model-View-Controller)** architecture, with a service layer for business rules:

| Layer | Implementation | Responsibility |
|---|---|---|
| Model | Model files in the backend | SQL queries and database access |
| View | ReactJS interface using JSON responses | Displaying data to users |
| Controller | Controller files in the backend | Receiving requests and sending responses |
| Service | Service files in the backend | Business rules and transactions |

## 7. Main System Modules

| Module | Responsibility | Priority |
|---|---|---|
| User Management | Registration, login, logout, profile, and role-based access | Core |
| Room Booking | Room search, details, availability, and booking | Core |
| Hotel Service | Massage, breakfast, buffet, laundry, and housekeeping | Core |
| Food and Drink Ordering | Food, coffee, and drink orders with room delivery | Core |
| Tourism Service | Motorbike rental, airport pickup, shuttle, and local tours | Core |
| Reception Support | Support tickets between guests and reception | Core |
| Review and Rating | Feedback and ratings after a stay, service, or food order | Core |
| Admin Dashboard | Management of all data and statistics | Core |
| Notification | In-app booking and service status updates | Extended |
| Payment and Invoice | Payment simulation and invoices | Extended |
| Voucher | Discount codes applied to bookings and orders | Extended |
| Smart Features | Comparison and rule-based recommendation | Extended |

## 8. Database Design Idea

The system uses a MySQL relational database named `smart_hotel_concierge`. The preliminary tables are:

| Area | Tables |
|---|---|
| Users | `users` |
| Rooms | `room_types`, `amenities`, `room_type_amenities`, `rooms`, `room_images` |
| Room booking | `bookings` |
| Hotel services | `services`, `service_bookings` |
| Food and drink | `menu_items`, `food_orders`, `food_order_items` |
| Tourism | `tours`, `tour_bookings`, `transport_bookings` |
| Support | `support_tickets`, `ticket_messages` |
| Feedback | `reviews` |
| Extended features | `payments`, `invoices`, `vouchers`, `notifications` |

Each user can have many bookings. Each room belongs to one room type. Each booking can have many service requests and food orders. The final design, including primary keys, foreign keys, and relationships, is defined in the ERD during the System Design stage.

## 9. Security

- Passwords are hashed with Bcrypt and are never stored in plain text.
- JWT protects logged-in routes, and role checks protect admin routes.
- Users can only access their own bookings, orders, and tickets.
- All API input is validated on the backend.
- All database queries are parameterized to prevent SQL injection.
- Secrets are kept in environment variables and are never committed to GitHub.
- Uploaded files are limited by file type and size.

## 10. Project Development Plan

The project must be submitted on **4 December 2026**. Each feature is built from database to API to interface, and is tested before the next feature starts.

### Completed: Research and Requirement Analysis

- Research hotel booking systems and tourism service platforms.
- Identify the main problems and project objectives.
- Define target users.
- List all important features.
- Prepare the project proposal.
- Choose the technology stack.
- Set up the development environment and repository.

### 7–9 November: System Design

- Analyze system entities.
- Design the ERD, including primary keys, foreign keys, and relationships.
- Design database tables.
- Write the SQL schema and seed data scripts.
- Design the use case diagram and system architecture.
- Define the API list.
- Prepare wireframes for main pages.

### 10–12 November: Project Setup and Authentication

- Set up the backend and frontend projects.
- Connect the backend to the database.
- Develop the register and login APIs and pages.
- Add password hashing and JWT authentication.
- Add user and admin role control.
- Develop the user profile.
- Do a first test deployment.

### 13–15 November: Room Management

- Develop room and room type management for admins.
- Add room image upload.
- Develop the home, room listing, and room detail pages.
- Add search and filter.

### 16–18 November: Room Booking

- Add room availability checking.
- Develop room booking with double-booking protection.
- Develop the booking page and booking history.
- Add booking update, cancellation, and admin booking management.

### 19–20 November: Hotel Service Booking

- Develop service management for admins.
- Develop booking for massage, breakfast, buffet, laundry, and housekeeping.
- Add service status tracking.

### 21–22 November: Food Ordering and Tourism Services

- Develop food and drink ordering with room delivery.
- Develop motorbike rental and airport pickup booking.
- Develop local tour management and booking.
- Add status management for these services.

### 23–24 November: Support, Reviews, and Admin Dashboard

- Develop support tickets.
- Develop reviews and ratings.
- Complete the admin dashboard and user management.
- Add charts for statistics.

### 25–27 November: Extended Features

- Add in-app notifications.
- Add payment simulation and invoice generation.
- Add vouchers and discounts.
- Add comparison and smart recommendation.
- Add Optional features only if time remains.

### 28–30 November: Testing and Bug Fixing

- Run full end-to-end tests of user and admin flows.
- Review basic security and role permissions.
- Test validation and error handling.
- Fix bugs and improve the UI.
- Deploy the frontend, backend, and production database.

### 1–3 December: Report, Documentation, and Presentation

- Write the project report.
- Prepare diagrams and screenshots.
- Explain system design and implementation.
- Prepare testing evidence.
- Prepare the user guide.
- Review the whole system.
- Prepare presentation slides.
- Prepare the demo script.
- Practice the project demonstration.

### 4 December: Submission

- Submit the project.

## 11. Expected Outcome

At the end of the project, the expected outcome is a working, deployed web application that allows users to book hotel rooms, hotel services, and tourism services online. The system also allows hotel admins to manage rooms, services, bookings, users, and reviews.

The project is expected to show important IT skills such as frontend development, backend development, relational database design, authentication, CRUD operations, transactional booking logic, an admin dashboard, and system testing.

This project can be useful for hotels that want to provide a better digital service experience for their guests. It can also help tourists manage their hotel stay and travel services more conveniently.

## 12. Conclusion

This project focuses on building a smart hotel concierge and tourism service booking web application. The system combines room booking, hotel service booking, food ordering, tourism service booking, customer support, and admin management in one platform.

The project is suitable for a final year IT project because it includes many important technical parts such as user authentication, database management, a booking system, role-based access, an admin dashboard, and system testing. It also solves a real problem in the hotel and tourism industry by improving the convenience of hotel guests and supporting hotel staff in managing services more effectively.
