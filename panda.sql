-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: panda
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

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

--
-- Current Database: `panda`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `panda` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `panda`;

--
-- Table structure for table `ai_histories`
--

DROP TABLE IF EXISTS `ai_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ai_histories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `type` enum('proposal','search','match','summary','chat','cv_analysis') NOT NULL,
  `input` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`input`)),
  `output` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`output`)),
  `model` varchar(255) DEFAULT NULL,
  `tokens_used` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ai_histories_user_id_foreign` (`user_id`),
  CONSTRAINT `ai_histories_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_histories`
--

LOCK TABLES `ai_histories` WRITE;
/*!40000 ALTER TABLE `ai_histories` DISABLE KEYS */;
INSERT INTO `ai_histories` VALUES (1,18,'proposal','{\"job_id\":1,\"job_title\":\"Build a SaaS Dashboard with Laravel & React\"}','{\"proposal\":\"Dear Hiring Manager,\\n\\nI am excited to apply for this position. With my extensive experience in the field, I am confident I can deliver exceptional results that exceed your expectations.\\n\\nI have carefully reviewed your requirements and I believe my skills align perfectly with what you\'re looking for. I am committed to delivering high-quality work on time and within budget.\\n\\nI look forward to discussing how I can contribute to your project\'s success.\\n\\nBest regards\"}','mistral',117,'2026-05-22 14:34:00','2026-05-22 14:34:00');
/*!40000 ALTER TABLE `ai_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `parent_id` bigint(20) unsigned DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_slug_unique` (`slug`),
  KEY `categories_parent_id_foreign` (`parent_id`),
  CONSTRAINT `categories_parent_id_foreign` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Development & IT','development-it','code',NULL,NULL,0,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(2,'Design & Creative','design-creative','design',NULL,NULL,1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(3,'AI & Machine Learning','ai-ml','ai',NULL,NULL,2,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(4,'Writing & Translation','writing','write',NULL,NULL,3,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(5,'Sales & Marketing','sales-marketing','chart',NULL,NULL,4,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(6,'Mobile Development','mobile-dev','mobile',NULL,NULL,5,1,'2026-05-22 14:21:54','2026-05-22 14:21:54');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_profiles`
--

DROP TABLE IF EXISTS `client_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `company_size` varchar(255) DEFAULT NULL,
  `industry` varchar(255) DEFAULT NULL,
  `about` text DEFAULT NULL,
  `total_jobs_posted` int(11) NOT NULL DEFAULT 0,
  `total_spent` int(11) NOT NULL DEFAULT 0,
  `avg_rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `total_reviews` int(11) NOT NULL DEFAULT 0,
  `payment_verified` tinyint(1) NOT NULL DEFAULT 0,
  `preferred_payment_method` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_profiles_user_id_foreign` (`user_id`),
  CONSTRAINT `client_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_profiles`
--

LOCK TABLES `client_profiles` WRITE;
/*!40000 ALTER TABLE `client_profiles` DISABLE KEYS */;
INSERT INTO `client_profiles` VALUES (1,12,'NovaTech Solutions',NULL,'Technology',NULL,14,45000,4.60,14,1,NULL,'2026-05-22 14:22:00','2026-05-22 14:22:00'),(2,13,'Bloom Digital Agency',NULL,'Marketing',NULL,9,28000,4.70,9,1,NULL,'2026-05-22 14:22:00','2026-05-22 14:22:00'),(3,14,'Gulf Ventures Group',NULL,'Finance',NULL,21,92000,4.70,21,1,NULL,'2026-05-22 14:22:01','2026-05-22 14:22:01'),(4,15,'Pixel Dreams Studio',NULL,'Gaming',NULL,11,38000,4.80,11,1,NULL,'2026-05-22 14:22:01','2026-05-22 14:22:01'),(5,16,'HealthBridge Africa',NULL,'Healthcare',NULL,6,18000,4.70,6,1,NULL,'2026-05-22 14:22:01','2026-05-22 14:22:01'),(6,17,'Luxe Commerce SRL',NULL,'E-Commerce',NULL,8,31000,4.80,8,1,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02');
/*!40000 ALTER TABLE `client_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contracts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint(20) unsigned NOT NULL,
  `proposal_id` bigint(20) unsigned NOT NULL,
  `client_id` bigint(20) unsigned NOT NULL,
  `freelancer_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('hourly','fixed') NOT NULL DEFAULT 'fixed',
  `amount` decimal(12,2) NOT NULL,
  `escrow_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','active','paused','completed','cancelled','disputed') NOT NULL DEFAULT 'pending',
  `started_at` timestamp NULL DEFAULT NULL,
  `ended_at` timestamp NULL DEFAULT NULL,
  `deadline_at` timestamp NULL DEFAULT NULL,
  `terms` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contracts_job_id_foreign` (`job_id`),
  KEY `contracts_proposal_id_foreign` (`proposal_id`),
  KEY `contracts_client_id_foreign` (`client_id`),
  KEY `contracts_freelancer_id_foreign` (`freelancer_id`),
  CONSTRAINT `contracts_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`),
  CONSTRAINT `contracts_freelancer_id_foreign` FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `contracts_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`),
  CONSTRAINT `contracts_proposal_id_foreign` FOREIGN KEY (`proposal_id`) REFERENCES `proposals` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_participants`
--

DROP TABLE IF EXISTS `conversation_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_participants` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `last_read_at` timestamp NULL DEFAULT NULL,
  `is_muted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversation_participants_conversation_id_user_id_unique` (`conversation_id`,`user_id`),
  KEY `conversation_participants_user_id_foreign` (`user_id`),
  CONSTRAINT `conversation_participants_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversation_participants_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_participants`
--

LOCK TABLES `conversation_participants` WRITE;
/*!40000 ALTER TABLE `conversation_participants` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversation_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(255) NOT NULL DEFAULT 'direct',
  `contract_id` bigint(20) unsigned DEFAULT NULL,
  `job_id` bigint(20) unsigned DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `conversations_contract_id_foreign` (`contract_id`),
  KEY `conversations_job_id_foreign` (`job_id`),
  CONSTRAINT `conversations_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `conversations_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `freelancer_profiles`
--

DROP TABLE IF EXISTS `freelancer_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `freelancer_profiles` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `hourly_rate` decimal(10,2) DEFAULT NULL,
  `experience_level` enum('entry','intermediate','expert') NOT NULL DEFAULT 'entry',
  `availability` varchar(255) NOT NULL DEFAULT 'full_time',
  `weekly_hours` int(11) NOT NULL DEFAULT 40,
  `success_rate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `total_jobs` int(11) NOT NULL DEFAULT 0,
  `total_earned` int(11) NOT NULL DEFAULT 0,
  `avg_rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `total_reviews` int(11) NOT NULL DEFAULT 0,
  `is_top_rated` tinyint(1) NOT NULL DEFAULT 0,
  `is_top_rated_plus` tinyint(1) NOT NULL DEFAULT 0,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `profile_visibility` varchar(255) NOT NULL DEFAULT 'public',
  `languages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`languages`)),
  `video_intro` varchar(255) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `github_url` varchar(255) DEFAULT NULL,
  `website_url` varchar(255) DEFAULT NULL,
  `certifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`certifications`)),
  `badges` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`badges`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `freelancer_profiles_user_id_foreign` (`user_id`),
  CONSTRAINT `freelancer_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `freelancer_profiles`
--

LOCK TABLES `freelancer_profiles` WRITE;
/*!40000 ALTER TABLE `freelancer_profiles` DISABLE KEYS */;
INSERT INTO `freelancer_profiles` VALUES (1,2,'Senior Full-Stack Developer (Laravel & React)','Senior full-stack developer with 7+ years building scalable SaaS platforms. Specialist in Laravel APIs and React frontends. Delivered 50+ projects across fintech and e-commerce.',85.00,'expert','available',40,99.00,58,39440,4.90,58,1,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(2,3,'UI/UX Designer & Brand Identity Specialist','Award-winning designer crafting user-centric digital experiences. I turn complex problems into elegant interfaces. Worked with startups and Fortune 500 companies.',65.00,'expert','available',40,97.00,44,22880,4.95,44,1,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 14:21:56','2026-05-22 14:21:56'),(3,4,'AI/ML Engineer & Data Scientist','Machine learning engineer specializing in NLP, computer vision, and production AI deployments. 5+ years of research and industry experience.',90.00,'expert','available',40,97.00,27,19440,4.95,27,1,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 14:21:56','2026-05-22 14:21:56'),(4,5,'Backend & Cloud Infrastructure Engineer','DevOps engineer and backend specialist. Expert in Kubernetes, AWS, CI/CD pipelines, and microservices architecture. Passionate about performance and reliability.',80.00,'expert','available',40,98.00,36,23040,4.85,36,1,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 14:21:57','2026-05-22 14:21:57'),(5,6,'React Native & Flutter Mobile Developer','Mobile developer with 4+ years shipping cross-platform apps. Built apps with 500k+ downloads. Strong focus on smooth animations and native-like performance.',60.00,'intermediate','available',40,95.00,29,13920,4.80,29,0,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 14:21:57','2026-05-22 14:21:57'),(6,7,'Technical Writer & Content Strategist','Technical writer and content strategist with deep experience in SaaS documentation, blog content, and developer guides. Fluent in English, Arabic, and French.',45.00,'expert','available',40,100.00,61,21960,4.90,61,1,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 14:21:58','2026-05-22 14:21:58'),(7,8,'Vue.js & Nuxt.js Frontend Engineer','Frontend engineer passionate about building fast, accessible web apps with Vue 3 and Nuxt. 5+ years experience with component libraries and SSR.',70.00,'expert','available',40,97.00,33,18480,4.70,33,0,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 14:21:58','2026-05-22 14:21:58'),(8,9,'Data Scientist & Python Automation Expert','Data scientist with strong background in predictive modeling, data pipelines, and business intelligence. Experience at top tech companies in Bangalore and London.',55.00,'expert','available',40,99.00,41,18040,4.88,41,1,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 14:21:58','2026-05-22 14:21:58'),(9,10,'Go & Rust Systems Engineer','Systems engineer building high-performance backends with Go and Rust. Specialized in real-time APIs, WebSockets, and distributed systems.',95.00,'expert','available',40,100.00,19,14440,4.92,19,1,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 14:21:59','2026-05-22 14:21:59'),(10,11,'Digital Marketing & SEO Strategist','Performance marketer helping SaaS and e-commerce brands grow through data-driven SEO, paid ads, and conversion optimization. 300%+ average ROI across clients.',50.00,'expert','available',40,100.00,52,20800,4.82,52,0,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 14:21:59','2026-05-22 14:21:59'),(11,18,NULL,NULL,NULL,'entry','full_time',40,0.00,0,0,0.00,0,0,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 14:32:30','2026-05-22 14:32:30'),(12,19,NULL,NULL,NULL,'entry','full_time',40,0.00,0,0,0.00,0,0,0,1,'public',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-22 15:30:24','2026-05-22 15:30:24');
/*!40000 ALTER TABLE `freelancer_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `freelancer_skills`
--

DROP TABLE IF EXISTS `freelancer_skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `freelancer_skills` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `skill_id` bigint(20) unsigned NOT NULL,
  `level` enum('beginner','intermediate','expert') NOT NULL DEFAULT 'intermediate',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `freelancer_skills_user_id_foreign` (`user_id`),
  KEY `freelancer_skills_skill_id_foreign` (`skill_id`),
  CONSTRAINT `freelancer_skills_skill_id_foreign` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE CASCADE,
  CONSTRAINT `freelancer_skills_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `freelancer_skills`
--

LOCK TABLES `freelancer_skills` WRITE;
/*!40000 ALTER TABLE `freelancer_skills` DISABLE KEYS */;
INSERT INTO `freelancer_skills` VALUES (1,2,2,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(2,2,3,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(3,2,8,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(4,2,9,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(5,2,11,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(6,3,13,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(7,3,14,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(8,3,15,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(9,3,16,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(10,4,6,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(11,4,17,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(12,4,18,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(13,4,19,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(14,4,20,'expert','2026-05-22 14:21:56','2026-05-22 14:21:56'),(15,5,5,'expert','2026-05-22 14:21:57','2026-05-22 14:21:57'),(16,5,10,'expert','2026-05-22 14:21:57','2026-05-22 14:21:57'),(17,5,11,'expert','2026-05-22 14:21:57','2026-05-22 14:21:57'),(18,5,12,'expert','2026-05-22 14:21:57','2026-05-22 14:21:57'),(19,5,25,'expert','2026-05-22 14:21:57','2026-05-22 14:21:57'),(20,6,7,'expert','2026-05-22 14:21:57','2026-05-22 14:21:57'),(21,6,8,'expert','2026-05-22 14:21:57','2026-05-22 14:21:57'),(22,6,21,'expert','2026-05-22 14:21:57','2026-05-22 14:21:57'),(23,6,22,'expert','2026-05-22 14:21:57','2026-05-22 14:21:57'),(24,7,31,'expert','2026-05-22 14:21:58','2026-05-22 14:21:58'),(25,7,32,'expert','2026-05-22 14:21:58','2026-05-22 14:21:58'),(26,7,33,'expert','2026-05-22 14:21:58','2026-05-22 14:21:58'),(27,8,4,'expert','2026-05-22 14:21:58','2026-05-22 14:21:58'),(28,8,7,'expert','2026-05-22 14:21:58','2026-05-22 14:21:58'),(29,8,8,'expert','2026-05-22 14:21:58','2026-05-22 14:21:58'),(30,8,23,'expert','2026-05-22 14:21:58','2026-05-22 14:21:58'),(31,9,6,'expert','2026-05-22 14:21:58','2026-05-22 14:21:58'),(32,9,10,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(33,9,17,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(34,9,20,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(35,10,10,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(36,10,11,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(37,10,24,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(38,10,26,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(39,10,27,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(40,11,31,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(41,11,33,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(42,11,34,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(43,11,35,'expert','2026-05-22 14:21:59','2026-05-22 14:21:59'),(44,19,36,'intermediate','2026-05-22 15:30:51','2026-05-22 15:30:53');
/*!40000 ALTER TABLE `freelancer_skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_postings`
--

DROP TABLE IF EXISTS `job_postings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_postings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `client_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `type` enum('hourly','fixed') NOT NULL DEFAULT 'fixed',
  `experience_level` enum('entry','intermediate','expert') NOT NULL DEFAULT 'intermediate',
  `budget_min` decimal(12,2) DEFAULT NULL,
  `budget_max` decimal(12,2) DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `status` enum('draft','open','in_progress','completed','cancelled','paused') NOT NULL DEFAULT 'open',
  `visibility` enum('public','invite_only') NOT NULL DEFAULT 'public',
  `location_requirement` varchar(255) DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `proposals_count` int(11) NOT NULL DEFAULT 0,
  `views_count` int(11) NOT NULL DEFAULT 0,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `is_urgent` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `job_postings_client_id_foreign` (`client_id`),
  KEY `job_postings_status_created_at_index` (`status`,`created_at`),
  KEY `job_postings_category_id_status_index` (`category_id`,`status`),
  CONSTRAINT `job_postings_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `job_postings_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_postings`
--

LOCK TABLES `job_postings` WRITE;
/*!40000 ALTER TABLE `job_postings` DISABLE KEYS */;
INSERT INTO `job_postings` VALUES (1,12,'Build a SaaS Dashboard with Laravel & React','We need a senior full-stack developer to build a modern SaaS analytics dashboard. Features: user auth, role-based access, real-time charts, REST API, and a clean TailwindCSS UI. Laravel 12 + React 18.',1,'[\"Laravel\",\"React\",\"MySQL\",\"TypeScript\"]','fixed','expert',2000.00,5000.00,NULL,'open','public',NULL,NULL,26,163,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 18:21:23',NULL),(2,12,'E-Commerce Platform with Laravel & Vue.js','Building a full e-commerce platform: product catalog, cart, Stripe checkout, order management, and admin panel. Must have proven Laravel 10+ and Vue 3 experience.',1,'[\"PHP\",\"Laravel\",\"Vue.js\",\"MySQL\"]','fixed','intermediate',1500.00,4000.00,NULL,'open','public',NULL,NULL,30,164,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(3,12,'RESTful API Development for Fintech App','Need an experienced backend developer to design and implement a secure RESTful API for a fintech application. JWT auth, rate limiting, webhook handling, and full Swagger documentation required.',1,'[\"Node.js\",\"PostgreSQL\",\"Docker\",\"TypeScript\"]','hourly','expert',60.00,100.00,NULL,'in_progress','public',NULL,NULL,15,118,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(4,13,'React Native Shopping App (iOS & Android)','Building a polished cross-platform shopping app with product listings, cart, push notifications, Stripe payments, and smooth animations. 100k+ target users on day one.',6,'[\"React Native\",\"JavaScript\",\"TypeScript\"]','fixed','expert',3000.00,8000.00,NULL,'open','public',NULL,NULL,21,149,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(5,15,'Flutter Game Companion App','We need a Flutter developer to build a companion mobile app for our mobile game. Features: leaderboard, achievements, in-app purchases, real-time chat, and push notifications.',6,'[\"Flutter\",\"Kotlin\",\"Swift\"]','fixed','expert',2500.00,6000.00,NULL,'open','public',NULL,NULL,16,685,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(6,14,'Customer Churn Prediction ML Model','Build a machine learning model to predict customer churn from historical data. Deliver a production-ready Python API endpoint with model documentation and performance metrics.',3,'[\"Python\",\"Machine Learning\",\"Data Science\"]','hourly','expert',70.00,110.00,NULL,'open','public',NULL,NULL,24,167,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(7,14,'NLP Chatbot for Customer Support Automation','AI-powered chatbot for customer support. Must handle FAQs, classify intent, escalate to humans, and integrate with our helpdesk. Rasa, LangChain, or OpenAI experience preferred.',3,'[\"NLP\",\"Python\",\"TensorFlow\"]','fixed','expert',2000.00,5000.00,NULL,'open','public',NULL,NULL,22,792,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(8,16,'Medical Image Analysis with Computer Vision','We need a CV specialist to build a model that detects abnormalities in medical X-ray images. FDA-compliance awareness is a plus. Must deliver validated model with >90% accuracy.',3,'[\"Python\",\"TensorFlow\",\"Machine Learning\"]','fixed','expert',4000.00,10000.00,NULL,'open','public',NULL,NULL,28,572,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(9,13,'Brand Identity & Logo Design for Marketing Agency','Looking for a talented brand designer to create a complete brand identity: logo, color palette, typography, business cards, and brand guidelines document. Creative portfolio required.',2,'[\"Branding\",\"Figma\",\"UI Design\"]','fixed','intermediate',800.00,2000.00,NULL,'open','public',NULL,NULL,13,203,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(10,17,'UX Redesign for Luxury E-Commerce Website','Full UX audit and redesign of our luxury e-commerce site. Deliverables: user research report, wireframes, hi-fi Figma prototype, and design system. Experience with high-end brands preferred.',2,'[\"UX Design\",\"Figma\",\"UI Design\"]','fixed','expert',1500.00,4000.00,NULL,'open','public',NULL,NULL,11,611,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(11,13,'SaaS Blog Content — 8 Technical Articles/Month','We need a skilled technical writer to produce 8 in-depth blog articles per month covering SaaS, cloud, and developer topics. SEO-optimized, audience: CTOs and developers.',4,'[\"Content Writing\",\"SEO\",\"Copywriting\"]','hourly','intermediate',35.00,60.00,NULL,'open','public',NULL,NULL,23,122,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(12,16,'Healthcare App — User Documentation & Help Center','Create complete user documentation, FAQ, and help center content for our healthcare mobile app. Clear, empathetic writing style required. Medical writing experience is a plus.',4,'[\"Content Writing\",\"Copywriting\"]','fixed','intermediate',600.00,1500.00,NULL,'open','public',NULL,NULL,12,386,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(13,14,'Google Ads & SEO Campaign for B2B SaaS','Performance marketer needed to manage Google Ads campaigns and SEO strategy for our B2B SaaS. Target: $5 CPA on demo requests. Experience with HubSpot and Salesforce preferred.',5,'[\"Google Ads\",\"SEO\",\"Email Marketing\"]','hourly','expert',50.00,90.00,NULL,'open','public',NULL,NULL,23,474,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(14,17,'Email Marketing Automation — Klaviyo Setup','Set up full Klaviyo email automation flows for our e-commerce store: welcome series, abandoned cart, post-purchase, winback. Write all email copy and design templates.',5,'[\"Email Marketing\",\"Copywriting\"]','fixed','intermediate',500.00,1200.00,NULL,'open','public',NULL,NULL,29,678,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL),(15,12,'Kubernetes Cluster Setup & CI/CD Pipeline','Set up production-grade Kubernetes cluster on AWS EKS with Helm charts, auto-scaling, monitoring (Grafana/Prometheus), and GitHub Actions CI/CD. Must deliver full documentation.',1,'[\"Kubernetes\",\"Docker\",\"AWS\"]','fixed','expert',1000.00,3000.00,NULL,'open','public',NULL,NULL,2,126,0,0,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02',NULL);
/*!40000 ALTER TABLE `job_postings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint(20) unsigned NOT NULL,
  `sender_id` bigint(20) unsigned NOT NULL,
  `body` text DEFAULT NULL,
  `type` enum('text','file','image','system','offer') NOT NULL DEFAULT 'text',
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `reply_to_id` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `messages_conversation_id_foreign` (`conversation_id`),
  KEY `messages_sender_id_foreign` (`sender_id`),
  KEY `messages_reply_to_id_foreign` (`reply_to_id`),
  CONSTRAINT `messages_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_reply_to_id_foreign` FOREIGN KEY (`reply_to_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `messages_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2024_01_01_000001_create_freelancers_table',1),(5,'2024_01_02_000001_create_jobs_proposals_table',1),(6,'2024_01_03_000001_create_chat_payments_table',1),(7,'2024_01_04_000001_create_notifications_table',1),(8,'2024_01_05_000001_make_reviews_contract_nullable',1),(9,'2026_05_19_231439_create_personal_access_tokens_table',1),(10,'2026_05_21_000001_add_phone_verified_to_users_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `milestones`
--

DROP TABLE IF EXISTS `milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `milestones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','in_progress','submitted','approved','rejected','paid') NOT NULL DEFAULT 'pending',
  `due_at` timestamp NULL DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `submission_notes` text DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `milestones_contract_id_foreign` (`contract_id`),
  CONSTRAINT `milestones_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `milestones`
--

LOCK TABLES `milestones` WRITE;
/*!40000 ALTER TABLE `milestones` DISABLE KEYS */;
/*!40000 ALTER TABLE `milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) unsigned NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('04483c5b-a1c4-4d39-bbff-8d606f5c7276','App\\Notifications\\PlatformNotification','App\\Models\\User',18,'{\"type\":\"message\",\"icon\":\"message\",\"title\":\"New message from client\",\"body\":\"You have a new message regarding the React Native app project.\",\"action_url\":\"\\/messages\"}',NULL,'2026-05-22 14:02:30','2026-05-22 14:02:30'),('0a6e513b-d0a4-41c0-b72c-836f8a773d6f','App\\Notifications\\PlatformNotification','App\\Models\\User',19,'{\"type\":\"review\",\"icon\":\"star\",\"title\":\"5\\u2605 review received\",\"body\":\"James R. left you a 5-star review: \\\"Exceptional work, highly recommended!\\\"\",\"action_url\":\"\\/freelancer\\/profile\"}',NULL,'2026-05-22 14:30:25','2026-05-22 14:30:25'),('444ee8ba-d9f2-4c5e-a2c8-8b2fe0059db2','App\\Notifications\\PlatformNotification','App\\Models\\User',19,'{\"type\":\"system\",\"icon\":\"bell\",\"title\":\"Profile viewed 12 times\",\"body\":\"Your profile was viewed 12 times this week. Consider updating your portfolio.\",\"action_url\":\"\\/freelancer\\/profile\"}',NULL,'2026-05-22 14:15:25','2026-05-22 14:15:25'),('48cc59d5-ba2c-404d-80b3-2ab505cdc8c3','App\\Notifications\\PlatformNotification','App\\Models\\User',19,'{\"type\":\"proposal\",\"icon\":\"file\",\"title\":\"Proposal accepted!\",\"body\":\"TechStartup Inc accepted your proposal for the SaaS Dashboard project.\",\"action_url\":\"\\/my-proposals\"}',NULL,'2026-05-22 15:15:25','2026-05-22 15:15:25'),('4e32234f-9e91-46b0-ace7-3754f6f4e2fc','App\\Notifications\\PlatformNotification','App\\Models\\User',18,'{\"type\":\"payment\",\"icon\":\"payment\",\"title\":\"$480 released to wallet\",\"body\":\"Milestone payment released. Funds are now available in your wallet.\",\"action_url\":\"\\/payments\"}',NULL,'2026-05-22 13:47:30','2026-05-22 13:47:30'),('86d9efcc-dd59-46c9-bb5b-ae0825f64d54','App\\Notifications\\PlatformNotification','App\\Models\\User',18,'{\"type\":\"system\",\"icon\":\"bell\",\"title\":\"Profile viewed 12 times\",\"body\":\"Your profile was viewed 12 times this week. Consider updating your portfolio.\",\"action_url\":\"\\/freelancer\\/profile\"}',NULL,'2026-05-22 13:17:30','2026-05-22 13:17:30'),('8dc91498-f7f6-4a05-8c3a-cbcdb63efc3b','App\\Notifications\\PlatformNotification','App\\Models\\User',19,'{\"type\":\"payment\",\"icon\":\"payment\",\"title\":\"$480 released to wallet\",\"body\":\"Milestone payment released. Funds are now available in your wallet.\",\"action_url\":\"\\/payments\"}',NULL,'2026-05-22 14:45:25','2026-05-22 14:45:25'),('aa2afd0c-b1cd-4fc8-903b-b790907dc3f5','App\\Notifications\\PlatformNotification','App\\Models\\User',18,'{\"type\":\"review\",\"icon\":\"star\",\"title\":\"5\\u2605 review received\",\"body\":\"James R. left you a 5-star review: \\\"Exceptional work, highly recommended!\\\"\",\"action_url\":\"\\/freelancer\\/profile\"}',NULL,'2026-05-22 13:32:30','2026-05-22 13:32:30'),('b9e22c11-5769-47b0-9f33-a75baf436024','App\\Notifications\\PlatformNotification','App\\Models\\User',18,'{\"type\":\"proposal\",\"icon\":\"file\",\"title\":\"Proposal accepted!\",\"body\":\"TechStartup Inc accepted your proposal for the SaaS Dashboard project.\",\"action_url\":\"\\/my-proposals\"}',NULL,'2026-05-22 14:17:30','2026-05-22 14:17:30'),('f2db89ff-9c40-47dd-9688-0fa062b5f911','App\\Notifications\\PlatformNotification','App\\Models\\User',19,'{\"type\":\"message\",\"icon\":\"message\",\"title\":\"New message from client\",\"body\":\"You have a new message regarding the React Native app project.\",\"action_url\":\"\\/messages\"}',NULL,'2026-05-22 15:00:25','2026-05-22 15:00:25');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',18,'auth_token','e0944c88c378e5daea63ef377c3de9c37ce79c899c91a018e12ebd2edc3447e4','[\"*\"]','2026-05-23 01:14:57',NULL,'2026-05-22 14:32:30','2026-05-23 01:14:57'),(2,'App\\Models\\User',19,'auth_token','381f7178fed320ccf52eb7b73bbd7ea299cb12ff5a4dfa987b42842876a70cfb','[\"*\"]','2026-05-22 16:03:27',NULL,'2026-05-22 15:30:24','2026-05-22 16:03:27'),(3,'App\\Models\\User',18,'auth_token','ced16fca0e0d433c082b558441b694bf21f4217930a340cad36d00335416a70d','[\"*\"]',NULL,NULL,'2026-05-25 12:30:28','2026-05-25 12:30:28'),(4,'App\\Models\\User',18,'auth_token','0bea8ece1b437d33e24decf7205a3829f669fd10d3d67fbc45d6916a69f553c4','[\"*\"]',NULL,NULL,'2026-05-25 12:43:16','2026-05-25 12:43:16');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portfolios`
--

DROP TABLE IF EXISTS `portfolios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolios` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `project_url` varchar(255) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `skills` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`skills`)),
  `completed_at` date DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `views` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `portfolios_user_id_foreign` (`user_id`),
  CONSTRAINT `portfolios_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portfolios`
--

LOCK TABLES `portfolios` WRITE;
/*!40000 ALTER TABLE `portfolios` DISABLE KEYS */;
/*!40000 ALTER TABLE `portfolios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proposals`
--

DROP TABLE IF EXISTS `proposals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proposals` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `job_id` bigint(20) unsigned NOT NULL,
  `freelancer_id` bigint(20) unsigned NOT NULL,
  `cover_letter` text NOT NULL,
  `bid_amount` decimal(12,2) NOT NULL,
  `bid_type` varchar(255) NOT NULL DEFAULT 'fixed',
  `estimated_duration` int(11) DEFAULT NULL,
  `duration_unit` varchar(255) NOT NULL DEFAULT 'days',
  `milestones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`milestones`)),
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `status` enum('pending','shortlisted','accepted','rejected','withdrawn') NOT NULL DEFAULT 'pending',
  `is_ai_generated` tinyint(1) NOT NULL DEFAULT 0,
  `connects_used` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `proposals_job_id_freelancer_id_unique` (`job_id`,`freelancer_id`),
  KEY `proposals_freelancer_id_foreign` (`freelancer_id`),
  CONSTRAINT `proposals_freelancer_id_foreign` FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `proposals_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proposals`
--

LOCK TABLES `proposals` WRITE;
/*!40000 ALTER TABLE `proposals` DISABLE KEYS */;
INSERT INTO `proposals` VALUES (1,1,18,'Dear Hiring Manager,\n\nI am excited to apply for this position. With my extensive experience in the field, I am confident I can deliver exceptional results that exceed your expectations.\n\nI have carefully reviewed your requirements and I believe my skills align perfectly with what you\'re looking for. I am committed to delivering high-quality work on time and within budget.\n\nI look forward to discussing how I can contribute to your project\'s success.\n\nBest regards',200.00,'fixed',10,'days',NULL,NULL,'pending',0,2,'2026-05-22 14:34:13','2026-05-22 14:34:13');
/*!40000 ALTER TABLE `proposals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` bigint(20) unsigned DEFAULT NULL,
  `reviewer_id` bigint(20) unsigned NOT NULL,
  `reviewee_id` bigint(20) unsigned NOT NULL,
  `rating` decimal(3,2) NOT NULL,
  `comment` text DEFAULT NULL,
  `breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`breakdown`)),
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_contract_id_foreign` (`contract_id`),
  KEY `reviews_reviewer_id_foreign` (`reviewer_id`),
  KEY `reviews_reviewee_id_foreign` (`reviewee_id`),
  CONSTRAINT `reviews_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
  CONSTRAINT `reviews_reviewee_id_foreign` FOREIGN KEY (`reviewee_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_reviewer_id_foreign` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saved_jobs`
--

DROP TABLE IF EXISTS `saved_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `job_id` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `saved_jobs_user_id_job_id_unique` (`user_id`,`job_id`),
  KEY `saved_jobs_job_id_foreign` (`job_id`),
  CONSTRAINT `saved_jobs_job_id_foreign` FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `saved_jobs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saved_jobs`
--

LOCK TABLES `saved_jobs` WRITE;
/*!40000 ALTER TABLE `saved_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `saved_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('6sSyaT9BVXqfFdkUMuhSyGoTVccHqbPfh9SwjUJv',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8457','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRFROempQbE5VM3RCTjZQQ0lzSkllV1owTXBmdE5MMkNJbzBVMUtYZiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1779655216),('KhMre1fJNqM6rJt0RodTtxBpKov2HyJ0xiz6BRHZ',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.8457','YTozOntzOjY6Il90b2tlbiI7czo0MDoic3BGam9aZlM2SE42cTI4RnVHQkNtYWxVaERzMThYbXRsclBkTDhMciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1779655023),('mS8LMGOfCZXdP1Kw6VUXpkfx3T8qvObGp7uENFsY',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.121.0 Chrome/142.0.7444.265 Electron/39.8.8 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiT2FDdmJqeElWSXl1cGRpbll5QndmbVdBNFVPYWFPQjBHbHJpZWdWcCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1779655353),('qAPvmMo6fb1TEyC0ppjVTMt9ru6zQycmzjudE3Fo',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.121.0 Chrome/142.0.7444.265 Electron/39.8.8 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTWtIckdUc0FKcUlkbkcybnJWTVZ4UVU0TWRObXYzRXQzT1pYVzJ3WCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1779652422),('QOqwrtkyjkcycUzrCG7onD5bHCy1fammUm0S1iSb',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoidXgzNVBkZms3VEZOanZlS0lwME00WVFWZnZ3ZTFjcjJRaW9odHY0TiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM1OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXV0aC9nb29nbGUvY2FsbGJhY2s/YXV0aHVzZXI9MCZjb2RlPTQlMkYwQWVvV3VNOE02ZzNNR3ZpTFhfUHRzTlZxdjN0YVlfWVFLQkc0T2JzbGgzSTZoX29pY0FLaHpWb1I0eUtXc2dtUzBJOGJ1QSZpc3M9aHR0cHMlM0ElMkYlMkZhY2NvdW50cy5nb29nbGUuY29tJnByb21wdD1ub25lJnNjb3BlPWVtYWlsJTIwcHJvZmlsZSUyMGh0dHBzJTNBJTJGJTJGd3d3Lmdvb2dsZWFwaXMuY29tJTJGYXV0aCUyRnVzZXJpbmZvLnByb2ZpbGUlMjBvcGVuaWQlMjBodHRwcyUzQSUyRiUyRnd3dy5nb29nbGVhcGlzLmNvbSUyRmF1dGglMkZ1c2VyaW5mby5lbWFpbCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1779463952),('rKxHvo1uepGqTiVebuAtsh1aokNXx5aa9Kgh80jI',NULL,'127.0.0.1','curl/8.17.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVm5LMjhTRFNBV294VjdTUE9CUmdDamRrZlgxVjNvY1hxSXBxSDFQMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1779655465),('RrcwypYH9bVlXCHXbPwERZxQqRo0R1JH4x8DDPxE',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoid0lwMFNnRGxVeUFaNlI2VVFINlJJbVpSZnJrejJYS1JEQkF6enkwQiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM1OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXV0aC9nb29nbGUvY2FsbGJhY2s/YXV0aHVzZXI9MCZjb2RlPTQlMkYwQWVvV3VNLUotaF9ObEZqalFDX0l2STl6QWItUDZZQVNiWUVvbTNRQkhNLTA3R1FHaXBycWxCU1hpMTRVakIyaV9zbzFXQSZpc3M9aHR0cHMlM0ElMkYlMkZhY2NvdW50cy5nb29nbGUuY29tJnByb21wdD1ub25lJnNjb3BlPWVtYWlsJTIwcHJvZmlsZSUyMGh0dHBzJTNBJTJGJTJGd3d3Lmdvb2dsZWFwaXMuY29tJTJGYXV0aCUyRnVzZXJpbmZvLmVtYWlsJTIwaHR0cHMlM0ElMkYlMkZ3d3cuZ29vZ2xlYXBpcy5jb20lMkZhdXRoJTJGdXNlcmluZm8ucHJvZmlsZSUyMG9wZW5pZCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1779716596),('UJcwRjcZGJT8KcF4qLzItJlY25vfdmV6FpehqwnQ',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVUlFcGhCd09sWUMwSFc1bmt6VXZ2UVJGdjJEa2Y1N0xyUk1vWmZyWSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzM1OiJodHRwOi8vbG9jYWxob3N0OjgwMDAvYXV0aC9nb29nbGUvY2FsbGJhY2s/YXV0aHVzZXI9MCZjb2RlPTQlMkYwQWVvV3VNLUpRbm9SSGV4OGpDS1lYRDJEcndhQkN5S1ZKUEJZSmxZNkdNb3h0bUJMajBhdWZWSmtlVE9kdjlVcG8xQWxadyZpc3M9aHR0cHMlM0ElMkYlMkZhY2NvdW50cy5nb29nbGUuY29tJnByb21wdD1ub25lJnNjb3BlPWVtYWlsJTIwcHJvZmlsZSUyMGh0dHBzJTNBJTJGJTJGd3d3Lmdvb2dsZWFwaXMuY29tJTJGYXV0aCUyRnVzZXJpbmZvLmVtYWlsJTIwb3BlbmlkJTIwaHR0cHMlM0ElMkYlMkZ3d3cuZ29vZ2xlYXBpcy5jb20lMkZhdXRoJTJGdXNlcmluZm8ucHJvZmlsZSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1779467425),('XFAqW4lpMGk7hjikYkpBtaLLEvUMlJUgkYnI8rkN',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36','YTozOntzOjY6Il90b2tlbiI7czo0MDoieFd6blowc0k3MGNQRjN5VTk3NU5nQ2k0SFdIbkFLaDVYcmRPSmhqaSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1779715801);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `skills`
--

DROP TABLE IF EXISTS `skills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `skills` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `category_id` bigint(20) unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `skills_slug_unique` (`slug`),
  KEY `skills_category_id_foreign` (`category_id`),
  CONSTRAINT `skills_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `skills`
--

LOCK TABLES `skills` WRITE;
/*!40000 ALTER TABLE `skills` DISABLE KEYS */;
INSERT INTO `skills` VALUES (1,'PHP','php',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(2,'Laravel','laravel',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(3,'React','react',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(4,'Vue.js','vuejs',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(5,'Node.js','nodejs',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(6,'Python','python',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(7,'JavaScript','javascript',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(8,'TypeScript','typescript',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(9,'MySQL','mysql',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(10,'PostgreSQL','postgresql',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(11,'Docker','docker',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(12,'AWS','aws',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(13,'Figma','figma',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(14,'UI Design','ui-design',1,1,'2026-05-22 14:21:54','2026-05-22 14:21:54'),(15,'UX Design','ux-design',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(16,'Branding','branding',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(17,'Machine Learning','machine-learning',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(18,'TensorFlow','tensorflow',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(19,'NLP','nlp',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(20,'Data Science','data-science',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(21,'React Native','react-native',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(22,'Flutter','flutter',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(23,'GraphQL','graphql',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(24,'Redis','redis',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(25,'Kubernetes','kubernetes',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(26,'Go','go',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(27,'Rust','rust',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(28,'Swift','swift',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(29,'Kotlin','kotlin',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(30,'Unity','unity',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(31,'SEO','seo',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(32,'Content Writing','content-writing',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(33,'Copywriting','copywriting',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(34,'Email Marketing','email-marketing',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(35,'Google Ads','google-ads',1,1,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(36,'jhb','jhb',NULL,1,'2026-05-22 15:30:51','2026-05-22 15:30:51');
/*!40000 ALTER TABLE `skills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `plan` enum('free','freelancer_plus','business','enterprise') NOT NULL DEFAULT 'free',
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `connects_balance` int(11) NOT NULL DEFAULT 10,
  `monthly_fee` decimal(8,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','cancelled','expired','trial') NOT NULL DEFAULT 'active',
  `trial_ends_at` timestamp NULL DEFAULT NULL,
  `current_period_end` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subscriptions_user_id_foreign` (`user_id`),
  CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES (1,1,'enterprise',NULL,9999,0.00,'active',NULL,NULL,'2026-05-22 14:21:55','2026-05-22 14:21:55'),(2,2,'freelancer_plus',NULL,80,0.00,'active',NULL,NULL,'2026-05-22 14:21:56','2026-05-22 14:21:56'),(3,3,'freelancer_plus',NULL,80,0.00,'active',NULL,NULL,'2026-05-22 14:21:56','2026-05-22 14:21:56'),(4,4,'freelancer_plus',NULL,80,0.00,'active',NULL,NULL,'2026-05-22 14:21:56','2026-05-22 14:21:56'),(5,5,'freelancer_plus',NULL,80,0.00,'active',NULL,NULL,'2026-05-22 14:21:57','2026-05-22 14:21:57'),(6,6,'freelancer_plus',NULL,80,0.00,'active',NULL,NULL,'2026-05-22 14:21:57','2026-05-22 14:21:57'),(7,7,'freelancer_plus',NULL,80,0.00,'active',NULL,NULL,'2026-05-22 14:21:58','2026-05-22 14:21:58'),(8,8,'freelancer_plus',NULL,80,0.00,'active',NULL,NULL,'2026-05-22 14:21:58','2026-05-22 14:21:58'),(9,9,'freelancer_plus',NULL,80,0.00,'active',NULL,NULL,'2026-05-22 14:21:58','2026-05-22 14:21:58'),(10,10,'freelancer_plus',NULL,80,0.00,'active',NULL,NULL,'2026-05-22 14:21:59','2026-05-22 14:21:59'),(11,11,'freelancer_plus',NULL,80,0.00,'active',NULL,NULL,'2026-05-22 14:21:59','2026-05-22 14:21:59'),(12,12,'business',NULL,0,0.00,'active',NULL,NULL,'2026-05-22 14:22:00','2026-05-22 14:22:00'),(13,13,'business',NULL,0,0.00,'active',NULL,NULL,'2026-05-22 14:22:00','2026-05-22 14:22:00'),(14,14,'business',NULL,0,0.00,'active',NULL,NULL,'2026-05-22 14:22:01','2026-05-22 14:22:01'),(15,15,'business',NULL,0,0.00,'active',NULL,NULL,'2026-05-22 14:22:01','2026-05-22 14:22:01'),(16,16,'business',NULL,0,0.00,'active',NULL,NULL,'2026-05-22 14:22:01','2026-05-22 14:22:01'),(17,17,'business',NULL,0,0.00,'active',NULL,NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02'),(18,18,'free',NULL,10,0.00,'active',NULL,NULL,'2026-05-22 14:32:30','2026-05-22 14:32:30'),(19,19,'free',NULL,10,0.00,'active',NULL,NULL,'2026-05-22 15:30:24','2026-05-22 15:30:24');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `wallet_id` bigint(20) unsigned NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `contract_id` bigint(20) unsigned DEFAULT NULL,
  `milestone_id` bigint(20) unsigned DEFAULT NULL,
  `reference` varchar(255) NOT NULL,
  `type` enum('credit','debit','escrow','release','refund','withdrawal','fee') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `fee` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(255) NOT NULL DEFAULT 'USD',
  `status` enum('pending','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
  `description` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `payment_method` varchar(255) DEFAULT NULL,
  `stripe_payment_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transactions_reference_unique` (`reference`),
  KEY `transactions_wallet_id_foreign` (`wallet_id`),
  KEY `transactions_user_id_foreign` (`user_id`),
  KEY `transactions_contract_id_foreign` (`contract_id`),
  KEY `transactions_milestone_id_foreign` (`milestone_id`),
  CONSTRAINT `transactions_contract_id_foreign` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_milestone_id_foreign` FOREIGN KEY (`milestone_id`) REFERENCES `milestones` (`id`) ON DELETE SET NULL,
  CONSTRAINT `transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `transactions_wallet_id_foreign` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `role` enum('freelancer','client','admin') NOT NULL DEFAULT 'freelancer',
  `name` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `timezone` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `phone_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_online` tinyint(1) NOT NULL DEFAULT 0,
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `github_id` varchar(255) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','Admin FreeNest','admin','admin@freenest.io','https://randomuser.me/api/portraits/men/0.jpg',NULL,'$2y$12$ZlaNRUTa74Cte9qy.GkaSO/vVXBWFmBZ0fK3YhKOs/FBs8bTFX3Yu',NULL,'2026-05-22 14:21:55','2026-05-22 14:21:55',NULL,NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(2,'freelancer','Alex Johnson','alex_johnson','alex@freenest.io','https://randomuser.me/api/portraits/men/11.jpg',NULL,'$2y$12$dYbati90Oc7t6nJCV96Xtu41aG6/6WGw8FMsJAXhPmO2Yssz71fxC',NULL,'2026-05-22 14:21:55','2026-05-22 14:21:55','US',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(3,'freelancer','Sofia Martinez','sofia_design','sofia@freenest.io','https://randomuser.me/api/portraits/women/21.jpg',NULL,'$2y$12$MbF4lIoHew8ex22EaIZjpeHz..PWne901B.jkTDaXpLou56/WCygW',NULL,'2026-05-22 14:21:56','2026-05-22 14:21:56','ES',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(4,'freelancer','Karim Tahiri','karim_ai','karim@freenest.io','https://randomuser.me/api/portraits/men/32.jpg',NULL,'$2y$12$ABCdYVtxzgJVj5QqVe3fnONNHwgTEg3jaquuFGlJxWUJRHkmuuSyG',NULL,'2026-05-22 14:21:56','2026-05-22 14:21:56','MA',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(5,'freelancer','Lena Fischer','lena_dev','lena@freenest.io','https://randomuser.me/api/portraits/women/44.jpg',NULL,'$2y$12$WailJW0HbHXI0ZVrTTtVWeSXtp6M9ZNSYCQibzz.pxWDY4K8AZcFu',NULL,'2026-05-22 14:21:57','2026-05-22 14:21:57','DE',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(6,'freelancer','James Okafor','james_mobile','james@freenest.io','https://randomuser.me/api/portraits/men/55.jpg',NULL,'$2y$12$8ZOXZT/Hv8BrpLESoH.cXujp1KahzCwrzn7izRtB7ROgLbMl4gBJe',NULL,'2026-05-22 14:21:57','2026-05-22 14:21:57','NG',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(7,'freelancer','Amira Hassan','amira_write','amira@freenest.io','https://randomuser.me/api/portraits/women/62.jpg',NULL,'$2y$12$m0v24w4I0DDkU3HEQaq03ufnpK6SAvRkO88VEK8uw.LI3s.jzHQnO',NULL,'2026-05-22 14:21:58','2026-05-22 14:21:58','EG',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(8,'freelancer','Lucas Dupont','lucas_vue','lucas@freenest.io','https://randomuser.me/api/portraits/men/73.jpg',NULL,'$2y$12$u631RUXPC3bjQU.VoDgktui.lBo2hHHL1S38eDwzJwAOZLIRFGyRK',NULL,'2026-05-22 14:21:58','2026-05-22 14:21:58','FR',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(9,'freelancer','Priya Sharma','priya_ds','priya@freenest.io','https://randomuser.me/api/portraits/women/83.jpg',NULL,'$2y$12$8PsFLSg6p5Kfjlb.jHWQHuNX4acRMXOQPRHuK3AoV.SrlArYzXG9u',NULL,'2026-05-22 14:21:58','2026-05-22 14:21:58','IN',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(10,'freelancer','Omar Benali','omar_go','omar@freenest.io','https://randomuser.me/api/portraits/men/87.jpg',NULL,'$2y$12$kasuBrwHvN8qd.SIqsjTcOf28xZ1OlCjQxOvLuVsRRwjPVRlGW.vO',NULL,'2026-05-22 14:21:59','2026-05-22 14:21:59','DZ',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(11,'freelancer','Emma Wilson','emma_marketing','emma@freenest.io','https://randomuser.me/api/portraits/women/90.jpg',NULL,'$2y$12$edcjIVYHSL95VuBtMmlk8uHZaG2KSuLqCPil1PxEGeDoeV.kI1xcu',NULL,'2026-05-22 14:21:59','2026-05-22 14:21:59','GB',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(12,'client','Nathan Rivera','nathan_tech','client1@freenest.io','https://randomuser.me/api/portraits/men/15.jpg',NULL,'$2y$12$sh/c7L0lOAegF0ZYpmmaNumTKh2fkkoCv.0baskwlB6DrKGMieU/u',NULL,'2026-05-22 14:22:00','2026-05-22 14:22:00','US',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(13,'client','Claire Dubois','claire_startup','client2@freenest.io','https://randomuser.me/api/portraits/women/28.jpg',NULL,'$2y$12$ley2xIAjYQAPpVXI/F0ibOdfpylsnM7pKDLUubx/t58Aal7emnAfu',NULL,'2026-05-22 14:22:00','2026-05-22 14:22:00','FR',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(14,'client','Mohammed Al-Rashid','mohammed_biz','client3@freenest.io','https://randomuser.me/api/portraits/men/38.jpg',NULL,'$2y$12$Saj4Z9smNlLwla627bLvT.6PP5/ncICGwF29bl/hvCTHjglwR3gDC',NULL,'2026-05-22 14:22:00','2026-05-22 14:22:00','AE',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(15,'client','Yuki Tanaka','yuki_games','client4@freenest.io','https://randomuser.me/api/portraits/women/47.jpg',NULL,'$2y$12$RSs484UGBhtFS3UZULC8p.J9ty/h7xMtVfPNT00Md28gZcsb2rVtm',NULL,'2026-05-22 14:22:01','2026-05-22 14:22:01','JP',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(16,'client','David Osei','david_health','client5@freenest.io','https://randomuser.me/api/portraits/men/58.jpg',NULL,'$2y$12$3z4h0rPMTP/HcNPrRuib/.N9wZG2tG/7IOme.CEBzo2kfYdjrwEzW',NULL,'2026-05-22 14:22:01','2026-05-22 14:22:01','GH',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(17,'client','Isabella Conti','isabella_ecom','client6@freenest.io','https://randomuser.me/api/portraits/women/67.jpg',NULL,'$2y$12$ob4JIYAuIAgHrtB4Oqm2w.GKxYPXErLXZ.t9qg7b9mIrA70wwQb/m',NULL,'2026-05-22 14:22:02','2026-05-22 14:22:02','IT',NULL,NULL,0,1,1,0,NULL,NULL,NULL,NULL),(18,'freelancer','FASKO','fasko','fasko975@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocIRhR91nK3EX4ln1RkNKefD4p4dZOHpU1Tu5jwuspyP9QKHhg=s200-c',NULL,'$2y$12$3xtKkj2uaXjyTDjD5bhXDe3N034CEIklNCBBzU8oLFJ3wAdGfbRUW',NULL,'2026-05-22 14:32:30','2026-05-25 12:43:16',NULL,NULL,NULL,0,0,1,1,'2026-05-25 12:43:16','110051133158336634156',NULL,NULL),(19,'freelancer','AYOUB yt','ayoub_yt','ayoubelmernissi55@gmail.com','https://lh3.googleusercontent.com/a/ACg8ocLvc7JJgo10elT8_SmkL55NWKS92Rl-zidUR05RyxKpSH4qeg=s200-c',NULL,'$2y$12$MqriLuRYq72DvCwBNtwsVuiy5uIrqXc9H5VNC.rlQU6UJFFJ8izJ2',NULL,'2026-05-22 15:30:24','2026-05-22 15:30:24',NULL,NULL,NULL,0,0,1,1,'2026-05-22 15:30:24','108303915853853308281',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallets`
--

DROP TABLE IF EXISTS `wallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `pending_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `escrow_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(255) NOT NULL DEFAULT 'USD',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wallets_user_id_foreign` (`user_id`),
  CONSTRAINT `wallets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallets`
--

LOCK TABLES `wallets` WRITE;
/*!40000 ALTER TABLE `wallets` DISABLE KEYS */;
INSERT INTO `wallets` VALUES (1,1,0.00,0.00,0.00,'USD','2026-05-22 14:21:55','2026-05-22 14:21:55'),(2,2,9860.00,0.00,0.00,'USD','2026-05-22 14:21:56','2026-05-22 14:21:56'),(3,3,5720.00,0.00,0.00,'USD','2026-05-22 14:21:56','2026-05-22 14:21:56'),(4,4,4860.00,0.00,0.00,'USD','2026-05-22 14:21:56','2026-05-22 14:21:56'),(5,5,5760.00,0.00,0.00,'USD','2026-05-22 14:21:57','2026-05-22 14:21:57'),(6,6,3480.00,0.00,0.00,'USD','2026-05-22 14:21:57','2026-05-22 14:21:57'),(7,7,5490.00,0.00,0.00,'USD','2026-05-22 14:21:58','2026-05-22 14:21:58'),(8,8,4620.00,0.00,0.00,'USD','2026-05-22 14:21:58','2026-05-22 14:21:58'),(9,9,4510.00,0.00,0.00,'USD','2026-05-22 14:21:58','2026-05-22 14:21:58'),(10,10,3610.00,0.00,0.00,'USD','2026-05-22 14:21:59','2026-05-22 14:21:59'),(11,11,5200.00,0.00,0.00,'USD','2026-05-22 14:21:59','2026-05-22 14:21:59'),(12,12,12000.00,0.00,0.00,'USD','2026-05-22 14:22:00','2026-05-22 14:22:00'),(13,13,7500.00,0.00,0.00,'USD','2026-05-22 14:22:00','2026-05-22 14:22:00'),(14,14,25000.00,0.00,0.00,'USD','2026-05-22 14:22:01','2026-05-22 14:22:01'),(15,15,15000.00,0.00,0.00,'USD','2026-05-22 14:22:01','2026-05-22 14:22:01'),(16,16,5000.00,0.00,0.00,'USD','2026-05-22 14:22:01','2026-05-22 14:22:01'),(17,17,9000.00,0.00,0.00,'USD','2026-05-22 14:22:02','2026-05-22 14:22:02'),(18,18,0.00,0.00,0.00,'USD','2026-05-22 14:32:30','2026-05-22 14:32:30'),(19,19,0.00,0.00,0.00,'USD','2026-05-22 15:30:24','2026-05-22 15:30:24');
/*!40000 ALTER TABLE `wallets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-25 18:54:12
