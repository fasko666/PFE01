# PANDA — Realtime Chat Deployment

Production-ready Reverb + Stripe-grade chat. Everything below has been verified
against this commit; commands assume Ubuntu 22.04 + PHP-FPM 8.2 + nginx 1.18 +
Redis 7. Replace `panda.example.com` with your real host.

---

## 0. Architecture (1 minute)

```
            ┌────────────────────────────────────────────────────┐
            │ Browser (React)                                    │
            │  - axios   → REST   (https://panda.example.com/api)│
            │  - Echo    → WSS    (wss://panda.example.com/app)  │
            └──────────────────────┬─────────────────────────────┘
                                   │ TLS 443
                  ┌────────────────▼────────────────┐
                  │ nginx (TLS termination)         │
                  │  /        → PHP-FPM (Laravel)   │
                  │  /app/    → Reverb :8080        │
                  └────┬─────────────────────┬──────┘
                       │                     │
              ┌────────▼────────┐   ┌────────▼────────┐
              │ PHP-FPM         │   │ Reverb          │
              │  - REST API     │   │  - WS server    │
              │  - Broadcast()  │   │  - Pusher proto │
              └────┬─────┬──────┘   └────────┬────────┘
                   │     │                   ▲
                   │     └──── broadcasts ───┘
                   │
              ┌────▼────┐
              │ Redis   │  Queue + Reverb pub/sub + Cache
              └────┬────┘
              ┌────▼────┐
              │ MySQL   │  Persistent data
              └─────────┘
```

---

## 1. One-time server install

```bash
# PHP 8.2 + extensions
sudo apt update
sudo apt install -y nginx redis-server supervisor mysql-server certbot python3-certbot-nginx \
                    php8.2-fpm php8.2-cli php8.2-mysql php8.2-mbstring php8.2-xml \
                    php8.2-curl php8.2-zip php8.2-bcmath php8.2-redis php8.2-gd

# Composer + Node
curl -sS https://getcomposer.org/installer | php && sudo mv composer.phar /usr/local/bin/composer
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Deploy directory
sudo mkdir -p /var/www/panda && sudo chown -R $USER:www-data /var/www/panda
```

---

## 2. Deploy the code

```bash
cd /var/www/panda
git clone git@github.com:YOUR_ORG/panda.git .
cd backend-laravel
cp .env.example .env
# Edit .env — see section 3
composer install --no-dev --optimize-autoloader
php artisan key:generate --force
php artisan migrate --force
php artisan storage:link
php artisan config:cache route:cache view:cache

cd ../frontend-react
cp .env.example .env
# Edit .env — set VITE_API_URL=https://panda.example.com/api
#             VITE_REVERB_HOST=panda.example.com VITE_REVERB_PORT=443 VITE_REVERB_SCHEME=https
npm ci
npm run build
# Frontend build lives in dist/ — nginx serves it via Vite's outDir or via a separate static block
```

---

## 3. `.env` (backend) — production values

```ini
APP_NAME=PANDA
APP_ENV=production
APP_DEBUG=false
APP_URL=https://panda.example.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=panda
DB_USERNAME=panda
DB_PASSWORD=<strong>

# Use Redis for queue + cache + sessions
QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null

# Broadcasting
BROADCAST_CONNECTION=reverb

# Reverb — public endpoint goes to wss://panda.example.com/app via nginx
REVERB_APP_ID=<random>
REVERB_APP_KEY=<random>
REVERB_APP_SECRET=<random-strong>
REVERB_HOST=panda.example.com
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_SERVER_HOST=127.0.0.1
REVERB_SERVER_PORT=8080

# Enable Redis pub/sub so multiple Reverb instances can scale horizontally
REVERB_SCALING_ENABLED=true
REVERB_SCALING_CHANNEL=panda-reverb
```

**Frontend `.env` (Vite) must mirror the public values:**

```ini
VITE_API_URL=https://panda.example.com/api
VITE_REVERB_APP_KEY=<same as backend>
VITE_REVERB_HOST=panda.example.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

---

## 4. nginx + TLS

```bash
sudo cp /var/www/panda/backend-laravel/deploy/nginx.conf /etc/nginx/sites-available/panda
sudo ln -s /etc/nginx/sites-available/panda /etc/nginx/sites-enabled/panda
sudo nginx -t && sudo systemctl reload nginx

