# 🍽️ Restaurant Digital Menu System

A full-stack web application for managing a restaurant's end-to-end digital operations — from online menu browsing and order placement through to kitchen queue management, table reservations, and administrative analytics. Built for an Ethiopian restaurant using **ETB (Ethiopian Birr)** as the currency unit.

![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql)

---

## ✨ Key Features

- **Customers** browse the menu, add items to cart, place orders, and make table reservations — no account required.
- **Managers** monitor live orders, manage the menu catalogue, confirm reservations, and view reports.
- **Chefs** see a real-time kitchen queue and update order status as meals are prepared.
- **Admins** have full visibility — user management, system settings, and an analytics dashboard with charts.

---

## 🛠️ Tech Stack

### Frontend

| Package | Version | Purpose |
|---|---|---|
| React | 19.2 | UI framework |
| React Router DOM | 7.11 | Client-side routing & protected routes |
| Vite | 7.2 | Build tool & dev server |
| Tailwind CSS | 4.1 | Utility-first styling |
| Chart.js + react-chartjs-2 | 4.5 / 5.3 | Bar, Line, Doughnut charts in dashboard |
| Framer Motion | 12.38 | Page & component animations |
| React Icons | 5.6 | Icon library (FontAwesome set) |
| Axios | 1.13 | HTTP client |
| @emailjs/browser | 4.4 | Contact / feedback emails |
| react-responsive-carousel | 3.2 | Image carousels |

### Backend

| Technology | Role |
|---|---|
| Node.js + Express | REST API server |
| PostgreSQL | Relational database — orders, users, menu, reservations |
| JWT | Stateless authentication — Bearer token in Authorization header |
| Multer | Image uploads for menu items |
| bcrypt | Password hashing |

---

## 📁 Project Structure

```
Restaurant-Digital-Menu-System/
├── frontend/               ← Vite + React app
│   └── src/
│       ├── API/            ← All API call modules
│       │   ├── apiconfig.js         (base fetch wrapper + auth)
│       │   ├── authapi.js           (login, register, JWT helpers)
│       │   ├── menuapi.js           (menu CRUD)
│       │   ├── orderapi.js          (order CRUD)
│       │   ├── reservapi.js         (reservation CRUD)
│       │   ├── resinfo.js           (restaurant info & sections)
│       │   └── userapi.js           (user management)
│       ├── assets/         ← Static assets
│       ├── componests/     ← Shared components (ProtectedRoute, etc.)
│       ├── config/         ← Constants (API_BASE_URL)
│       ├── Hook/           ← Custom React hooks
│       ├── layout/
│       │   ├── client/     ← Public layout (navbar + footer)
│       │   ├── manager/    ← Manager sidebar nav
│       │   ├── kichin/     ← Kitchen sidebar nav
│       │   └── AdminNav/   ← Admin sidebar nav
│       ├── pages/
│       │   ├── Home/       ← Landing page + Logo
│       │   ├── client/     ← Public-facing pages
│       │   ├── kitchen/    ← Chef portal pages
│       │   ├── Manager/    ← Manager portal pages
│       │   ├── Admin/      ← Admin portal pages
│       │   └── SuperAdmin/ ← Super-admin (in progress)
│       ├── service/        ← Service-layer wrappers
│       ├── stayle/         ← Global CSS / Tailwind base
│       └── test/           ← Test files
│   ├── App.jsx             ← Route definitions
│   └── main.jsx
└── backend/                ← Node.js / Express API server
```

---

## 🗺️ Pages & Routes

### Public Routes (no login required)

| Path | Component | Description |
|---|---|---|
| `/` | Home | Landing page — hero, about, menu preview, CTA |
| `/menu` | ClientMenu | Full menu with category filters |
| `/checkout` | Checkout | Cart review & order placement |
| `/reserve` | Reserv | Table reservation form (EAT timezone) |
| `/aboutme` | Aboutme | About the restaurant |
| `/login` | Login | Username + password login |
| `/register` | Register | New customer registration |
| `/profile` | Profile | Customer profile & order history |
| `/forgot-password` | ForgotPassword | Send reset email |
| `/reset-password` | ResetPassword | Set new password via token |

### Manager Portal (`/manager` — roles: admin, manager)

| Path | Component | Description |
|---|---|---|
| `/manager/dashboard` | ManagerDashboard | Overview metrics & charts |
| `/manager/menu` | MenuList | Menu item table with filters |
| `/manager/menu/create` | CreateMenuItem | Add new dish form |
| `/manager/menu/edit/:id` | EditMenuItem | Edit existing dish |
| `/manager/orders` | OrdersManagement | All orders, status updates |
| `/manager/reservations` | ReservationsManagement | Confirm / reject reservations |
| `/manager/settings` | Index (Settings) | General settings |
| `/manager/settings/restaurant-info` | RestInfo | Edit hero, about, CTA sections |
| `/manager/profile` | ManagerProfile | Manager account details |
| `/manager/reports` | — | Coming soon |
| `/manager/feedback` | — | Coming soon |
| `/manager/chat` | — | Coming soon |

