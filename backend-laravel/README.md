# Panda — Backend API

Laravel REST API for the Panda freelance marketplace platform.

## Tech Stack

- **Laravel** — PHP framework
- **Laravel Sanctum** — API authentication
- **MySQL** — Database

## Features

- Authentication (Register, Login, Google OAuth)
- Freelancer & Client profiles
- Job postings and proposals
- Real-time chat messaging
- Payments and wallets
- Reviews and ratings
- AI assistant integration
- Admin dashboard

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```
