"""
Generates panda.sql — complete MySQL 8 schema for the Panda project.
Covers all 30 Laravel migrations in order.
"""
import datetime

OUT = r"C:\Users\Pro\Desktop\PFE O1\panda.sql"

SQL = r"""-- ============================================================
--  Panda — Complete MySQL 8 Schema
--  Generated: {date}
--  Laravel 12 / PHP 8.2  |  charset utf8mb4_unicode_ci
-- ============================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `panda`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `panda`;

-- ──────────────────────────────────────────────────────────
-- 1. users
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`                        bigint unsigned NOT NULL AUTO_INCREMENT,
  `name`                      varchar(255)    NOT NULL,
  `username`                  varchar(255)    NOT NULL,
  `email`                     varchar(255)    NOT NULL,
  `email_verified_at`         timestamp       NULL DEFAULT NULL,
  `password`                  varchar(255)    NOT NULL,
  `two_factor_secret`         text            NULL,
  `two_factor_recovery_codes` text            NULL,
  `two_factor_confirmed_at`   timestamp       NULL DEFAULT NULL,
  `role`                      enum('freelancer','client','admin') NOT NULL DEFAULT 'client',
  `avatar`                    varchar(255)    NULL,
  `country`                   varchar(10)     NULL,
  `timezone`                  varchar(80)     NULL,
  `phone`                     varchar(30)     NULL,
  `phone_verified`            tinyint(1)      NOT NULL DEFAULT 0,
  `connects_balance`          int unsigned    NOT NULL DEFAULT 10,
  `is_active`                 tinyint(1)      NOT NULL DEFAULT 1,
  `is_verified`               tinyint(1)      NOT NULL DEFAULT 0,
  `is_online`                 tinyint(1)      NOT NULL DEFAULT 0,
  `is_platform`               tinyint(1)      NOT NULL DEFAULT 0,
  `last_seen_at`              timestamp       NULL DEFAULT NULL,
  `google_id`                 varchar(255)    NULL,
  `github_id`                 varchar(255)    NULL,
  `stripe_customer_id`        varchar(255)    NULL,
  `stripe_account_id`         varchar(255)    NULL,
  `stripe_account_status`     enum('none','pending','restricted','active','disabled') NOT NULL DEFAULT 'none',
  `stripe_charges_enabled`    tinyint(1)      NOT NULL DEFAULT 0,
  `stripe_payouts_enabled`    tinyint(1)      NOT NULL DEFAULT 0,
  `stripe_onboarded_at`       timestamp       NULL DEFAULT NULL,
  `remember_token`            varchar(100)    NULL,
  `deleted_at`                timestamp       NULL DEFAULT NULL,
  `created_at`                timestamp       NULL DEFAULT NULL,
  `updated_at`                timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`),
  INDEX `users_presence_idx` (`is_online`, `last_seen_at`),
  INDEX `users_stripe_customer_id` (`stripe_customer_id`),
  INDEX `users_stripe_account_id` (`stripe_account_id`),
  INDEX `users_is_platform` (`is_platform`),
  FULLTEXT KEY `users_search_idx` (`name`, `username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 2. personal_access_tokens  (Laravel Sanctum)
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id`             bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255)    NOT NULL,
  `tokenable_id`   bigint unsigned NOT NULL,
  `name`           varchar(255)    NOT NULL,
  `token`          varchar(64)     NOT NULL,
  `abilities`      text            NULL,
  `last_used_at`   timestamp       NULL DEFAULT NULL,
  `expires_at`     timestamp       NULL DEFAULT NULL,
  `created_at`     timestamp       NULL DEFAULT NULL,
  `updated_at`     timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  INDEX `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 3. cache / cache_locks
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key`        varchar(255) NOT NULL,
  `value`      mediumtext   NOT NULL,
  `expiration` int          NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE `cache_locks` (
  `key`        varchar(255) NOT NULL,
  `owner`      varchar(255) NOT NULL,
  `expiration` int          NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 4. jobs / job_batches / failed_jobs  (Laravel Queue)
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue`        varchar(255)    NOT NULL,
  `payload`      longtext        NOT NULL,
  `attempts`     tinyint unsigned NOT NULL,
  `reserved_at`  int unsigned    NULL DEFAULT NULL,
  `available_at` int unsigned    NOT NULL,
  `created_at`   int unsigned    NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches` (
  `id`             varchar(255) NOT NULL,
  `name`           varchar(255) NOT NULL,
  `total_jobs`     int          NOT NULL,
  `pending_jobs`   int          NOT NULL,
  `failed_jobs`    int          NOT NULL,
  `failed_job_ids` longtext     NOT NULL,
  `options`        mediumtext   NULL,
  `cancelled_at`   int          NULL DEFAULT NULL,
  `created_at`     int          NOT NULL,
  `finished_at`    int          NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid`       varchar(255)    NOT NULL,
  `connection` text            NOT NULL,
  `queue`      text            NOT NULL,
  `payload`    longtext        NOT NULL,
  `exception`  longtext        NOT NULL,
  `failed_at`  timestamp       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 5. wallets
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `wallets`;
CREATE TABLE `wallets` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`         bigint unsigned NOT NULL,
  `balance`         decimal(12,2)   NOT NULL DEFAULT '0.00',
  `pending_balance` decimal(12,2)   NOT NULL DEFAULT '0.00',
  `escrow_balance`  decimal(12,2)   NOT NULL DEFAULT '0.00',
  `created_at`      timestamp       NULL DEFAULT NULL,
  `updated_at`      timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wallets_user_id_unique` (`user_id`),
  CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 6. transactions
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
  `id`                   bigint unsigned NOT NULL AUTO_INCREMENT,
  `wallet_id`            bigint unsigned NOT NULL,
  `user_id`              bigint unsigned NOT NULL,
  `type`                 enum('credit','debit','escrow','commission','withdrawal','refund','deposit') NOT NULL,
  `direction`            enum('in','out') NOT NULL,
  `amount`               decimal(12,2)   NOT NULL,
  `fee`                  decimal(12,2)   NOT NULL DEFAULT '0.00',
  `balance_after`        decimal(12,2)   NOT NULL,
  `reference_type`       varchar(255)    NULL,
  `reference_id`         bigint unsigned NULL,
  `idempotency_key`      varchar(255)    NOT NULL,
  `description`          text            NULL,
  `counterparty_user_id` bigint unsigned NULL,
  `metadata`             json            NULL,
  `created_at`           timestamp       NULL DEFAULT NULL,
  `updated_at`           timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transactions_idempotency_key_unique` (`idempotency_key`),
  INDEX `transactions_wallet_id_index` (`wallet_id`),
  INDEX `transactions_user_id_index` (`user_id`),
  INDEX `transactions_reference_index` (`reference_type`,`reference_id`),
  CONSTRAINT `transactions_wallet_id_foreign` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 7. withdrawals
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `withdrawals`;
CREATE TABLE `withdrawals` (
  `id`                 bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`            bigint unsigned NOT NULL,
  `amount`             decimal(12,2)   NOT NULL,
  `fee`                decimal(12,2)   NOT NULL DEFAULT '0.00',
  `net`                decimal(12,2)   NOT NULL,
  `method`             enum('stripe','bank','paypal','wise','crypto') NOT NULL DEFAULT 'stripe',
  `status`             enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `external_ref`       varchar(255)    NULL,
  `stripe_transfer_id` varchar(255)    NULL,
  `stripe_payout_id`   varchar(255)    NULL,
  `rejection_reason`   text            NULL,
  `processed_at`       timestamp       NULL DEFAULT NULL,
  `created_at`         timestamp       NULL DEFAULT NULL,
  `updated_at`         timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `withdrawals_user_id_status` (`user_id`,`status`),
  INDEX `withdrawals_stripe_transfer_id` (`stripe_transfer_id`),
  CONSTRAINT `withdrawals_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 8. platform_settings
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `platform_settings`;
CREATE TABLE `platform_settings` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `key`         varchar(255)    NOT NULL,
  `value`       text            NULL,
  `description` varchar(255)    NULL,
  `group`       varchar(255)    NOT NULL DEFAULT 'general',
  `created_at`  timestamp       NULL DEFAULT NULL,
  `updated_at`  timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `platform_settings_key_unique` (`key`),
  INDEX `platform_settings_group_index` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `platform_settings` (`key`,`value`,`description`,`group`) VALUES
  ('fee.freelancer_pct',   '0.10', 'Service fee deducted from freelancer payouts (10%)',            'fees'),
  ('fee.client_pct',       '0.05', 'Service fee charged to client (5%)',                            'fees'),
  ('fee.contract_init',    '0.99', 'One-time contract initiation fee (USD flat)',                   'fees'),
  ('fee.withdrawal_flat',  '2.00', 'Flat withdrawal fee (USD)',                                     'fees'),
  ('fee.deposit_pct',      '0.029','Deposit processing fee (Stripe-style 2.9%)',                    'fees'),
  ('fee.deposit_flat',     '0.30', 'Deposit processing flat fee (USD)',                             'fees'),
  ('withdrawal.min',       '20.00','Minimum withdrawal amount (USD)',                               'withdrawals'),
  ('withdrawal.requires_approval','1','Admin approval required for withdrawals (1=yes,0=auto)',     'withdrawals');

-- ──────────────────────────────────────────────────────────
-- 9. stripe_webhook_events
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `stripe_webhook_events`;
CREATE TABLE `stripe_webhook_events` (
  `id`               bigint unsigned NOT NULL AUTO_INCREMENT,
  `stripe_event_id`  varchar(255)    NOT NULL,
  `type`             varchar(255)    NOT NULL,
  `payload`          json            NOT NULL,
  `status`           enum('received','processed','failed','ignored') NOT NULL DEFAULT 'received',
  `processing_error` varchar(255)    NULL,
  `attempts`         int             NOT NULL DEFAULT 0,
  `processed_at`     timestamp       NULL DEFAULT NULL,
  `created_at`       timestamp       NULL DEFAULT NULL,
  `updated_at`       timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stripe_webhook_events_stripe_event_id_unique` (`stripe_event_id`),
  INDEX `stripe_webhook_events_type_index` (`type`),
  INDEX `stripe_webhook_events_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 10. subscriptions / subscription_items
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `subscription_items`;
DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
  `id`            bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`       bigint unsigned NOT NULL,
  `type`          varchar(255)    NOT NULL DEFAULT 'default',
  `stripe_id`     varchar(255)    NOT NULL,
  `stripe_status` varchar(255)    NOT NULL,
  `stripe_price`  varchar(255)    NULL,
  `plan_slug`     varchar(255)    NOT NULL,
  `quantity`      int unsigned    NOT NULL DEFAULT 1,
  `trial_ends_at` timestamp       NULL DEFAULT NULL,
  `ends_at`       timestamp       NULL DEFAULT NULL,
  `created_at`    timestamp       NULL DEFAULT NULL,
  `updated_at`    timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscriptions_stripe_id_unique` (`stripe_id`),
  INDEX `subscriptions_user_id_stripe_status` (`user_id`,`stripe_status`),
  CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `subscription_items` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `subscription_id` bigint unsigned NOT NULL,
  `stripe_id`       varchar(255)    NOT NULL,
  `stripe_product`  varchar(255)    NOT NULL,
  `stripe_price`    varchar(255)    NOT NULL,
  `quantity`        int unsigned    NOT NULL DEFAULT 1,
  `created_at`      timestamp       NULL DEFAULT NULL,
  `updated_at`      timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subscription_items_stripe_id_unique` (`stripe_id`),
  CONSTRAINT `subscription_items_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 11. categories
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `parent_id`   bigint unsigned NULL,
  `name`        varchar(255)    NOT NULL,
  `slug`        varchar(255)    NOT NULL,
  `description` text            NULL,
  `icon`        varchar(255)    NULL,
  `created_at`  timestamp       NULL DEFAULT NULL,
  `updated_at`  timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  INDEX `categories_parent_id_index` (`parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 12. skills / freelancer_skills
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `freelancer_skills`;
DROP TABLE IF EXISTS `skills`;
CREATE TABLE `skills` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `name`        varchar(255)    NOT NULL,
  `slug`        varchar(255)    NOT NULL,
  `category_id` bigint unsigned NULL,
  `created_at`  timestamp       NULL DEFAULT NULL,
  `updated_at`  timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `skills_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `freelancer_skills` (
  `user_id`    bigint unsigned NOT NULL,
  `skill_id`   bigint unsigned NOT NULL,
  `level`      enum('beginner','intermediate','expert') NOT NULL DEFAULT 'intermediate',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`,`skill_id`),
  CONSTRAINT `freelancer_skills_user_id_foreign`  FOREIGN KEY (`user_id`)  REFERENCES `users`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `freelancer_skills_skill_id_foreign` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 13. freelancer_profiles
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `freelancer_profiles`;
CREATE TABLE `freelancer_profiles` (
  `id`                bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`           bigint unsigned NOT NULL,
  `title`             varchar(255)    NULL,
  `bio`               text            NULL,
  `hourly_rate`       decimal(10,2)   NULL,
  `experience_level`  enum('entry','mid','senior','expert') NOT NULL DEFAULT 'mid',
  `availability`      enum('full_time','part_time','not_available') NOT NULL DEFAULT 'full_time',
  `avg_rating`        decimal(3,2)    NOT NULL DEFAULT '0.00',
  `total_reviews`     int             NOT NULL DEFAULT 0,
  `total_earned`      decimal(12,2)   NOT NULL DEFAULT '0.00',
  `total_jobs`        int             NOT NULL DEFAULT 0,
  `payment_verified`  tinyint(1)      NOT NULL DEFAULT 0,
  `is_featured`       tinyint(1)      NOT NULL DEFAULT 0,
  `languages`         json            NULL,
  `education`         json            NULL,
  `certifications`    json            NULL,
  `portfolio_url`     varchar(255)    NULL,
  `onboarding_step`   int             NOT NULL DEFAULT 0,
  `onboarding_completed_at` timestamp NULL DEFAULT NULL,
  `created_at`        timestamp       NULL DEFAULT NULL,
  `updated_at`        timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `freelancer_profiles_user_id_unique` (`user_id`),
  FULLTEXT KEY `freelancer_profiles_search_idx` (`title`,`bio`),
  CONSTRAINT `freelancer_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 14. client_profiles
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `client_profiles`;
CREATE TABLE `client_profiles` (
  `id`               bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`          bigint unsigned NOT NULL,
  `company_name`     varchar(255)    NULL,
  `company_size`     varchar(50)     NULL,
  `industry`         varchar(255)    NULL,
  `website`          varchar(255)    NULL,
  `description`      text            NULL,
  `total_spent`      decimal(12,2)   NOT NULL DEFAULT '0.00',
  `total_jobs_posted` int            NOT NULL DEFAULT 0,
  `hire_rate`        decimal(5,2)    NOT NULL DEFAULT '0.00',
  `avg_rating`       decimal(3,2)    NOT NULL DEFAULT '0.00',
  `created_at`       timestamp       NULL DEFAULT NULL,
  `updated_at`       timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_profiles_user_id_unique` (`user_id`),
  CONSTRAINT `client_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 15. portfolios
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `portfolios`;
CREATE TABLE `portfolios` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`     bigint unsigned NOT NULL,
  `title`       varchar(255)    NOT NULL,
  `description` text            NULL,
  `project_url` varchar(255)    NULL,
  `images`      json            NULL,
  `is_featured` tinyint(1)      NOT NULL DEFAULT 0,
  `created_at`  timestamp       NULL DEFAULT NULL,
  `updated_at`  timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `portfolios_user_id_index` (`user_id`),
  CONSTRAINT `portfolios_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 16. job_postings
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `job_postings`;
CREATE TABLE `job_postings` (
  `id`               bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_id`        bigint unsigned NOT NULL,
  `category_id`      bigint unsigned NULL,
  `title`            varchar(255)    NOT NULL,
  `description`      longtext        NOT NULL,
  `type`             enum('hourly','fixed') NOT NULL DEFAULT 'fixed',
  `budget_min`       decimal(10,2)   NULL,
  `budget_max`       decimal(10,2)   NULL,
  `status`           enum('draft','open','in_progress','completed','cancelled') NOT NULL DEFAULT 'open',
  `required_skills`  json            NULL,
  `duration`         varchar(100)    NULL,
  `experience_level` enum('entry','mid','senior','expert') NULL,
  `proposals_count`  int             NOT NULL DEFAULT 0,
  `views_count`      int             NOT NULL DEFAULT 0,
  `created_at`       timestamp       NULL DEFAULT NULL,
  `updated_at`       timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `job_postings_client_id_index` (`client_id`),
  INDEX `job_postings_status_index` (`status`),
  FULLTEXT KEY `job_postings_search_idx` (`title`,`description`),
  CONSTRAINT `job_postings_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `saved_jobs`;
CREATE TABLE `saved_jobs` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`    bigint unsigned NOT NULL,
  `job_id`     bigint unsigned NOT NULL,
  `created_at` timestamp       NULL DEFAULT NULL,
  `updated_at` timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `saved_jobs_user_job_unique` (`user_id`,`job_id`),
  CONSTRAINT `saved_jobs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_jobs_job_id_foreign`  FOREIGN KEY (`job_id`)  REFERENCES `job_postings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 17. proposals
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `proposals`;
CREATE TABLE `proposals` (
  `id`                 bigint unsigned NOT NULL AUTO_INCREMENT,
  `job_id`             bigint unsigned NOT NULL,
  `freelancer_id`      bigint unsigned NOT NULL,
  `cover_letter`       longtext        NOT NULL,
  `bid_amount`         decimal(10,2)   NOT NULL,
  `milestones`         json            NULL,
  `estimated_duration` int             NULL,
  `status`             enum('pending','accepted','rejected','withdrawn') NOT NULL DEFAULT 'pending',
  `is_ai_generated`    tinyint(1)      NOT NULL DEFAULT 0,
  `connects_used`      int             NOT NULL DEFAULT 0,
  `submitted_at`       timestamp       NULL DEFAULT NULL,
  `created_at`         timestamp       NULL DEFAULT NULL,
  `updated_at`         timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `proposals_job_id_index`        (`job_id`),
  INDEX `proposals_freelancer_id_index` (`freelancer_id`),
  CONSTRAINT `proposals_job_id_foreign`        FOREIGN KEY (`job_id`)        REFERENCES `job_postings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `proposals_freelancer_id_foreign` FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 18. contracts
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `contracts`;
CREATE TABLE `contracts` (
  `id`                  bigint unsigned NOT NULL AUTO_INCREMENT,
  `client_id`           bigint unsigned NOT NULL,
  `freelancer_id`       bigint unsigned NOT NULL,
  `job_id`              bigint unsigned NULL,
  `proposal_id`         bigint unsigned NULL,
  `title`               varchar(255)    NOT NULL,
  `description`         text            NULL,
  `terms`               text            NULL,
  `type`                enum('fixed','hourly') NOT NULL DEFAULT 'fixed',
  `status`              enum('pending','active','paused','completed','cancelled','disputed') NOT NULL DEFAULT 'pending',
  `amount`              decimal(12,2)   NULL,
  `hourly_rate`         decimal(10,2)   NULL,
  `weekly_limit`        int unsigned    NULL,
  `auto_invoice_at`     timestamp       NULL DEFAULT NULL,
  `billing_status`      enum('active','paused','closed') NOT NULL DEFAULT 'active',
  `escrow_amount`       decimal(12,2)   NOT NULL DEFAULT '0.00',
  `starts_at`           timestamp       NULL DEFAULT NULL,
  `ends_at`             timestamp       NULL DEFAULT NULL,
  `deadline`            date            NULL,
  `completed_at`        timestamp       NULL DEFAULT NULL,
  `archived_at`         timestamp       NULL DEFAULT NULL,
  `dispute_reason`      text            NULL,
  `disputed_at`         timestamp       NULL DEFAULT NULL,
  `dispute_opened_by`   bigint unsigned NULL,
  `resolved_at`         timestamp       NULL DEFAULT NULL,
  `resolved_by`         bigint unsigned NULL,
  `resolution_outcome`  varchar(32)     NULL,
  `cancellation_reason` text            NULL,
  `cancelled_by`        bigint unsigned NULL,
  `completed_by`        bigint unsigned NULL,
  `deleted_at`          timestamp       NULL DEFAULT NULL,
  `created_at`          timestamp       NULL DEFAULT NULL,
  `updated_at`          timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `contracts_status_client_idx`     (`status`,`client_id`),
  INDEX `contracts_status_freelancer_idx` (`status`,`freelancer_id`),
  INDEX `contracts_archived_at_index`     (`archived_at`),
  INDEX `contracts_auto_invoice_at_index` (`auto_invoice_at`),
  FULLTEXT KEY `contracts_search_idx` (`title`,`description`),
  CONSTRAINT `contracts_client_id_foreign`     FOREIGN KEY (`client_id`)     REFERENCES `users` (`id`),
  CONSTRAINT `contracts_freelancer_id_foreign` FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 19. milestones
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `milestones`;
CREATE TABLE `milestones` (
  `id`               bigint unsigned NOT NULL AUTO_INCREMENT,
  `contract_id`      bigint unsigned NOT NULL,
  `created_by`       bigint unsigned NULL,
  `title`            varchar(255)    NOT NULL,
  `description`      text            NULL,
  `amount`           decimal(12,2)   NOT NULL,
  `status`           enum('pending','funded','submitted','approved','rejected','disputed') NOT NULL DEFAULT 'pending',
  `due_at`           timestamp       NULL DEFAULT NULL,
  `submitted_at`     timestamp       NULL DEFAULT NULL,
  `approved_at`      timestamp       NULL DEFAULT NULL,
  `submission_notes` text            NULL,
  `submitted_by`     bigint unsigned NULL,
  `rejection_reason` text            NULL,
  `attachments`      json            NULL,
  `sort_order`       int             NOT NULL DEFAULT 0,
  `created_at`       timestamp       NULL DEFAULT NULL,
  `updated_at`       timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `milestones_contract_status_idx` (`contract_id`,`status`),
  INDEX `milestones_creator_idx`         (`created_by`),
  CONSTRAINT `milestones_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 20. contract_files
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `contract_files`;
CREATE TABLE `contract_files` (
  `id`            bigint unsigned NOT NULL AUTO_INCREMENT,
  `contract_id`   bigint unsigned NOT NULL,
  `uploader_id`   bigint unsigned NOT NULL,
  `parent_id`     bigint unsigned NULL,
  `original_name` varchar(255)    NOT NULL,
  `stored_path`   varchar(255)    NOT NULL,
  `mime_type`     varchar(100)    NULL,
  `size_bytes`    bigint unsigned NOT NULL DEFAULT 0,
  `version`       int unsigned    NOT NULL DEFAULT 1,
  `description`   varchar(255)    NULL,
  `deleted_at`    timestamp       NULL DEFAULT NULL,
  `created_at`    timestamp       NULL DEFAULT NULL,
  `updated_at`    timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `contract_files_contract_version` (`contract_id`,`version`),
  CONSTRAINT `contract_files_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `contract_files_parent_id_foreign`   FOREIGN KEY (`parent_id`)   REFERENCES `contract_files` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 21. contract_activities  (append-only)
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `contract_activities`;
CREATE TABLE `contract_activities` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint unsigned NOT NULL,
  `actor_id`    bigint unsigned NULL,
  `type`        varchar(64)     NOT NULL,
  `data`        json            NULL,
  `created_at`  timestamp       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `contract_activities_contract_created` (`contract_id`,`created_at`),
  INDEX `contract_activities_type_index` (`type`),
  CONSTRAINT `contract_activities_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 22. time_logs
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `time_logs`;
CREATE TABLE `time_logs` (
  `id`               bigint unsigned NOT NULL AUTO_INCREMENT,
  `contract_id`      bigint unsigned NOT NULL,
  `user_id`          bigint unsigned NOT NULL,
  `started_at`       timestamp       NOT NULL,
  `ended_at`         timestamp       NULL DEFAULT NULL,
  `duration_seconds` int unsigned    NOT NULL DEFAULT 0,
  `description`      varchar(500)    NULL,
  `screenshot_url`   varchar(255)    NULL,
  `created_at`       timestamp       NULL DEFAULT NULL,
  `updated_at`       timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `time_logs_contract_user_started` (`contract_id`,`user_id`,`started_at`),
  CONSTRAINT `time_logs_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `time_logs_user_id_foreign`     FOREIGN KEY (`user_id`)     REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 23. contract_extensions
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `contract_extensions`;
CREATE TABLE `contract_extensions` (
  `id`            bigint unsigned NOT NULL AUTO_INCREMENT,
  `contract_id`   bigint unsigned NOT NULL,
  `requested_by`  bigint unsigned NOT NULL,
  `old_deadline`  date            NOT NULL,
  `new_deadline`  date            NOT NULL,
  `reason`        text            NOT NULL,
  `status`        enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `responded_at`  timestamp       NULL DEFAULT NULL,
  `created_at`    timestamp       NULL DEFAULT NULL,
  `updated_at`    timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `contract_extensions_contract_id_index` (`contract_id`),
  CONSTRAINT `contract_extensions_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 24. weekly_invoices
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `weekly_invoices`;
CREATE TABLE `weekly_invoices` (
  `id`                bigint unsigned NOT NULL AUTO_INCREMENT,
  `contract_id`       bigint unsigned NOT NULL,
  `client_id`         bigint unsigned NOT NULL,
  `freelancer_id`     bigint unsigned NOT NULL,
  `week_start`        date            NOT NULL,
  `week_end`          date            NOT NULL,
  `seconds_worked`    int unsigned    NOT NULL DEFAULT 0,
  `hours_worked`      decimal(8,2)    NOT NULL DEFAULT '0.00',
  `hourly_rate`       decimal(10,2)   NOT NULL,
  `gross_amount`      decimal(12,2)   NOT NULL DEFAULT '0.00',
  `commission`        decimal(12,2)   NOT NULL DEFAULT '0.00',
  `net_to_freelancer` decimal(12,2)   NOT NULL DEFAULT '0.00',
  `status`            enum('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
  `failure_reason`    text            NULL,
  `processed_at`      timestamp       NULL DEFAULT NULL,
  `idempotency_key`   varchar(64)     NOT NULL,
  `created_at`        timestamp       NULL DEFAULT NULL,
  `updated_at`        timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `weekly_invoices_idempotency_key_unique` (`idempotency_key`),
  UNIQUE KEY `weekly_invoices_contract_week_unique` (`contract_id`,`week_start`),
  INDEX `weekly_invoices_freelancer_status` (`freelancer_id`,`status`),
  INDEX `weekly_invoices_client_status`     (`client_id`,`status`),
  CONSTRAINT `weekly_invoices_contract_id_foreign`   FOREIGN KEY (`contract_id`)   REFERENCES `contracts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `weekly_invoices_client_id_foreign`     FOREIGN KEY (`client_id`)     REFERENCES `users` (`id`),
  CONSTRAINT `weekly_invoices_freelancer_id_foreign` FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 25. reviews
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `contract_id`  bigint unsigned NULL,
  `reviewer_id`  bigint unsigned NOT NULL,
  `reviewee_id`  bigint unsigned NOT NULL,
  `rating`       decimal(3,2)    NOT NULL,
  `comment`      text            NULL,
  `breakdown`    json            NULL,
  `is_public`    tinyint(1)      NOT NULL DEFAULT 1,
  `created_at`   timestamp       NULL DEFAULT NULL,
  `updated_at`   timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `reviews_reviewee_id_index` (`reviewee_id`),
  CONSTRAINT `reviews_reviewer_id_foreign` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 26. conversations / conversation_participants
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `conversation_participants`;
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `id`                   bigint unsigned NOT NULL AUTO_INCREMENT,
  `title`                varchar(255)    NULL,
  `contract_id`          bigint unsigned NULL,
  `last_message_at`      timestamp       NULL DEFAULT NULL,
  `last_message_preview` varchar(255)    NULL,
  `created_at`           timestamp       NULL DEFAULT NULL,
  `updated_at`           timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `conversations_contract_id_index` (`contract_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `conversation_participants` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint unsigned NOT NULL,
  `user_id`         bigint unsigned NOT NULL,
  `last_read_at`    timestamp       NULL DEFAULT NULL,
  `is_muted`        tinyint(1)      NOT NULL DEFAULT 0,
  `created_at`      timestamp       NULL DEFAULT NULL,
  `updated_at`      timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conv_participants_unique` (`conversation_id`,`user_id`),
  CONSTRAINT `conv_participants_conv_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conv_participants_user_id_foreign` FOREIGN KEY (`user_id`)         REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 27. messages / message_reactions
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `message_reactions`;
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id`              bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint unsigned NOT NULL,
  `sender_id`       bigint unsigned NOT NULL,
  `reply_to_id`     bigint unsigned NULL,
  `body`            text            NOT NULL,
  `type`            enum('text','file','image','system','audio') NOT NULL DEFAULT 'text',
  `attachment_path` varchar(255)    NULL,
  `attachment_name` varchar(255)    NULL,
  `is_read`         tinyint(1)      NOT NULL DEFAULT 0,
  `is_edited`       tinyint(1)      NOT NULL DEFAULT 0,
  `edited_at`       timestamp       NULL DEFAULT NULL,
  `delivered_at`    timestamp       NULL DEFAULT NULL,
  `deleted_at`      timestamp       NULL DEFAULT NULL,
  `created_at`      timestamp       NULL DEFAULT NULL,
  `updated_at`      timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `messages_conv_created_idx`       (`conversation_id`,`created_at`),
  INDEX `messages_conv_sender_read_idx`   (`conversation_id`,`sender_id`,`is_read`),
  FULLTEXT KEY `messages_search_idx` (`body`),
  CONSTRAINT `messages_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_sender_id_foreign`       FOREIGN KEY (`sender_id`)       REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `message_reactions` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `message_id` bigint unsigned NOT NULL,
  `user_id`    bigint unsigned NOT NULL,
  `emoji`      varchar(16)     NOT NULL,
  `created_at` timestamp       NULL DEFAULT NULL,
  `updated_at` timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_reactions_msg_user_emoji_unique` (`message_id`,`user_id`,`emoji`),
  INDEX `message_reactions_msg_emoji` (`message_id`,`emoji`),
  CONSTRAINT `message_reactions_message_id_foreign` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `message_reactions_user_id_foreign`    FOREIGN KEY (`user_id`)    REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 28. notifications
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id`              char(36)     NOT NULL,
  `type`            varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id`   bigint unsigned NOT NULL,
  `data`            text         NOT NULL,
  `read_at`         timestamp    NULL DEFAULT NULL,
  `created_at`      timestamp    NULL DEFAULT NULL,
  `updated_at`      timestamp    NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 29. push_subscriptions
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `push_subscriptions`;
CREATE TABLE `push_subscriptions` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`      bigint unsigned NOT NULL,
  `endpoint`     varchar(1024)   NOT NULL,
  `p256dh`       varchar(255)    NOT NULL,
  `auth`         varchar(255)    NOT NULL,
  `user_agent`   varchar(500)    NULL,
  `last_used_at` timestamp       NULL DEFAULT NULL,
  `created_at`   timestamp       NULL DEFAULT NULL,
  `updated_at`   timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `push_subscriptions_endpoint_unique` (`endpoint`(191)),
  INDEX `push_subscriptions_user_id_index` (`user_id`),
  CONSTRAINT `push_subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 30. audit_logs
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `actor_id`    bigint unsigned NULL,
  `action`      varchar(80)     NOT NULL,
  `target_type` varchar(120)    NULL,
  `target_id`   bigint unsigned NULL,
  `payload`     json            NULL,
  `ip_address`  varchar(45)     NULL,
  `user_agent`  varchar(500)    NULL,
  `created_at`  timestamp       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `audit_logs_target_index`      (`target_type`,`target_id`),
  INDEX `audit_logs_actor_created`     (`actor_id`,`created_at`),
  INDEX `audit_logs_action_index`      (`action`),
  CONSTRAINT `audit_logs_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 31. identity_verifications
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `identity_verifications`;
CREATE TABLE `identity_verifications` (
  `id`               bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`          bigint unsigned NOT NULL,
  `document_type`    enum('passport','national_id','driving_license') NOT NULL DEFAULT 'national_id',
  `document_number`  varchar(255)    NULL,
  `country`          char(2)         NULL,
  `id_front_path`    varchar(255)    NOT NULL,
  `id_back_path`     varchar(255)    NULL,
  `selfie_path`      varchar(255)    NOT NULL,
  `status`           enum('pending','in_review','approved','rejected') NOT NULL DEFAULT 'pending',
  `reviewed_by`      bigint unsigned NULL,
  `submitted_at`     timestamp       NULL DEFAULT NULL,
  `reviewed_at`      timestamp       NULL DEFAULT NULL,
  `rejection_reason` text            NULL,
  `created_at`       timestamp       NULL DEFAULT NULL,
  `updated_at`       timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `identity_verifications_user_status` (`user_id`,`status`),
  INDEX `identity_verifications_status_index` (`status`),
  CONSTRAINT `identity_verifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 32. ai_histories
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `ai_histories`;
CREATE TABLE `ai_histories` (
  `id`            bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`       bigint unsigned NOT NULL,
  `type`          enum('proposal','chat','analyze','match','smart_search') NOT NULL,
  `input`         json            NULL,
  `output`        json            NULL,
  `model`         varchar(100)    NOT NULL DEFAULT 'mistral',
  `tokens_used`   int             NOT NULL DEFAULT 0,
  `fallback_used` tinyint(1)      NOT NULL DEFAULT 0,
  `created_at`    timestamp       NULL DEFAULT NULL,
  `updated_at`    timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `ai_histories_user_id_type` (`user_id`,`type`),
  CONSTRAINT `ai_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 33. saved_freelancers / talent_lists / talent_list_freelancers
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `talent_list_freelancers`;
DROP TABLE IF EXISTS `talent_lists`;
DROP TABLE IF EXISTS `saved_freelancers`;
CREATE TABLE `saved_freelancers` (
  `id`            bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`       bigint unsigned NOT NULL,
  `freelancer_id` bigint unsigned NOT NULL,
  `created_at`    timestamp       NULL DEFAULT NULL,
  `updated_at`    timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `saved_freelancers_user_freelancer_unique` (`user_id`,`freelancer_id`),
  CONSTRAINT `saved_freelancers_user_id_foreign`       FOREIGN KEY (`user_id`)       REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_freelancers_freelancer_id_foreign` FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `talent_lists` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`     bigint unsigned NOT NULL,
  `name`        varchar(120)    NOT NULL,
  `description` varchar(500)    NULL,
  `created_at`  timestamp       NULL DEFAULT NULL,
  `updated_at`  timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `talent_lists_user_name` (`user_id`,`name`),
  CONSTRAINT `talent_lists_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `talent_list_freelancers` (
  `id`             bigint unsigned NOT NULL AUTO_INCREMENT,
  `talent_list_id` bigint unsigned NOT NULL,
  `freelancer_id`  bigint unsigned NOT NULL,
  `note`           text            NULL,
  `created_at`     timestamp       NULL DEFAULT NULL,
  `updated_at`     timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `talent_list_freelancers_unique` (`talent_list_id`,`freelancer_id`),
  CONSTRAINT `talent_list_freelancers_list_id_foreign`       FOREIGN KEY (`talent_list_id`) REFERENCES `talent_lists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `talent_list_freelancers_freelancer_id_foreign` FOREIGN KEY (`freelancer_id`)  REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 34. tax_documents
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `tax_documents`;
CREATE TABLE `tax_documents` (
  `id`               bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id`          bigint unsigned NOT NULL,
  `form_type`        enum('w9','w8ben','vat') NOT NULL,
  `country`          char(2)         NOT NULL,
  `legal_name`       varchar(255)    NOT NULL,
  `tax_id_last4`     varchar(8)      NULL,
  `address_line1`    varchar(255)    NOT NULL,
  `address_line2`    varchar(255)    NULL,
  `city`             varchar(255)    NOT NULL,
  `state_region`     varchar(255)    NULL,
  `postal_code`      varchar(20)     NOT NULL,
  `form_payload`     json            NULL,
  `signed_pdf_path`  varchar(255)    NULL,
  `status`           enum('draft','submitted','approved','rejected') NOT NULL DEFAULT 'submitted',
  `reviewed_by`      bigint unsigned NULL,
  `submitted_at`     timestamp       NULL DEFAULT NULL,
  `reviewed_at`      timestamp       NULL DEFAULT NULL,
  `rejection_reason` text            NULL,
  `created_at`       timestamp       NULL DEFAULT NULL,
  `updated_at`       timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `tax_documents_user_status` (`user_id`,`status`),
  INDEX `tax_documents_status_index` (`status`),
  CONSTRAINT `tax_documents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 35. agencies / agency_members / agency_invitations
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `agency_invitations`;
DROP TABLE IF EXISTS `agency_members`;
DROP TABLE IF EXISTS `agencies`;
CREATE TABLE `agencies` (
  `id`          bigint unsigned NOT NULL AUTO_INCREMENT,
  `owner_id`    bigint unsigned NOT NULL,
  `name`        varchar(255)    NOT NULL,
  `slug`        varchar(255)    NOT NULL,
  `description` text            NULL,
  `logo_path`   varchar(255)    NULL,
  `skills`      json            NULL,
  `country`     char(2)         NULL,
  `website`     varchar(255)    NULL,
  `deleted_at`  timestamp       NULL DEFAULT NULL,
  `created_at`  timestamp       NULL DEFAULT NULL,
  `updated_at`  timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agencies_slug_unique` (`slug`),
  CONSTRAINT `agencies_owner_id_foreign` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `agency_members` (
  `id`         bigint unsigned NOT NULL AUTO_INCREMENT,
  `agency_id`  bigint unsigned NOT NULL,
  `user_id`    bigint unsigned NOT NULL,
  `role`       enum('owner','admin','freelancer') NOT NULL DEFAULT 'freelancer',
  `joined_at`  timestamp       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp       NULL DEFAULT NULL,
  `updated_at` timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agency_members_agency_user_unique` (`agency_id`,`user_id`),
  INDEX `agency_members_user_role` (`user_id`,`role`),
  CONSTRAINT `agency_members_agency_id_foreign` FOREIGN KEY (`agency_id`) REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `agency_members_user_id_foreign`   FOREIGN KEY (`user_id`)   REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `agency_invitations` (
  `id`           bigint unsigned NOT NULL AUTO_INCREMENT,
  `agency_id`    bigint unsigned NOT NULL,
  `invited_by`   bigint unsigned NOT NULL,
  `email`        varchar(255)    NOT NULL,
  `role`         enum('admin','freelancer') NOT NULL DEFAULT 'freelancer',
  `token`        varchar(64)     NOT NULL,
  `status`       enum('pending','accepted','declined','expired') NOT NULL DEFAULT 'pending',
  `expires_at`   timestamp       NULL DEFAULT NULL,
  `responded_at` timestamp       NULL DEFAULT NULL,
  `created_at`   timestamp       NULL DEFAULT NULL,
  `updated_at`   timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agency_invitations_token_unique` (`token`),
  INDEX `agency_invitations_agency_status` (`agency_id`,`status`),
  INDEX `agency_invitations_email_index`   (`email`),
  CONSTRAINT `agency_invitations_agency_id_foreign`  FOREIGN KEY (`agency_id`)  REFERENCES `agencies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `agency_invitations_invited_by_foreign` FOREIGN KEY (`invited_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 36. catalog_projects / catalog_project_images / catalog_orders / catalog_reviews
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `catalog_reviews`;
DROP TABLE IF EXISTS `catalog_orders`;
DROP TABLE IF EXISTS `catalog_project_images`;
DROP TABLE IF EXISTS `catalog_projects`;
CREATE TABLE `catalog_projects` (
  `id`               bigint unsigned NOT NULL AUTO_INCREMENT,
  `seller_id`        bigint unsigned NOT NULL,
  `category_id`      bigint unsigned NULL,
  `title`            varchar(255)    NOT NULL,
  `slug`             varchar(255)    NOT NULL,
  `description`      longtext        NOT NULL,
  `tier_basic`       json            NULL,
  `tier_standard`    json            NULL,
  `tier_premium`     json            NULL,
  `faq`              json            NULL,
  `skills`           json            NULL,
  `status`           enum('draft','pending_review','published','rejected','suspended') NOT NULL DEFAULT 'draft',
  `views_count`      int unsigned    NOT NULL DEFAULT 0,
  `orders_count`     int unsigned    NOT NULL DEFAULT 0,
  `avg_rating`       decimal(3,2)    NOT NULL DEFAULT '0.00',
  `reviews_count`    int unsigned    NOT NULL DEFAULT 0,
  `moderated_by`     bigint unsigned NULL,
  `moderated_at`     timestamp       NULL DEFAULT NULL,
  `rejection_reason` text            NULL,
  `deleted_at`       timestamp       NULL DEFAULT NULL,
  `created_at`       timestamp       NULL DEFAULT NULL,
  `updated_at`       timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `catalog_projects_slug_unique` (`slug`),
  INDEX `catalog_projects_status_created` (`status`,`created_at`),
  CONSTRAINT `catalog_projects_seller_id_foreign` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `catalog_project_images` (
  `id`                 bigint unsigned NOT NULL AUTO_INCREMENT,
  `catalog_project_id` bigint unsigned NOT NULL,
  `image_url`          varchar(255)    NOT NULL,
  `sort_order`         int unsigned    NOT NULL DEFAULT 0,
  `created_at`         timestamp       NULL DEFAULT NULL,
  `updated_at`         timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `catalog_project_images_project_id_foreign` FOREIGN KEY (`catalog_project_id`) REFERENCES `catalog_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `catalog_orders` (
  `id`                 bigint unsigned NOT NULL AUTO_INCREMENT,
  `catalog_project_id` bigint unsigned NOT NULL,
  `buyer_id`           bigint unsigned NOT NULL,
  `seller_id`          bigint unsigned NOT NULL,
  `tier`               enum('basic','standard','premium') NOT NULL,
  `price`              decimal(12,2)   NOT NULL,
  `delivery_days`      int unsigned    NOT NULL DEFAULT 1,
  `revision_count`     int unsigned    NOT NULL DEFAULT 0,
  `revisions_used`     int unsigned    NOT NULL DEFAULT 0,
  `status`             enum('pending','in_progress','delivered','completed','revision','cancelled','disputed') NOT NULL DEFAULT 'pending',
  `requirements`       text            NULL,
  `delivery_note`      text            NULL,
  `delivery_date`      timestamp       NULL DEFAULT NULL,
  `completed_at`       timestamp       NULL DEFAULT NULL,
  `created_at`         timestamp       NULL DEFAULT NULL,
  `updated_at`         timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `catalog_orders_buyer_id_index`  (`buyer_id`),
  INDEX `catalog_orders_seller_id_index` (`seller_id`),
  CONSTRAINT `catalog_orders_project_id_foreign` FOREIGN KEY (`catalog_project_id`) REFERENCES `catalog_projects` (`id`),
  CONSTRAINT `catalog_orders_buyer_id_foreign`   FOREIGN KEY (`buyer_id`)           REFERENCES `users` (`id`),
  CONSTRAINT `catalog_orders_seller_id_foreign`  FOREIGN KEY (`seller_id`)          REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `catalog_reviews` (
  `id`                 bigint unsigned NOT NULL AUTO_INCREMENT,
  `catalog_order_id`   bigint unsigned NOT NULL,
  `catalog_project_id` bigint unsigned NOT NULL,
  `client_id`          bigint unsigned NOT NULL,
  `rating`             decimal(3,2)    NOT NULL,
  `comment`            text            NULL,
  `created_at`         timestamp       NULL DEFAULT NULL,
  `updated_at`         timestamp       NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `catalog_reviews_order_unique` (`catalog_order_id`),
  INDEX `catalog_reviews_project_id` (`catalog_project_id`),
  CONSTRAINT `catalog_reviews_order_id_foreign`   FOREIGN KEY (`catalog_order_id`)   REFERENCES `catalog_orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `catalog_reviews_project_id_foreign` FOREIGN KEY (`catalog_project_id`) REFERENCES `catalog_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- 37. migrations  (Laravel migration tracker)
-- ──────────────────────────────────────────────────────────
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id`        int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch`     int          NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ──────────────────────────────────────────────────────────
-- Restore settings
-- ──────────────────────────────────────────────────────────
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Schema complete: 37 tables, MySQL 8 / utf8mb4_unicode_ci
-- Project: Panda  |  Laravel 12 / PHP 8.2
""".format(date=datetime.date.today().isoformat())

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(SQL)

import os
size = os.path.getsize(OUT) // 1024
lines = SQL.count('\n')
tables = SQL.count('CREATE TABLE')
print(f"OK  panda.sql  ({size} KB, {lines} lines, {tables} tables)")