### Kitchen / Chef Portal (`/chef` — roles: admin, chef)

| Path | Component | Description |
|---|---|---|
| `/chef/dashboard` | KitchenDashboard | Kitchen queue overview |
| `/chef/orders` | ActiveOrdersPage | Live orders with status controls |
| `/chef/menu` | MenuList | Menu reference (read-only) |
| `/chef/profile` | ChefProfile | Chef account details |

### Admin Portal (`/admin`)

| Path | Component | Description |
|---|---|---|
| `/admin` or `/admin/dashboard` | AdminDashboard | Analytics: revenue, orders, charts |
| `/admin/users` | UserManagement | List, role-change, delete users |
| `/admin/menu` | MenuList | Full menu management |
| `/admin/orders` | OrdersManagement | All orders across roles |
| `/admin/reservations` | ReservationsManagement | All reservations |
| `/admin/setting` | AsettingsIndex | System settings |
| `/admin/setting/restaurant-info` | RestInfo | Edit all website sections |
| `/admin/profile` | AdminProfile | Admin account details |

---

## 🔌 API Reference

All requests go to `VITE_API_BASE_URL` (configured in `.env`). Public endpoints require no token. Protected endpoints need `Authorization: Bearer <token>` in the request header.

### Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | Public | Login — returns JWT + user object |
| POST | `/auth/register` | Public | Register new customer account |
| POST | `/auth/logout` | Public | Invalidate session server-side |
| GET | `/auth/profile` | Bearer | Get authenticated user profile |
| PUT | `/auth/profile` | Bearer | Update profile (supports FormData) |
| POST | `/auth/change-password` | Bearer | Change password |
| GET | `/auth/verify` | Bearer | Verify token validity |
| POST | `/auth/refresh-token` | Bearer | Refresh expiring token |
| POST | `/auth/forgot-password` | Public | Send reset email |
| POST | `/auth/reset-password` | Public | Reset password with token |

### Menu (`/menu`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/menu` | Public | List all items (supports filters: category, price, sortBy, page) |
| GET | `/menu/:id` | Public | Single item by ID |
| GET | `/menu/categories/all` | Public | All distinct categories |
| GET | `/menu/search/:query` | Public | Search by name / description |
| POST | `/menu` | Bearer | Create new menu item (FormData with image) |
| PUT | `/menu/:id` | Bearer | Update item (FormData) |
| PATCH | `/menu/:id/availability` | Bearer | Toggle is_available |
| DELETE | `/menu/:id` | Bearer | Delete item |
| POST | `/menu/bulk/availability` | Bearer | Bulk toggle availability |
| POST | `/upload/image` | Bearer | Upload image file |
| DELETE | `/upload/image/:filename` | Bearer | Delete uploaded image |

### Orders (`/orders`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | Public | Place a new order |
| GET | `/orders` | Bearer | All orders (admin / manager) |
| GET | `/orders/:id` | Bearer | Order by ID |
| PUT | `/orders/:id` | Bearer | Full order update |
| PATCH | `/orders/:id/status` | Bearer | Update status only |
| DELETE | `/orders/:id` | Bearer | Delete order |
| GET | `/orders/status/:status` | Bearer | Filter by status |
| GET | `/orders/table/:number` | Bearer | Orders for a table |
| GET | `/orders/kitchen/queue` | Bearer | Kitchen queue |
| GET | `/orders/today` | Bearer | Today's orders |
| GET | `/orders/active` | Bearer | Active (non-completed) orders |
| GET | `/orders/search` | Bearer | Search orders (?q=) |

### Reservations (`/reservations`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/reservations` | Public | Create reservation (Africa/Addis_Ababa timezone) |
| GET | `/reservations` | Bearer | All reservations |
| GET | `/reservations/:id` | Bearer | Single reservation |
| PATCH | `/reservations/:id/status` | Bearer | Confirm / reject |
| PATCH | `/reservations/:id` | Bearer | Update reservation details |
| DELETE | `/reservations/:id` | Bearer | Delete reservation |

### Users (`/user`) & Restaurant Info (`/restaurant`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/user` | Bearer | All users (admin only) |
| PATCH | `/user/:id/role` | Bearer | Change user role |
| DELETE | `/user/:id` | Bearer | Delete user |
| GET | `/user/stats` | Bearer | User count statistics |
| GET | `/user/search` | Bearer | Search users (?q=) |
| GET | `/restaurant/info` | Public | Full restaurant content (hero, about, team…) |
| PUT | `/restaurant/section/:section` | Bearer | Update a content section |
| POST | `/restaurant/stats` | Bearer | Add a stat tile |
| PUT | `/restaurant/stats/:id` | Bearer | Update stat tile |
| DELETE | `/restaurant/stats/:id` | Bearer | Delete stat tile |

