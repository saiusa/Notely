# Notely

> A private, community-driven social journaling platform built for people who want a safe space to share thoughts, moods, and everyday stories.

---

## About Notely

Notely is a full-stack social journaling web application that blends the intimacy of personal journaling with the warmth of a community. Unlike mainstream social media platforms, Notely is designed to feel calm, focused, and personal — a place to document your day, connect with people who share your interests, and reflect on your journey.

Users can write mood-tagged journal posts, join topic-based communities, react to others' entries, engage in threaded discussions, and receive real-time notifications — all within a sleek, dark-mode interface.

---

## Core Features

### 🔐 Authentication & User Management
- Secure registration with `@username` validation and auto-suggestion
- Laravel Sanctum token-based authentication (Bearer tokens)
- Remember Me for persistent sessions
- Email-based password reset via Resend API
- Two-factor authentication (TOTP) support
- Public user profiles with cover photo, bio, avatar, and location
- Account settings for privacy preferences (reactions, comments, notifications)

### 📝 Social & Journaling Feed
- Algorithmic home feed showing all posts (community and personal)
- Mood-tagged posts with colour-coded pill indicators (Happy, Sad, Excited, Grateful, etc.)
- Hashtag support with relational persistence
- Post types: Standard, Community-scoped, and Anonymous
- Image uploads on posts
- Toggle-based like/reaction system with live counts
- Threaded comments with nested reply support
- Post sharing with copy-link functionality
- Soft deletion for data integrity

### 🌐 Communities
- Browse and join categorised topic communities
- Post and interact within a specific community
- Community rules, descriptions, and custom images
- Slug-based community URLs

### 🔍 Search
- Debounced live search across users, posts, and communities
- Styled dropdown overlay with safe navigation

### 🔔 Notifications
- In-app notifications for likes, comments, and activity
- Unread dot indicators and a dropdown notification panel

### 🛡️ Admin & Moderation
- **Dashboard Analytics** — Real-time stat cards (Total Users, Posts, Communities)
- **7-Day Engagement Chart** — Recharts line graph of daily posts vs. engagements
- **Top Performing Posts** — Ranked by combined likes + comments
- **User Management** — Paginated table with search, real avatars, role badges, and status
- **User Suspension** — Instantly revokes all Sanctum tokens and active sessions on suspend
- **Global Suspension Guard** — Every API request checks suspension status server-side
- **Content Moderation Queue** — Grouped accordion view of flagged posts and comments per user
- **Dismiss / Delete** — Admins can clear reports or permanently remove content

---

## Tech Stack

### Frontend
| Technology | Role |
|---|---|
| **React 18** | Component-based SPA framework |
| **React Router DOM 7** | Client-side routing |
| **SCSS (Sass)** | Design token system and component styling |
| **Vite 7** | Build tool and dev server |
| **Axios** | HTTP client with global request/response interceptors |
| **Recharts** | Data visualisation for admin analytics |
| **Redux Toolkit** | Global state management |

### Backend
| Technology | Role |
|---|---|
| **Laravel 12** | PHP MVC framework and REST API layer |
| **PHP 8.2+** | Server-side language |
| **Laravel Sanctum** | Stateless token-based API authentication |
| **Resend** | Transactional email (password reset, notifications) |

### Database & Storage
| Technology | Role |
|---|---|
| **MySQL** | Primary relational database |
| **Laravel Storage** | Local file system for media (avatars, covers, post images) |

---

## System Architecture

```
┌─────────────────────────────────────┐
│  React SPA (Vite, React Router)      │
│  ─ HashRouter for client routing     │
│  ─ AuthContext (global auth state)   │
│  ─ Redux Toolkit (feed/post state)   │
└──────────────┬──────────────────────┘
               │ HTTPS / REST API
               ▼
┌─────────────────────────────────────┐
│  Laravel 12 (api.php routes)         │
│  ─ Sanctum middleware (auth:sanctum) │
│  ─ Admin role middleware             │
│  ─ Base Controller suspension guard  │
└──────────────┬──────────────────────┘
               │ Eloquent ORM
               ▼
┌─────────────────────────────────────┐
│  MySQL Database                      │
│  ─ 20+ relational tables             │
│  ─ Soft deletes on users & posts     │
└─────────────────────────────────────┘
```

**API Communication:**
- All requests flow through a centralised Axios instance with a **request interceptor** that automatically attaches the Bearer token from `localStorage`.
- **Response interceptors** handle `401 Unauthorized` (expired session) and `403 Forbidden` (suspended account) globally, clearing the local token and redirecting to the login screen.

**Media Storage:**
- User uploads (avatars, cover photos, post images) are stored in Laravel's local filesystem under `storage/app/public/`.
- Files are publicly accessible via a symbolic link at `/storage/`.

---

## Project Structure

```
Notely/
├── backend/                  # Laravel 12 API
│   ├── app/
│   │   ├── Http/Controllers/Api/   # All API controllers
│   │   └── Models/                 # Eloquent models
│   ├── database/migrations/        # Database schema
│   └── routes/api.php              # API route definitions
│
└── resources/
    ├── js/
    │   ├── components/         # Reusable UI components
    │   ├── context/            # React Context (Auth)
    │   ├── pages/              # Page-level components
    │   └── services/           # Axios API service layer
    └── sass/                   # SCSS design system
        ├── _design-tokens.scss # Global design tokens
        ├── _variables.scss     # Variable references
        └── components/         # Component-scoped styles
```

---

## Getting Started

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 20+
- MySQL

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/saiusa/Notely.git
cd Notely

# 2. Install backend dependencies
cd backend
composer install
cp .env.example .env
php artisan key:generate

# 3. Configure your .env (DB credentials, Resend API key, etc.)

# 4. Run migrations
php artisan migrate

# 5. Create storage symlink
php artisan storage:link

# 6. Install frontend dependencies (from project root)
cd ..
npm install

# 7. Build frontend assets
npm run build
```

### Development

```bash
# Start the Laravel dev server
cd backend && php artisan serve

# Start Vite dev server (in a separate terminal, from project root)
npm run dev
```

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