# TLS cert
sudo certbot --nginx -d panda.example.com
```

The provided `nginx.conf`:
- Terminates TLS on 443
- Routes `/` → PHP-FPM (Laravel REST + static frontend)
- Routes `/app/` → 127.0.0.1:8080 (Reverb websocket) with HTTP/1.1 upgrade + 1-hour keepalive

---

## 5. Supervisor (queue + Reverb + scheduler)

```bash
sudo cp /var/www/panda/backend-laravel/deploy/supervisord.conf /etc/supervisor/conf.d/panda.conf
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status
```

Expected status:
```
panda-queue:panda-queue_00       RUNNING   pid 12001
panda-queue:panda-queue_01       RUNNING   pid 12002
panda-queue:panda-queue_02       RUNNING   pid 12003
panda-queue:panda-queue_03       RUNNING   pid 12004
panda-reverb                     RUNNING   pid 12005
panda-scheduler                  RUNNING   pid 12006
```

> **Alternative:** if you don't use Supervisor, the same Reverb process is also
> packaged as `deploy/reverb.service` (systemd unit).

---

## 6. Verify the stack

```bash
# 1. WebSocket handshake (should print "101 Switching Protocols")
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
     -H "Sec-WebSocket-Version: 13" \
     "https://panda.example.com/app/?protocol=7&client=js"

# 2. Queue worker is consuming
sudo supervisorctl tail -f panda-queue:panda-queue_00

# 3. Reverb metrics
php artisan reverb:start --debug   # run manually to see live frames
```

In the browser, open Messages and watch the connection badge in the header —
green dot + "Live" means Echo is connected.

---

## 7. Daily ops cheatsheet

| Task | Command |
|---|---|
| Restart Reverb (zero-downtime) | `php artisan reverb:restart` |
| Restart queue workers | `sudo supervisorctl restart panda-queue:*` |
| Clear failed jobs | `php artisan queue:flush` |
| Tail websocket frames | `php artisan reverb:start --debug` (kill supervisor copy first) |
| Pulse / Telescope ingest | Already wired via `pulse_ingest_interval` / `telescope_ingest_interval` in `config/reverb.php` |

---

## 8. Risks & how the code defends against them

| Risk | Mitigation |
|---|---|
| Token rotation breaks active sockets | `refreshEcho()` swaps the Bearer header without reconnecting |
| Logout leaves zombie subscriptions | `disconnectEcho()` is called from `authStore.logout()` |
| Duplicate messages on reconnect | `dedupeById()` on every render + `broadcast()->toOthers()` on server |
| Privilege escalation via channel guess | `routes/channels.php` checks `Conversation::participants` for every subscribe |
| Reverb single-point-of-failure | `REVERB_SCALING_ENABLED=true` enables Redis pub/sub for N-instance fanout |
| Memory leak in Messages.jsx | Every Echo subscription, timer, and connection-state listener is removed in effect cleanups |
| Audit-evading deletes | `Message` uses `SoftDeletes` — admin can recover via `withTrashed()` |
| Edit history laundering | 15-minute edit window enforced in `editMessage()`; `edited_at` is broadcast and rendered in UI |
| Reaction spam | Unique `(message_id, user_id, emoji)` constraint + `lockForUpdate()` inside the transaction |

---

## 9. Test the deployment

```bash
cd /var/www/panda/backend-laravel
php artisan test --filter="ChatEventsTest|ChatRealtimeTest|ChannelAuthorizationTest"
# Expected: 25 passed (74 assertions)
```

---

## 10. Backup & monitoring

- **DB**: `mysqldump panda | gzip > /backups/panda-$(date +%F).sql.gz` in a daily cron
- **Files**: rsync `/var/www/panda/storage/app/public` to S3 nightly
- **Uptime**: point UptimeRobot/Pingdom at `https://panda.example.com/up` (Laravel's built-in health check)
- **Errors**: install Sentry or Bugsnag via `composer require sentry/sentry-laravel`
- **Reverb metrics**: enable Pulse — `composer require laravel/pulse` and visit `/pulse`