---

## 🔐 Authentication & Role System

Authentication uses JSON Web Tokens (JWT). On login the server returns a token stored in `localStorage`. Every protected API call attaches it as a Bearer token. The frontend `ProtectedRoute` component reads the user's role and blocks access to portals the user is not authorised for.

| Role | Portal | Permissions |
|---|---|---|
| `customer` | `/` (public) | Browse menu, place orders, make reservations, manage own profile |
| `manager` | `/manager` | Menu CRUD, order management, reservation management, settings, restaurant info |
| `chef` | `/chef` | View kitchen queue, update order status, view menu (read-only) |
| `admin` | `/admin` | All manager permissions + user management + admin analytics dashboard |

**Token lifecycle:**
- Token stored in `localStorage` under the key `token`
- User object stored in `localStorage` under the key `user`
- `verifyAuth()` validates the token with the server on app load
- `refreshToken()` exchanges a near-expiry token for a fresh one
- `logout()` calls `POST /auth/logout` then clears both localStorage keys

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ (or yarn / pnpm)
- PostgreSQL 14+ running locally or a hosted instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Restaurant-Digital-Menu-System.git
cd Restaurant-Digital-Menu-System
```

### 2. Frontend setup

```bash
cd frontend
npm install

# Create environment file
cp .env.example .env
# Then edit .env and set VITE_API_BASE_URL

npm run dev          # starts on http://localhost:5173
```

### 3. Backend setup

```bash
cd ../backend
npm install

# Create environment file
cp .env.example .env
# Set DATABASE_URL, JWT_SECRET, PORT, etc.

# Run database migrations
npm run migrate

node index.js        # or: npm run dev (with nodemon)
```

### 4. Environment Variables

| Variable | File | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `frontend/.env` | e.g. `http://localhost:5000/api` |
| `PORT` | `backend/.env` | Express server port (default 5000) |
| `DATABASE_URL` | `backend/.env` | PostgreSQL connection string |
| `JWT_SECRET` | `backend/.env` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | `backend/.env` | Token expiry e.g. `7d` |
| `UPLOAD_PATH` | `backend/.env` | Directory for uploaded images |

### 5. Available Scripts (Frontend)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR on port 5173 |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint across the `src/` directory |

---

## 🏗️ Key Design Decisions

| Decision | Rationale |
|---|---|
| No auth on `/admin` routes | Admin nav is accessible without ProtectedRoute in the router. Add `<ProtectedRoute allowedRoles={['admin']}>` around the `/admin` block to restrict it in production. |
| Public order creation | Customers can place orders without registering, reducing friction at the point of sale. |
| ETB currency | The system is built for an Ethiopian restaurant; all monetary values are in Ethiopian Birr. |
| Africa/Addis_Ababa timezone | Reservation times are stored with the EAT timezone offset to prevent scheduling errors. |
| 60-second dashboard refresh | `setInterval` on `fetchAllData` keeps the admin/manager dashboard live without a WebSocket dependency. |
| FormData for images | Menu item creation and profile updates use `multipart/form-data` so images are uploaded in the same request as text fields. |
| Promise.allSettled for dashboard | Each data source (orders, menu, users, reservations) is fetched in parallel; a single API failure does not block the whole dashboard. |

---

## ⚠️ Known Issues

- Admin routes (`/admin/*`) are not wrapped in `ProtectedRoute` — any authenticated user can access them if they know the URL.
- Growth percentages on the admin dashboard (`userGrowth`, `orderGrowth`, `revenueGrowth`) are currently hardcoded to example values.
- Occupancy rate on the dashboard is a static placeholder (65%).
- SuperAdmin page folder exists in the codebase but has no routes or components wired up yet.

## 🗓️ Roadmap

- [ ] Reports & Analytics page under `/manager/reports`
- [ ] In-app feedback / rating system (`/manager/feedback`)
- [ ] Real-time chat between staff (`/manager/chat`)
- [ ] SuperAdmin portal
- [ ] WebSocket or Server-Sent Events for instant kitchen queue updates
- [ ] Real day-over-day growth calculations for the admin dashboard

---

## 🤝 Contributing

1. Fork the repository and create a feature branch: `git checkout -b feature/your-feature`
2. Follow the existing code conventions — functional components, Tailwind for styles, Framer Motion for animations.
3. Run `npm run lint` and fix all warnings before committing.
4. Open a Pull Request with a clear description of the change and screenshots for UI changes.

---

*Built with React 19 + Vite + Node.js/Express + PostgreSQL*
