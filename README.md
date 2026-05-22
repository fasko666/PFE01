# Panda — Freelance Marketplace

A full-stack freelance marketplace platform built with Laravel and React.

## Structure

```
├── backend-laravel/    # Laravel REST API
└── frontend-react/     # React + Vite frontend
```

## Quick Start

**Backend:**
```bash
cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

**Frontend:**
```bash
cd frontend-react
npm install
npm run dev
```
