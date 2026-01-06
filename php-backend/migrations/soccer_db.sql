-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Värd: familjenfalth.se.mysql.service.one.com:3306
-- Tid vid skapande: 06 jan 2026 kl 13:24
-- Serverversion: 10.6.23-MariaDB-ubu2204
-- PHP-version: 8.1.2-1ubuntu2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databas: `familjenfalth_senr2`
--

-- --------------------------------------------------------

--
-- Tabellstruktur `active_sessions`
--

CREATE TABLE `active_sessions` (
  `ip` text NOT NULL,
  `session` text DEFAULT NULL,
  `date` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumpning av Data i tabell `active_sessions`
--

INSERT INTO `active_sessions` (`ip`, `session`, `date`) VALUES
('2a03:2880:32ff:72::', '118ea12bf7b85d961d56a4cfd69eec6b', '2026-01-06 11:38:02'),
('2a03:2880:32ff:2::', 'cae5bc35e62fdedcb0033e97f36cf1ae', '2026-01-06 11:38:01');

-- --------------------------------------------------------

--
-- Tabellstruktur `bets`
--

CREATE TABLE `bets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `match_id` int(11) NOT NULL,
  `home_score` int(11) DEFAULT NULL,
  `away_score` int(11) DEFAULT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `points` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur `forum_posts`
--

CREATE TABLE `forum_posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `forum_posts`
--

INSERT INTO `forum_posts` (`id`, `user_id`, `title`, `content`, `created_at`, `updated_at`) VALUES
(8, 1, 'Vi testar tipset', 'EANKBT sitter aldrig still och har såklart anammat senaste AI-trenden och skapat en helt ny tips-sida från grunden men en av världens förnämsta AI-agenter, Claude. \nNu testar vi konceptet i beta-testning under EM 2025!', '2025-07-02 13:57:46', '2025-07-23 08:07:39'),
(9, 1, 'Hej', 'Hallå!', '2025-07-27 18:00:20', '2025-07-27 18:00:28');

-- --------------------------------------------------------

--
-- Tabellstruktur `forum_replies`
--

CREATE TABLE `forum_replies` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `forum_replies`
--

INSERT INTO `forum_replies` (`id`, `post_id`, `user_id`, `content`, `created_at`) VALUES
(8, 8, 1, 'Hej @Adminen!', '2025-07-04 19:11:53'),
(9, 8, 1, '@Adminen - testar tagging i inlägg igen.', '2025-07-16 11:57:14'),
(10, 8, 1, 'Hej! Nu testar vi att tagga användare igen, @Adminen.', '2025-07-23 08:07:39'),
(11, 9, 1, 'Hej!', '2025-07-27 18:00:27');

-- --------------------------------------------------------

--
-- Tabellstruktur `knockout_predictions`
--

CREATE TABLE `knockout_predictions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `round` varchar(32) NOT NULL,
  `team_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `points` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur `knockout_scoring_config`
--

CREATE TABLE `knockout_scoring_config` (
  `id` int(11) NOT NULL,
  `match_type` enum('ROUND_OF_32','ROUND_OF_16','QUARTER_FINAL','SEMI_FINAL','FINAL','WINNER') NOT NULL,
  `points_per_correct_team` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `knockout_scoring_config`
--

INSERT INTO `knockout_scoring_config` (`id`, `match_type`, `points_per_correct_team`, `created_at`, `updated_at`, `active`, `description`) VALUES
(14, 'ROUND_OF_32', 1, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 1, 'Tippa vilka 32 lag som går vidare från gruppspel'),
(15, 'ROUND_OF_16', 2, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 1, 'Tippa vilka 16 lag som går vidare till åttondelsfinal'),
(16, 'QUARTER_FINAL', 3, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 1, 'Tippa vilka 8 lag som går vidare till kvartsfinal'),
(17, 'SEMI_FINAL', 4, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 1, 'Tippa vilka 4 lag som går vidare till semifinal'),
(18, 'FINAL', 5, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 1, 'Tippa vilka 2 lag som går till final'),
(19, 'WINNER', 10, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 1, 'Tippa vinnaren av VM');

-- --------------------------------------------------------

--
-- Tabellstruktur `matches`
--

CREATE TABLE `matches` (
  `id` int(11) NOT NULL,
  `external_id` int(11) DEFAULT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `home_score` int(11) DEFAULT NULL,
  `away_score` int(11) DEFAULT NULL,
  `matchTime` datetime NOT NULL,
  `status` enum('scheduled','live','finished') DEFAULT 'scheduled',
  `matchType` enum('GROUP','ROUND_OF_32','ROUND_OF_16','QUARTER_FINAL','SEMI_FINAL','FINAL') DEFAULT 'GROUP',
  `group` varchar(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `allowed_home_groups` varchar(255) DEFAULT NULL COMMENT 'Comma-separated list of groups (A,B,C,D) that can be selected for home team',
  `allowed_away_groups` varchar(255) DEFAULT NULL COMMENT 'Comma-separated list of groups (A,B,C,D) that can be selected for away team',
  `home_group_description` varchar(255) DEFAULT NULL COMMENT 'Description shown to users for home team selection (e.g., "Vinnare grupp A och B")',
  `away_group_description` varchar(255) DEFAULT NULL COMMENT 'Description shown to users for away team selection (e.g., "Vinnare grupp C och D")'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `matches`
--

INSERT INTO `matches` (`id`, `external_id`, `home_team_id`, `away_team_id`, `home_score`, `away_score`, `matchTime`, `status`, `matchType`, `group`, `created_at`, `updated_at`, `allowed_home_groups`, `allowed_away_groups`, `home_group_description`, `away_group_description`) VALUES
(52, NULL, 45, 46, NULL, NULL, '2026-06-11 21:00:00', 'scheduled', 'GROUP', 'A', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(53, NULL, 47, 48, NULL, NULL, '2026-06-12 04:00:00', 'scheduled', 'GROUP', 'A', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(54, NULL, 48, 46, NULL, NULL, '2026-06-18 18:00:00', 'scheduled', 'GROUP', 'A', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(55, NULL, 45, 47, NULL, NULL, '2026-06-19 03:00:00', 'scheduled', 'GROUP', 'A', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(56, NULL, 46, 47, NULL, NULL, '2026-06-25 03:00:00', 'scheduled', 'GROUP', 'A', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(57, NULL, 48, 45, NULL, NULL, '2026-06-25 03:00:00', 'scheduled', 'GROUP', 'A', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(58, NULL, 49, 52, NULL, NULL, '2026-06-12 21:00:00', 'scheduled', 'GROUP', 'B', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(59, NULL, 51, 50, NULL, NULL, '2026-06-13 21:00:00', 'scheduled', 'GROUP', 'B', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(60, NULL, 50, 52, NULL, NULL, '2026-06-18 21:00:00', 'scheduled', 'GROUP', 'B', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(61, NULL, 49, 51, NULL, NULL, '2026-06-19 00:00:00', 'scheduled', 'GROUP', 'B', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(62, NULL, 50, 49, NULL, NULL, '2026-06-24 21:00:00', 'scheduled', 'GROUP', 'B', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(63, NULL, 52, 51, NULL, NULL, '2026-06-24 21:00:00', 'scheduled', 'GROUP', 'B', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(64, NULL, 53, 54, NULL, NULL, '2026-06-14 00:00:00', 'scheduled', 'GROUP', 'C', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(65, NULL, 56, 55, NULL, NULL, '2026-06-14 03:00:00', 'scheduled', 'GROUP', 'C', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(66, NULL, 55, 54, NULL, NULL, '2026-06-20 00:00:00', 'scheduled', 'GROUP', 'C', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(67, NULL, 53, 56, NULL, NULL, '2026-06-20 03:00:00', 'scheduled', 'GROUP', 'C', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(68, NULL, 54, 56, NULL, NULL, '2026-06-25 00:00:00', 'scheduled', 'GROUP', 'C', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(69, NULL, 55, 53, NULL, NULL, '2026-06-25 00:00:00', 'scheduled', 'GROUP', 'C', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(70, NULL, 57, 58, NULL, NULL, '2026-06-13 03:00:00', 'scheduled', 'GROUP', 'D', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(71, NULL, 59, 60, NULL, NULL, '2026-06-14 06:00:00', 'scheduled', 'GROUP', 'D', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(72, NULL, 57, 59, NULL, NULL, '2026-06-19 21:00:00', 'scheduled', 'GROUP', 'D', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(73, NULL, 60, 58, NULL, NULL, '2026-06-20 06:00:00', 'scheduled', 'GROUP', 'D', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(74, NULL, 60, 57, NULL, NULL, '2026-06-26 04:00:00', 'scheduled', 'GROUP', 'D', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(75, NULL, 58, 59, NULL, NULL, '2026-06-26 04:00:00', 'scheduled', 'GROUP', 'D', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(76, NULL, 61, 64, NULL, NULL, '2026-06-14 19:00:00', 'scheduled', 'GROUP', 'E', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(77, NULL, 63, 62, NULL, NULL, '2026-06-15 01:00:00', 'scheduled', 'GROUP', 'E', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(78, NULL, 61, 63, NULL, NULL, '2026-06-20 22:00:00', 'scheduled', 'GROUP', 'E', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(79, NULL, 62, 64, NULL, NULL, '2026-06-21 02:00:00', 'scheduled', 'GROUP', 'E', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(80, NULL, 64, 63, NULL, NULL, '2026-06-25 22:00:00', 'scheduled', 'GROUP', 'E', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(81, NULL, 62, 61, NULL, NULL, '2026-06-25 22:00:00', 'scheduled', 'GROUP', 'E', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(82, NULL, 65, 66, NULL, NULL, '2026-06-14 22:00:00', 'scheduled', 'GROUP', 'F', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(83, NULL, 68, 67, NULL, NULL, '2026-06-15 04:00:00', 'scheduled', 'GROUP', 'F', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(84, NULL, 65, 68, NULL, NULL, '2026-06-20 19:00:00', 'scheduled', 'GROUP', 'F', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(85, NULL, 67, 66, NULL, NULL, '2026-06-21 06:00:00', 'scheduled', 'GROUP', 'F', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(86, NULL, 67, 65, NULL, NULL, '2026-06-26 01:00:00', 'scheduled', 'GROUP', 'F', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(87, NULL, 66, 68, NULL, NULL, '2026-06-26 01:00:00', 'scheduled', 'GROUP', 'F', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(88, NULL, 69, 70, NULL, NULL, '2026-06-15 21:00:00', 'scheduled', 'GROUP', 'G', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(89, NULL, 71, 72, NULL, NULL, '2026-06-16 03:00:00', 'scheduled', 'GROUP', 'G', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(90, NULL, 69, 71, NULL, NULL, '2026-06-21 21:00:00', 'scheduled', 'GROUP', 'G', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(91, NULL, 72, 70, NULL, NULL, '2026-06-22 03:00:00', 'scheduled', 'GROUP', 'G', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(92, NULL, 72, 69, NULL, NULL, '2026-06-27 05:00:00', 'scheduled', 'GROUP', 'G', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(93, NULL, 70, 71, NULL, NULL, '2026-06-27 05:00:00', 'scheduled', 'GROUP', 'G', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(94, NULL, 73, 76, NULL, NULL, '2026-06-15 18:00:00', 'scheduled', 'GROUP', 'H', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(95, NULL, 75, 74, NULL, NULL, '2026-06-16 00:00:00', 'scheduled', 'GROUP', 'H', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(96, NULL, 73, 75, NULL, NULL, '2026-06-21 18:00:00', 'scheduled', 'GROUP', 'H', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(97, NULL, 74, 76, NULL, NULL, '2026-06-22 00:00:00', 'scheduled', 'GROUP', 'H', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(98, NULL, 76, 75, NULL, NULL, '2026-06-27 02:00:00', 'scheduled', 'GROUP', 'H', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(99, NULL, 74, 73, NULL, NULL, '2026-06-27 02:00:00', 'scheduled', 'GROUP', 'H', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(100, NULL, 77, 78, NULL, NULL, '2026-06-16 21:00:00', 'scheduled', 'GROUP', 'I', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(101, NULL, 80, 79, NULL, NULL, '2026-06-17 00:00:00', 'scheduled', 'GROUP', 'I', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(102, NULL, 77, 80, NULL, NULL, '2026-06-22 23:00:00', 'scheduled', 'GROUP', 'I', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(103, NULL, 79, 78, NULL, NULL, '2026-06-23 02:00:00', 'scheduled', 'GROUP', 'I', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(104, NULL, 79, 77, NULL, NULL, '2026-06-26 21:00:00', 'scheduled', 'GROUP', 'I', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(105, NULL, 78, 80, NULL, NULL, '2026-06-26 21:00:00', 'scheduled', 'GROUP', 'I', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(106, NULL, 81, 82, NULL, NULL, '2026-06-17 03:00:00', 'scheduled', 'GROUP', 'J', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(107, NULL, 83, 84, NULL, NULL, '2026-06-17 06:00:00', 'scheduled', 'GROUP', 'J', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(108, NULL, 81, 83, NULL, NULL, '2026-06-22 19:00:00', 'scheduled', 'GROUP', 'J', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(109, NULL, 84, 82, NULL, NULL, '2026-06-23 05:00:00', 'scheduled', 'GROUP', 'J', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(110, NULL, 82, 83, NULL, NULL, '2026-06-28 04:00:00', 'scheduled', 'GROUP', 'J', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(111, NULL, 84, 81, NULL, NULL, '2026-06-28 04:00:00', 'scheduled', 'GROUP', 'J', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(112, NULL, 85, 88, NULL, NULL, '2026-06-17 19:00:00', 'scheduled', 'GROUP', 'K', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(113, NULL, 87, 86, NULL, NULL, '2026-06-18 04:00:00', 'scheduled', 'GROUP', 'K', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(114, NULL, 85, 87, NULL, NULL, '2026-06-23 19:00:00', 'scheduled', 'GROUP', 'K', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(115, NULL, 86, 88, NULL, NULL, '2026-06-24 04:00:00', 'scheduled', 'GROUP', 'K', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(116, NULL, 86, 85, NULL, NULL, '2026-06-28 01:30:00', 'scheduled', 'GROUP', 'K', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(117, NULL, 88, 87, NULL, NULL, '2026-06-28 01:30:00', 'scheduled', 'GROUP', 'K', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(118, NULL, 89, 90, NULL, NULL, '2026-06-17 22:00:00', 'scheduled', 'GROUP', 'L', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(119, NULL, 91, 92, NULL, NULL, '2026-06-18 01:00:00', 'scheduled', 'GROUP', 'L', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(120, NULL, 89, 91, NULL, NULL, '2026-06-23 22:00:00', 'scheduled', 'GROUP', 'L', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(121, NULL, 92, 90, NULL, NULL, '2026-06-24 01:00:00', 'scheduled', 'GROUP', 'L', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(122, NULL, 92, 89, NULL, NULL, '2026-06-27 23:00:00', 'scheduled', 'GROUP', 'L', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(123, NULL, 90, 91, NULL, NULL, '2026-06-27 23:00:00', 'scheduled', 'GROUP', 'L', '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, NULL, NULL),
(124, NULL, NULL, NULL, NULL, NULL, '2026-06-28 21:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'A', 'B', '2:a Grupp A', '2:a Grupp B'),
(125, NULL, NULL, NULL, NULL, NULL, '2026-06-29 22:30:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'E', NULL, '1:a Grupp E', 'Bästa 3:a'),
(126, NULL, NULL, NULL, NULL, NULL, '2026-06-30 03:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'F', 'C', '1:a Grupp F', '2:a Grupp C'),
(127, NULL, NULL, NULL, NULL, NULL, '2026-06-29 19:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'C', 'F', '1:a Grupp C', '2:a Grupp F'),
(128, NULL, NULL, NULL, NULL, NULL, '2026-06-30 23:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'I', NULL, '1:a Grupp I', 'Bästa 3:a'),
(129, NULL, NULL, NULL, NULL, NULL, '2026-06-30 19:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'E', 'I', '2:a Grupp E', '2:a Grupp I'),
(130, NULL, NULL, NULL, NULL, NULL, '2026-07-01 03:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'A', NULL, '1:a Grupp A', 'Bästa 3:a'),
(131, NULL, NULL, NULL, NULL, NULL, '2026-07-01 18:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'L', NULL, '1:a Grupp L', 'Bästa 3:a'),
(132, NULL, NULL, NULL, NULL, NULL, '2026-07-02 02:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'D', NULL, '1:a Grupp D', 'Bästa 3:a'),
(133, NULL, NULL, NULL, NULL, NULL, '2026-07-01 22:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'G', NULL, '1:a Grupp G', 'Bästa 3:a'),
(134, NULL, NULL, NULL, NULL, NULL, '2026-07-03 01:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'K', 'L', '2:a Grupp K', '2:a Grupp L'),
(135, NULL, NULL, NULL, NULL, NULL, '2026-07-02 21:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'H', 'J', '1:a Grupp H', '2:a Grupp J'),
(136, NULL, NULL, NULL, NULL, NULL, '2026-07-03 05:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'B', NULL, '1:a Grupp B', 'Bästa 3:a'),
(137, NULL, NULL, NULL, NULL, NULL, '2026-07-04 00:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'J', 'H', '1:a Grupp J', '2:a Grupp H'),
(138, NULL, NULL, NULL, NULL, NULL, '2026-07-04 03:30:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'K', NULL, '1:a Grupp K', 'Bästa 3:a'),
(139, NULL, NULL, NULL, NULL, NULL, '2026-07-03 20:00:00', 'scheduled', 'ROUND_OF_32', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', 'D', 'G', '2:a Grupp D', '2:a Grupp G'),
(140, NULL, NULL, NULL, NULL, NULL, '2026-07-04 23:00:00', 'scheduled', 'ROUND_OF_16', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare 32-del 2', 'Vinnare 32-del 5'),
(141, NULL, NULL, NULL, NULL, NULL, '2026-07-04 19:00:00', 'scheduled', 'ROUND_OF_16', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare 32-del 1', 'Vinnare 32-del 3'),
(142, NULL, NULL, NULL, NULL, NULL, '2026-07-05 22:00:00', 'scheduled', 'ROUND_OF_16', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare 32-del 4', 'Vinnare 32-del 6'),
(143, NULL, NULL, NULL, NULL, NULL, '2026-07-06 02:00:00', 'scheduled', 'ROUND_OF_16', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare 32-del 7', 'Vinnare 32-del 8'),
(144, NULL, NULL, NULL, NULL, NULL, '2026-07-06 21:00:00', 'scheduled', 'ROUND_OF_16', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare 32-del 11', 'Vinnare 32-del 12'),
(145, NULL, NULL, NULL, NULL, NULL, '2026-07-07 02:00:00', 'scheduled', 'ROUND_OF_16', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare 32-del 9', 'Vinnare 32-del 10'),
(146, NULL, NULL, NULL, NULL, NULL, '2026-07-07 18:00:00', 'scheduled', 'ROUND_OF_16', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare 32-del 14', 'Vinnare 32-del 16'),
(147, NULL, NULL, NULL, NULL, NULL, '2026-07-07 22:00:00', 'scheduled', 'ROUND_OF_16', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare 32-del 13', 'Vinnare 32-del 15'),
(148, NULL, NULL, NULL, NULL, NULL, '2026-07-09 22:00:00', 'scheduled', 'QUARTER_FINAL', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare åttondelsfinal 1', 'Vinnare åttondelsfinal 2'),
(149, NULL, NULL, NULL, NULL, NULL, '2026-07-10 21:00:00', 'scheduled', 'QUARTER_FINAL', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare åttondelsfinal 5', 'Vinnare åttondelsfinal 6'),
(150, NULL, NULL, NULL, NULL, NULL, '2026-07-11 23:00:00', 'scheduled', 'QUARTER_FINAL', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare åttondelsfinal 3', 'Vinnare åttondelsfinal 4'),
(151, NULL, NULL, NULL, NULL, NULL, '2026-07-12 03:00:00', 'scheduled', 'QUARTER_FINAL', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare åttondelsfinal 7', 'Vinnare åttondelsfinal 8'),
(152, NULL, NULL, NULL, NULL, NULL, '2026-07-14 21:00:00', 'scheduled', 'SEMI_FINAL', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare kvartsfinal 1', 'Vinnare kvartsfinal 2'),
(153, NULL, NULL, NULL, NULL, NULL, '2026-07-15 21:00:00', 'scheduled', 'SEMI_FINAL', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare kvartsfinal 3', 'Vinnare kvartsfinal 4'),
(154, NULL, NULL, NULL, NULL, NULL, '2026-07-18 23:00:00', 'scheduled', 'FINAL', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Förlorare semifinal 1', 'Förlorare semifinal 2'),
(155, NULL, NULL, NULL, NULL, NULL, '2026-07-19 21:00:00', 'scheduled', 'FINAL', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33', NULL, NULL, 'Vinnare semifinal 1', 'Vinnare semifinal 2');

-- --------------------------------------------------------

--
-- Tabellstruktur `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur `site_content`
--

CREATE TABLE `site_content` (
  `id` int(11) NOT NULL,
  `content_key` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `content_type` enum('text','html','markdown') NOT NULL DEFAULT 'html',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `site_content`
--

INSERT INTO `site_content` (`id`, `content_key`, `title`, `content`, `content_type`, `updated_at`, `created_at`) VALUES
(1, 'homepage_welcome', 'Välkommen till EANKBT!', '<div class=\"mui-paper mui-content\" style=\"text-align: left\"\">\n\n<h1>Välkommen till EANKBT!</h1>\n<p>Tävla med vänner och familj genom att tippa på fotbolls-VM 2026. Samla poäng genom att gissa rätt resultat och klättra upp på resultattavlan!</p>\n\n<h2>Tippa EM i Ett Av Norra Kindas Bästa Tips...</h2>\n<h2>...och bidra samtidigt till stöd för Ukraina</h2>\n<p>Att följa matcherna blir ju så mycket mer spännande om man \nhar tippat innan. Och det kostar endast 100:- att vara med i tipset.</p>\n<p>\nFörutom att få ett roligare EM\när man dessutom med och bidrar till en bättre värld via gåvor till Erikshjälpens insamling.</p>\n<p>Erikshjälpens insatser i Ukraina fokuserar till stor del på utbildning, hälsa samt trygghet och skydd för barn och deras familjer i och med det krig som startade i samband med Rysslands invasion den 24 februari 2022.</p>\n<p>Erikshjälpen bidrar bland annat till:\n<ul>\n<li>Att barn och kvinnor i hårt drabbade områden återhämtar sig för att delta i återuppbyggnaden av sina samhällen.</li>\n<li>Humanitärt stöd för internflyktingar.</li>\n<li>Psykosocialt stöd i syfte att bearbeta trauman orsakade av kriget.</li>\n<li>Stöttning för dem som är kvar i Ukraina och för personer som återvänder till landet.</li>\n</ul>\n</p>\n<p>Läs mer <a class=\"MuiButtonBase-root\" href=\"https://erikshjalpen.se/insatser-i-varlden/europa/\" target=\"_new\">här</a>.</p>\n</div>', 'html', '2025-07-23 18:00:20', '2025-06-26 15:05:05'),
(2, 'homepage_rules', 'Regler och Poängsystem', '<div class=\"mui-paper mui-content\" style=\"text-align: left\">\n<h1>Poängsystem</h1>\n<ul><li>Exakt resultat: 3 poäng</li>\n<li>Rätt utfall (vinst/oavgjort): 1 poäng</li>\n</ul>\n\n<h2>Viktiga regler</h2>\n<ul>\n<li>Tips måste lämnas innan 2026-01-XX</li>\n<li>Tips kan inte ändras efter mästerskapet startar.</li><li>Alla får vara med!</li>\n</ul>\n</div>', 'html', '2025-07-25 13:23:33', '2025-06-26 15:05:05');

-- --------------------------------------------------------

--
-- Tabellstruktur `special_bets`
--

CREATE TABLE `special_bets` (
  `id` int(11) NOT NULL,
  `question` varchar(500) NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Array of possible answers' CHECK (json_valid(`options`)),
  `correct_option` varchar(255) DEFAULT NULL COMMENT 'The correct answer from options',
  `points` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur `system_config`
--

CREATE TABLE `system_config` (
  `id` int(11) NOT NULL,
  `config_key` varchar(100) NOT NULL,
  `config_value` text DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `system_config`
--

INSERT INTO `system_config` (`id`, `config_key`, `config_value`, `description`, `created_at`, `updated_at`) VALUES
(1, 'bets_locked', 'false', 'Anger om betting är låst för alla användare', '2025-06-17 19:55:42', '2025-07-24 09:48:27'),
(2, 'tournament_name', 'VM', 'Namnet på turneringen', '2025-06-17 19:55:42', '2025-07-25 11:45:04'),
(3, 'app_version', '1.0', 'Applikationsversion', '2025-06-17 19:55:42', '2025-06-17 19:55:42'),
(4, 'tournament_year', '2026', 'Året för turneringen', '2025-06-27 11:06:34', '2025-07-25 11:45:04'),
(5, 'tournament_description', 'EANKBT officiella fotbolls-tips', 'Beskrivning av turneringen', '2025-06-27 11:06:34', '2025-07-25 11:45:04');

-- --------------------------------------------------------

--
-- Tabellstruktur `teams`
--

CREATE TABLE `teams` (
  `id` int(11) NOT NULL,
  `external_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `short_name` varchar(50) DEFAULT NULL,
  `group` varchar(1) DEFAULT NULL,
  `flag_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `teams`
--

INSERT INTO `teams` (`id`, `external_id`, `name`, `short_name`, `group`, `flag_url`, `created_at`, `updated_at`) VALUES
(45, NULL, 'Mexico', 'MEX', 'A', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(46, NULL, 'Sydafrika', 'RSA', 'A', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(47, NULL, 'Sydkorea', 'KOR', 'A', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(48, NULL, 'Play-off UEFA D', 'TBD', 'A', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(49, NULL, 'Kanada', 'CAN', 'B', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(50, NULL, 'Schweiz', 'SUI', 'B', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(51, NULL, 'Qatar', 'QAT', 'B', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(52, NULL, 'Play-off UEFA A', 'TBD', 'B', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(53, NULL, 'Brasilien', 'BRA', 'C', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(54, NULL, 'Marocko', 'MAR', 'C', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(55, NULL, 'Skottland', 'SCO', 'C', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(56, NULL, 'Haiti', 'HAI', 'C', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(57, NULL, 'USA', 'USA', 'D', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(58, NULL, 'Paraguay', 'PAR', 'D', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(59, NULL, 'Australien', 'AUS', 'D', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(60, NULL, 'Play-off UEFA B', 'TBD', 'D', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(61, NULL, 'Tyskland', 'GER', 'E', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(62, NULL, 'Ecuador', 'ECU', 'E', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(63, NULL, 'Elfenbenskusten', 'CIV', 'E', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(64, NULL, 'Curaçao', 'CUR', 'E', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(65, NULL, 'Nederländerna', 'NED', 'F', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(66, NULL, 'Japan', 'JPN', 'F', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(67, NULL, 'Tunisien', 'TUN', 'F', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(68, NULL, 'Play-off UEFA C', 'TBD', 'F', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(69, NULL, 'Belgien', 'BEL', 'G', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(70, NULL, 'Egypten', 'EGY', 'G', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(71, NULL, 'Iran', 'IRN', 'G', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(72, NULL, 'Nya Zeeland', 'NZL', 'G', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(73, NULL, 'Spanien', 'ESP', 'H', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(74, NULL, 'Uruguay', 'URU', 'H', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(75, NULL, 'Saudiarabien', 'KSA', 'H', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(76, NULL, 'Kap Verde', 'CPV', 'H', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(77, NULL, 'Frankrike', 'FRA', 'I', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(78, NULL, 'Senegal', 'SEN', 'I', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(79, NULL, 'Norge', 'NOR', 'I', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(80, NULL, 'Play-off AFC/CAF', 'TBD', 'I', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(81, NULL, 'Argentina', 'ARG', 'J', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(82, NULL, 'Algeriet', 'ALG', 'J', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(83, NULL, 'Österrike', 'AUT', 'J', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(84, NULL, 'Jordanien', 'JOR', 'J', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(85, NULL, 'Portugal', 'POR', 'K', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(86, NULL, 'Colombia', 'COL', 'K', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(87, NULL, 'Uzbekistan', 'UZB', 'K', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(88, NULL, 'Play-off CONCACAF/OFC', 'TBD', 'K', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(89, NULL, 'England', 'ENG', 'L', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(90, NULL, 'Kroatien', 'CRO', 'L', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(91, NULL, 'Ghana', 'GHA', 'L', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33'),
(92, NULL, 'Panama', 'PAN', 'L', NULL, '2026-01-05 22:54:33', '2026-01-05 22:54:33');

-- --------------------------------------------------------

--
-- Tabellstruktur `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `image_url` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `allow_tag_notifications` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `users`
--

INSERT INTO `users` (`id`, `username`, `name`, `email`, `password_hash`, `password`, `role`, `image_url`, `created_at`, `updated_at`, `allow_tag_notifications`) VALUES
(1, 'Adminen', 'Claes Fälth', 'claes@familjenfalth.se', '$2y$10$9V7izLgiiMFH17rSZRGxge/I2t4HgrEuNVegl2Epcae5MB9hVtDiu', '$2y$10$9V7izLgiiMFH17rSZRGxge/I2t4HgrEuNVegl2Epcae5MB9hVtDiu', 'admin', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAGQAXoDASIAAhEBAxEB/8QAHAAAAQUBAQEAAAAAAAAAAAAABAACAwUGAQcI/8QAOhAAAgICAQMDAwIEBQMEAgMAAQIAAwQRIQUSMRNBUQYiYTJxFCOBkRVCUqGxYsHRBxYz8CThQ3KC/8QAGgEAAwEBAQEAAAAAAAAAAAAAAAECAwQFBv/EACYRAQEAAgICAgICAwEBAAAAAAABAhEDIRIxBEETUSJhBRQycUL/2gAMAwEAAhEDEQA/APqmKKKARXVBl8StvxgSftlvOFQfIlTLQZXK6eXOgm4PT0wpYCFmw9JN71Oeim96EflCsB9OxzWoJlhEAANCKTbs4U46hhoidnHOlJiDM9fxF7G0BPO8+oJewM9D69kABuZ531eweqTubWJVd6AWgyzwHOxoyjyL+eDCOnZJNgG5leqVrZY1pGtS26fYTYDKTp571G5oOnAbE0nZVq8Ft1CEwXAGkhUjL2rH0UUUUlRRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRTiMGGwZ2AKKKKAKKKKAKKKKAKQ5bdtRk0D6iCatCVj3SrFfUGWAWE8+61kaJO5u+t4xdmJ3MT1rDJU6E1qGZbJLvoS36UdEE+YBj4YNxWxgm/BI43+YZUHot7XGmEwy9q02nTbQFE0fS2LOPiYfp2TxNf0a4krLxyFjcYX/wAcJgnT23VIOp9bwOmg/wAVeqsP8o5MWXs8fSynCwA2SAJ511X/ANQdkrhBEBPBP3Eykf6k6hkITfexVv6CSuY16jldZ6fig+tk1rrzz4gq/U/S2325Hd+wJnl/r49lodwtjk+Ws4EE6p1A0KBSK137jyYK8Y9dt+o+m1rs3Ek+FA5Mkxut4lwG3CEjfaTyJ4KM3Ka4MGJ35OvAm06Bk3vQGJ0fGhwYZdCYSvUB1DHYgLYDuK/MrrQkuEAG+4+BM1jhcceszMzke/gQivqD2MAaa/T8E68yPNX44vMfOqtXhwT+PeFBgfEz1gxKgbAwpPng+YP/AO48LHYK7Ekcd0JmLx/pqopV4PVcXN16N3PwTD/WAIDcfmVuM7jYlikYuQ+8kBB8GNJRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQBRRRQCj6Pneqq8y8B2NzB/TWT/LXZmzx71KDZmmWO5tONEiKQnIQHzHV2B5HjT3EkUUURlFFFAFB8vlYRI7V7hHj7LL0yfVKe7fEyfU8Xe+J6Hm0Ag8TOdSx1AOhzN7NxDzbNxiHOhG1dtqrTd+sf8Axv8AH4P4l31PFZnIRfu+JVNhWbPeACDo/wDE58l4zaXAJQkaPdvWpqulZddK91rBQPmZi5hSqshBs1pmP/P9pA+QrpprNIBzzrcmZarSYNb1T61tStqenr27H6/gfMyGTZdmL6uRZwxP3MSSfyIOcqrfaiKB/qaQ322WEFKyy+3b4lXK1cxkE4i0VP3VI1jEaJPMLfFrtUetTZv5LbP+8pLM26gDtTTfCzmP1q1re137R+/MNUbWNvS/V5rZ1cf5e7idxcW1S3r1q1a8/dzIrrL3T1arSR8+0P6S1t1oSwbDcQ3T0ZZQvb/E4wII/UDxoS0bIbExK7MdWdO3ZA9obg4ddjlXP2jYMcaUFNyVrtPAi2ej+jZtmRUtuTYDWTsKfiWH+KpWzBBx7blD06kVVEaJAOufaWmJVStZdtn358mTZDlD5uVl3t/Lr9Qn2MGPRs/OuL2nt17CWa559QipAqjjj5ktX8db3Wu6onsBxF6MH0/pdmHd3WXOuvGjNjg9RU1KjXFyOPumYwc2yy5lWoO29dx8CW2NT3WD1WrG/YeZNNepdSdhjrfuIRQz44Us3cn/AGlKakxybPvUe3O5OOrU49I9a3u17EcxTLQyx20FF3qdx41vj8yYcygp6jj2sPTbtDDj2lti5K2KoJHd+/maY576YZYWdiYoopbMooooAooooAooooAooooAooooAooooB419PdT0ifdNthdQDIPuniHRc61SqjZm+6Vk3Mq+ZvjWdegV5Ac+YZTeoI0ZlcdrmA8ywoNikEky7Nk1NVoYSXcpcW88bMs6bO4fmY5YaVMk8U5OzNZThE7FABciruBlD1DG4PE0zDYlT1EKiM7eANmbYZb6RYwnV3Wil7D+pfb8zH5nUwO8t7HQHyZZfW2eVH27051r218/wBf+0wGdlWnaoG+BoczDOfydHHOhWX1ax3ZR9+/P/34irttYA+Sf9oDi47E+pcNIvtCm6h2gilNEfI8xaWmstvUDevxIlz7637VYnfmCWZF1zDvGhv2hdNfcukT921K/wDSqRrQxJZiGPxGYuGrt6oYnfkH2lhTj1qgL6O/aSN6FS/bsCPeiQV5Bx1eth9jf7S0+mc2xQVuI7QdBpQZ91ZsTtDa8GGV5IxyAF+0jiFm4cauq4i5kR+Cd8GHNnoAa04IX+5mawMkCjv/AMxnP43hm/zE6EWi20tWTXj0b/VrmdTLZ8dmI0WOgZQi02Y68+TJrcpiyVrwiCGji0N9dOwm2b2/eWuNg5t+Ivq2+mLOT+BKPAZPX7219vIlpn9RPYgFh2fIEmw5VxhYtOMBWjmz8/JhVVIx2awgBvb3mZXMtIC1HWh+qFUPfoF2Zh+TM7FytJRkrcR3lU17tIL3wSXDugDHngbMrPWyzqupa137+YZjdNT0/UuX1bP9WtARWHKl7qFG0exdeNjiF4WVUx7BaDr2J95HXh0tRolt+OPEr7eiA5KOtrL2HevYxG0FHULK8r+ZYXq3o8+JfqwYbBBEzDUV1J33EdhHOvn9oX0TLSoGguWXf2sf+NTTDLfVY8mH3F7FEDuKaMCiiigCiiigCiiigCiii3AFFFuLcA+cfpzBVUUsOfzN90ilAFGhM30/BdGAB4mq6bSya3N8Ue2gorXtGgJK6kL4jMUjtEKsKhJrC0HpfmWuM/iUzXKpklOYAfMmzfRNIpGo6U6Z4Cj7pJXngn9UxvHVeS0ig1WUre8nDqfBkWWK26x0CTMf1rq9S5FuMzgrYCgYH9PEsPrLrP8AhHSbr1YBgpA43ueH531K2c17luS3cN+R4/7w349rxx8j/q3KW21EsKhqQFbQ+Rv/AMzK3XpVdve+7RGhwJzq/UGyC2yCSByPcD/6IAvfYF5ivfbWdDmzCx5bYkLWF3GiRI3UKux5kS7YDR4JhCWdVi1kaHcYb/iXpJrQ38SprUr+nZ17xOGI2SNw9gc3VWc8Jo/MLpzlfhl8+8pRWw5Y+YRTWeOxufiVolneqNUTGLaLahWTyPeM+9QD8e0gyK/VT1Kzpx7CKKo9ch8cKDysmryarOPB3uVVd/cnZdv941WNdh349pUJrKbB2gb8cyKy9mtOvG4Dj2k0g741CKSFQd3vJMYuQ3HbxCqLvG+TK1GI4kyWhWAOl1JptDVlFdBQNmWFDPw1lg/YzIr1EC0JXtm35+IfVlOSGPgSLKptcR02oVu5j5/EtXcBGTuHjwPeYbFzLmfj7V/Es68y97B9h/eTTaahLFp13Ku/HPiLGrtf1D63C+fzAcPJFxWttqP80sasiqksmOndvyfaTYqU6mlsm21WOwoAUb43IsWnttAYbuVu37T7fP7xuPZkLcrMVUMx4jekX9uQ4s0WawgfiKBoMK/Q7O7vP+39JYKdiVS1hbC1fsd6/EKS0qe1vM6MLuOXkmruDIo1G2I7cbPZRTm53YgZRaiigCnJ2cJ1AFFFvcUCeS4jKGHtLavMRVmfobuXYkeQ9ij7ROiFpqF6iqne9R1nVAV/VMFfnZCHXaZLRk22r92xF56Q0uT1QA/qg6dW+79UorsW+39JMfVgXKNEmLyuz00LdY0v6pyjrZZuGlAcKwnkmT42EUcGG6Wq22B1B3A14lumYVXZOj+ZQdHo7iqbC79zLrqdC04fc3cWA19vG4ZZzH2vHC15r/6jdTOVY1T2sF+fb+08yzaTjVr6Z2efuJnoX1Ngsz2HJsdDvQXQ+efyZgOrXrfewRSK6yQPzqc9u66sZqBcLD9cs1h/y7H7wi/GOOvaPJ5kWHay0q5GgSeIRm2swXR3oRjYIksNHgRAenyBvUjrYknu+ZLsb5jL2ie2w8eBGkliANya2vv8HUjClQCTv8whWHobQvawOjHIz0tsntktbjWiYsig2JtSY9ksMXqKOoSzXd8yS9Aq99Z8+dSiWuxAD27h2NnqB2WAj94WfpUv7OKkqSCDJxWfsOtgiOVK35rbzJ6yPT7R5j2WktR1Tr4klz9oU74AkKaAO4n+8aB8RVUFUZH2k+8Guayyw6Y8xKAgI94lcHevMRrPFVKKe1QC7DkwrGZn2AdIPcytwzuzTHcsu3uZVU6WTaci4xbeysdnJPG5bY72N2hQWb2lPSqola+wEIXNsrOqR495mel+KjsBmAb4EOxkckItgA99TH0Pl5FwPqFK98mX2DkNU/bUC59jFTaDtKOXscdqjgSHAVRnBzwAS0HBYKHtO9jx8Tq5A1Y1fHaQpk1UaXGLCy0eQCCPwJPds6YcH8wGizuRip+4L5+YXaRZh9297G5eGWmHJifXfxrceLvzKOrKPdp+GBhJu2uwZ2ySxyUfbfr3jKsob5Mq78g6g38SVPMLqBp0yFMl9VdeZl6s078wg52l8yfGU/Jd25KqIG2WC3mUmT1Dg/dKo9U/ma3HJIVybei/Z8wnvEzXTssvrmXIsOhzHcBK8ax7Lqn7WB1LvFrFq8iHW9MBbgQvDwO32hJoRVv0pbOe0SanpKj/ACzSU0DQBEL/AIdAntuPxivTM14A7/0iT2YA7f0y4FIDSY1DsjkLbJW4vax4kSoA4l9nUHRIEzeS5SzmK9C1o+mnt5AhebnpTjkOdn5MpOnZtaqVtbn2lX9U3GrEJ7j93AG+BOfl1k246zP1N1QZd17L3AVggb/M8+VDYLCdkO29fEusjKLV3g8dx1uUptavIYgfZwB+NyMWwo1KttHb+lN7/YwbJcC9qQPB4Mlqftc78GNyqO7L7xvmVE+wxqYEj+s6qkvseYc6dxU/0iFBGyOIbVoIGYE7EkQKeDwZNk067SR59530CUBI3Fs9F/DI6gg6InaletwvkGKtHCbG+JLRZ4DDmPZaNJ05DJ/WSLTRdxoBpOVV+CI1qBvYi8j8UFmM1Cdy+JNRryPeNFrAFHG1ja1KsQP0nxHKVhzuxY68QrFA9IsZDSnd3g+8mxF4ZI9iRwL3sd/McqAcAcCTJX2PzOpouQPEW1SJMSvsHceSZZ11lgDyJBjJobPtCqe528HUztVIPoAVQCdkwupGJCqBqDY6EaOocG7V48yTTWla6VrQck8kSw6VcE9QBRs8CVHnkmEYxbuBB1+YtjTQfxNa2BCN68xtih8exkXRsbwIPTSOwMTsn3hiWCs1oNESaFjhF0Ve/wAMoH/mW+B2vitWfKkiVqAtiuxOyu9SLE6iBcKxwCRuGN1U54+UQ9Ur9O0toA++pFRkbGtyx61WtyFgBvUoEUo3mdnHenFyTVWTfdB8hOJNj7I5ncgcTXSIrWf0xvcFsymY6BMIy9CAKv37mdFhl9r9p5MrldvW5Mt3UMsAurAeHiLGh6RdoLzL8ZA0OZjcK/09DcsxmceZvL0lcW4/ax4nEULLJwHEEtr1D2ZjuAILblkHW4+46BlPlW6eKmuKbg/vLCsdyzN4Vx7hNLgNtRuEogbNp+wzOZuISrDWx55m0yEDLKnIpA9or3B9sZ/BMU7lB7l9pS9be11NRB445+ZusoLWCxU7/fUyH1C7PyUIUcic+fTfBiL8Xx9v2qSST7yjuZWtf/Qh8/Jmg61kNXQVr/UZj73YKF7tnu2TIxbVZJWjqjpzzzD66wx3r2gnTR/+Gh+eZb4lY9AH5ELdCQNXUCGOvHMcKiF15BhWPX/KYmdXRIi2qA7KwQVI/aTY9W15EkdA1oYDiEBe0cSdq0HWhdHjmQ24Y4KjRlnWvfr5kxoJXeo5TVQr1qRuADseJY20HUCddcMItiRAyo0H7+wlWHiS5CFNOviNasXJsfqjlK4pcJgziGqoTI2PBldRU9b70YT6hLR2iY0Rc43xGYykuPzJMXGe0twZZYGEVs+4Sdr8RGLjFlGxLXHxVUDiS41AAHELCgRlpGlIA8RtwAGh5hGwJDYvcdxWjQcgk8+JLj2lWAPiJgAsZWNgmQdXC5KmsAHmcpsLXLoyn9Uq0Mwn03cTFS011Fnbjt9w5GpSnurzGfmMGZ9vbvk8x9VosU78kyQ0yp6/TEd/1ESlsr1YQfYzRYerOmDsPtKHLGrSdjfuB7Ts4b1pxc03dp8YaGo3MYdp15jKnAEhyrd7nRWKsyiSTswZTJsk7Jge9HgzMC1biBZjgHcTXaBBMrcu/k8wt1BsQMjtPmS/xf5lE+Ts6E76zfmLyJ65Xk795OHDjUzONmb95Z0ZQ15m2OUoEZtYCnUz+ZWdy2yMoHyYBa6vHewjwE+4TS4Z0o1KHEGmEuqG7QISBYltjQHMGuQclzOi4AeYNkXK2y3IEWtGruosvbtG4HI/Ew/1BYCn3Elh52ZqOo5Rub0sfnf6m8ATIfUdYqQIDtvLGYcl224/bCfUWSQeyv8AUff4mYZtuFHPyfmXvXD3Me3yeB+0pmTscccgbmWLer3p/acZKx+oCWSHsr861xKDptp0rA++ofm3H0Bo8kyMquLJLtYjDejBsfID5ACne5W35ugyj3Gozp14r5PJkqi8e8A9sIrY2AfiVNO7HLS3w0IHMUVofj160YcijUHoHAhKHXEuFox6gfaB3YncfEtF1uO7QYxOmcvxTogjiBY2My5BX23NTfWIBj4xOUx1xJVO0bYe02BzIaenu1h+3iaGqoAcwitFHIAj0JdBMHE9JeRD66gH8RyePEcDzAe068CdLcSLu34i3xDYPJjO4xoMTakh1vzG7A8RpaNBgRGvuMJqHYDzIq/MmYbU6iJEb/vJheNcPt/MqMglGJjqLyWXRkCx6P8AT1wbHKb4+JX9bb08hu09rk71Ivp+8KQd+2of9S1JZQrkadRvY+JvxXtz8uKmov1wx5jci0cwEOQeT4jL7vtnXtxuZF2z5kHcNSuycn7/ADBjmc+Zn5AZk26JlXlOW4kj5Af3gxbufUm3YMSsybtMIqr2BJfSlTEC8TqHA5lpT1D7fMxWNdr3hgyyo4M5uLmVpqbOobPmKnLBbzMjZnkHzDMLL2RszpnLC03OJcutw3+KAHmZWjNAXzH2dQ48zSckJpGzhr9UDyMzvBG+PcTN29T1vmB2dRU+W3+IsuSCdr/Iywg0PPt8TK/UjMaPYsfMlr6j3Ow8gD+0HzmF1evmYXLbfDqsVk1Efe39JS5jFSdfqYbml6kv6gP6TOZNZLb9/EiOg7Cf06V353CrnLVgb8Sv2VENB7qm/YGTTgJwQx53CcNCzcRCvVg7vBll0+n+aPzJta4rDBq0NES3oUACDU1ga4hacCOHexK6HiTBoKrR4eVsQUrSVXgqtJFMBpOQGMcihfEhU8yUHiIVKpjwZGDOAw2NCFbUcHg4McIGn7p3u3Ig3Ecp3FsJIjOgTutxBEZ1RHhNmS107PiIGKNCEVpsSSvHJHiEJjnXIgWlF1ZOxSRKnDu3Yo345ml6xRug8THYxKZTD8yaNdN90C0/afKjgzV9SVbekA9wDgfaT/xMf0TVdaP59zNpWFsw2r13AqGHPvKxuqxzm4wVzaYjWiPIgWTcQNSz6n2+q2vIOt61/eVGQB7zsmW44cpqqTPyCjwL1tjzDOoUhydSratl3M7vaE4u0fMlx7d2QBaXY8GF11MgBh2cXuO47JL3iVVFx8bhffNJkajBKiL1WjiuxGldTyONoadsYXjOVAgw4Mf36mt5NCrMZZUcGRXZra8yuNkY7bEc5rU2JL81t+YOMok+YPdzBW2p3HM6cxX38QtdWuQdbP5hFVqtWCzHZPMz3rtpSDttcn+sLxbNqCfY+PkyvyNpDeuqULMp8zPWLvt/E1HVU76N/Ez9q63vjmay7aRXMvPbCW/lkj2A1IW5v88gyXIYa8wqoIpQW1CWuJV2FT7yt6fo9ol3WBoSa1gtG8SZTBaz7QisR7Gkwjl5nFEkUcwM9TqSLGKpMmVd+YGco3HqNRKuo+Fpug6Ebvmd3OGIHbkitId8zvdAJwdx6fvIFbiPDRGKU7EkXxBkeSq0AnQcwugc+ICjcwqi2BLvEoFgHiHNh/aOJWYOQFYTR41qW16i0nK6ZrqeN/IfjwJgbKuzMYgfmesZ9AethryJ57lYpGdojXOpNVO1t0sn0VAI5mm6TkHtC7H2nREzWPUUA8eNESzw7uzKVWPJH942dgL6nqWjOZ1Gq7Dsf9J9/wCnvM/dySJefVNwN5V+Co0Qfg+D/v8A7TO1X7XtOiPb8Tp48nDyzVQ3VBoI2J3e0thpo8VqRwJvJKxVFWJ2+0VtOt8S7FICyC+kaleHRxSJUQ/EMCcQhaBviS+h+JMw0GXQyXQIgdVh1Jw3HM8mTUausJEzTr2cSB3Ext3SO7o1m4kDWcxvqblSA5zuD2HckZpCzczSdGYNgywxWBZB7LK/u5hFD6HB5jPeltee/Hb486mfuXkjXgmXVL+pWVlZfr1m52Z04+muF3FPcnbYXEgdibu0wrIbY1/1EmDFQbQ/4jrSDenWaeXtTbEz2AhW3cvaATr8yLW2MGJvYEKqgi+IVRyYGMrHiEqnHiQ0jcOReIy0iCyQDUeBxzGtwYKO3ETI2aMLwNKWE4WkBsi9SATeYlOpCLR8xepzzACg073gQfvGpG1sQHCwSVbeJU+tqPruJPmGguK7NmF074lRRdrW4bVkAHzHpO11jryNmXeCGUfaeJmKckaGmlt0/qYQ9rGGhto9MRzM51bB1lqwHDGaTDyEvrGiNyDqeMSAdcgybE45d6ZV1KNsfPiH4PZZlJ3HjXmN6zjmmvvTzwZXZGQKMUWqdcyYfju6WWf0C3qmZYy5lSIy6VW2SD+/xzMZ1LCv6ZnPjZahbByCDsMPkGEZf1V/DDVbFn9gIN1Hqx6t02m64aurcr/Qjf8A2jnNJdfZc/wsseO8v0VFohlb78SkquC+8LpyR53OjDmjzLFtv2nWrLjxBsN/VfZ8S7rVe0cTqmfRSbV1GKe7xCv4X8SyqrXWwI/Sx+R+Lx6o6HMkNkD75z1OZ42c6aCXbiQMxne/fvI7G4nPJ2lFZYJAbtHgxt5gRY906MYFh62x5jS24KhMlUmVo0hedS3UgcxqMd/n2lSBe9Pc9tm/aVtxIcNr3MK6fxWysQNDf9deP+YJk+Afzuaz03450rrzoN8kyJG+8fGpzIY9538xVfcI9tpFpiL3HYGpdUp9olb0xdqDqXdaAASGs6NVdQvHXiRBeeYTQscFGU8ahSmDV/mEK6geZUg2l1I3EY1w+ZBblog5YQGz7NiCW2ESG7qNY95W5HUlPgxKkqwbI0eZz+J3KVs7fvOpkgnzFs9Lyq2Sh9ytx7CRDquY4Npwx1IbXIEkIOoJkhtHULSMORpuTF/Hoh8yly7ijEA8ysyckoOSSfiE2NRrv8YrX3iPWgf0zFLZk2foTiC5mTmY7AMdbmkwtZ3PCPQk6xZvhpY4nViSNtPIk6nlltBzLbCz8zgnZ/EWWNi8cscvT3XoHVtuo7pvq2XKxgdbbU+efp7rDLegc6O+Z7h9M5y3Y1TA72NSZUcuFnZvXaO7Bc65Ew/V+5ul2Ip0Ro+w4+Z6H1kf/jXD/pnnXUHDVjXjev8AYzPKaquLvVYVl/mdwYHu50DvX4lpb/LpppA12jub9z/+tQTp1CvnMzcU17Y/sJK797szHknc48Z/K5V6H+Y5/Hjx4cXGYiOpuO9SJiDI+7tOxNZl2+crS9Ms5A3L+qzgTG4GV2sOZoKMxOzZYTt4+To4v0tAUcxesPmZ5+qoG5bQnP8AFqv9c0/IHnDPxGd8hZjrxGDe/M4cqdooOZxnOpGp15jbH4kyEiueCk/dH2NsyIzaQaE1EGTqAYLS0IBho3XWWHR+mreTbcSKgdfBP7f+YATsSe7OvowqxRoAbBiyvjNt/j8U5c/GtFZhYtdZNFQRm8kMT/yZmeohq7SNfbuR43W8oN22BXX+xk2ZetwXuBXfzCZbehlwTDpU5Clm/wD7eJHj7D6MLsTu/Sd6PEVdOlLa53K257NVfdJrBqBlxWo1qVvR11QAZZoYKJlk9Q0I0jiRdxlxNFNboeYNbklfeQ32dq7Mo+odUSkN3MI7V4za1uzDyO6BXXg+X/3mWyetPYxFIP7wbvyshtFiNwktFymLSXZFY82D+8CfJpJ4sH95mMqnJF5UlyIMMPKLkhX1L/F+6zvPZeo2AYMNo25PjOe7RmY6ZblYlgF6t2H5mpx6i+nXweZGWOmky8ovMPwDLTGrJ5+ZW9O8AGXuMviSZ608QLqFXZUxl7Ug0IJ1OnuQiIRgb1Ys7N7QLGpN1pLITzxNVlYyBD3LxAVeqvhAAJWN0vWyxcQ6H2aizeiDNZCw1qGY2Yq8HUNXqCAe00/JpneGfpX4P0xi1EMygn8y5r6FjMOFEFPVK1MJx+q9x0oJmeWeznHZ6SVfSxNgegbM3/0pTdh0Cu1QNeJnukdQsR13oCbDEyK3UMpGzI2Mt3qi/qC70+n3WE6+wmeZV5q5N9a18qfP/mbf60uKfTGWwPPp6H955b9Nq3r8+Ne8jKtvj8UuNyv0TEY+BYBw9j6/oOf/ABBA/E51PID3diH+XXwPyfc/3g9ZJmNmo4Pmc35uW5QQW4jT+8YW1G+pJkcqUOU8TrZTgaDGCtad6jHs0JpLYnQhrmbkkxnqn5g3q7ne8SvKnIBLAnUQUE7kY5MkU6mdqdusvEGtOtwhm4+IHkPHjT2Hd+ZwPInbmcUzcbFo+pKLfzBAwEcW1DZ7GC38xy2r+l+UbzKxrCPBkf8AEEeY+r1VY53G+U9rpMFhZsaK+QR7wrOxvUpTtHOpH0bOS7F9I/8AyV+3yJa47qyHY4Ezk109mcn5MZmpMfEtVG7huS0APW4A8Gd6z1P0FKUAdxlH07KspuYsSe7ZMtGWFym2y6adKRLBG5lJ0vKDj4Ye0tq35jY/YxWBGpGx1sxKROle/iVsaUvVck9pWrZP4lTR0KzMf1MknnwJsa8GoHuYAkRW9tfgRRpL9RSUfTeNWAWA3Cx0nFTxrcJZ+4eYOx1z3SvI9U3/AA/FQ7Kqf6Qa9K14RFA/aTM3d7yM1Fj7w86cwnuhf4euzhkBhtWOKqwAOPaE4uLobMK9HZ8Q2nxmw+NWVO5cYx8bkNVOh4kyDtiC0obiduT1FMixieIWFiJT5GLvyOJSZvRyxLVcfibGxAZA1GvEnelysG/T8lDrRiXDyPB3N16CnyI8YaH/ACiNflWMo6c5O3BMvMDBWsA9o3LtcFfgR5pCD9MCt2jorA1LfBtKMAPErFP3CH4/kRVFF/Wdm/pOwe7sq/7zA4zfwnTMq4cMF0P3PH/ebz6xdaPpRLXG19YA/wC88y6nmFqEpHHce8j8e3/eTkf5Zx8FV++7kySviQ9wj0MzsePs99k8REECPTzH9m4Q7Q2iTIL/ADLA16G4Lao5MNkEWLZnSeYuJZhF2ZIonUXiSKJhahC+9QS6stLMpxxImr/EeNCnejUjKalrdV+IHYk6JQE3OMTqSlJzt35EBsHY5BkZeFW1fiCOmjKxoS0XvTar1nTDxNd03KXJxPUXgnhh8GYwS5+nsgVXtU50tnj948nV8bkuOXjfVO6iu79mMox+88CWebi9zdyjiMpXsIBmcnb1/c6Oxazj2oR86P7S8qOmMBqoJHew2PaFpvQ3xqW5s59i0fmEI3giAg8yUWcaENpg82bHmQWIXHyYxGhVJH9YNJ0q7UsHhTIxXa3HYZokRW8gSVaU3wBEryZ6nDtZhpSJY0YBUbfzLhK1A8RMo1GnewPo6GgI5axJLXCjcCOYvqdoMNlf6FE6j0GzI6yG8wmtY0SiqF8QxU3BauPMPp0QIKR21ELsSqvzVqftc6M0Fq/ypmPqDpr30F6uHXmTkMffYynLrbWyOYali+RPOcbqL02+naTtTNFh9UDqPuila3Fq63G4VUldvDamcpzQeQYZXmEHYMe02L0dKpYbRuZNVh9p0ZXY2eQBzLXHy1fW5NTpH9U0Cz6SzFKBzSBaqnwSJ4lba9ljPYdux2TPoBlTJxbqG5W1CpH7ifP2UhovtqcaZGKn+kV7cfyd6hu4+tyOII1k6tpi04lpU0JRhKym6ELdr3kXZ7GWOCIJbyJxrtxjuNReilDkcxm5Ixke5pKvboEdrU7FMIzSLF2jUjDaMkU7j0ENycQC8aljdv2gF9bNuaY2mDPJj1TYnVoYNCFQqOY7SBW18QN6zvmWrruD2Vgxymr/AEuYRTXogjzEU0YRSsrLLo1zi5YNQFo/rCmbEVQ7sp99SsoA95LZiY9y6dNH5U6mc5pOq7uP5WprJcYudi5KdoYAr7SYqh5BEz1HT0ptDVn+0sbLVWsKvBE2xylm46PLHL/mjQJKibkVDeoit/qG4XWNQKHVVE+0MooJ0YqNcQ6sDW49K24lB4hNdKpz7xKwAkVmQPYwObTM4AgeRkhQeYNk5XaDzKDqfUe1SS0na5in6p1QJsAybpGP6tfqsdk8zC5GRblX7G+3c3fQMlRhoGPIEqY/tOV+otNFCBDcdgRzK++9fO+J2rMTXBEaZF2uu2TUWBT5lC3UFUeZD/iwU/qi2uY1tKbUdNExlvpgEEgzGWdeFfhv95JX1oOnDbP4gm467ZX6xxvR6lYaeB5lX07qLKe1joiaTqdZynaxhsmZXqGIabO9YaXjk1GHn92tmW1OYCBzMFiZRGhuW+PlnjmTZpfttaMwADmWmHncjmYinKPzDcXNKv5iRY9QwMruVTueOfW9X8N9TdQQDQNhcfseZ6H0bK7qvMwv/qPz9Suw/wA1aE/2hPbj+RN4Mox3HJGkRwjteeIRgJ026g5Oox3k62KKFmzJlfYlcrydLNRXE5BLtoQf1Iy67iDet+YTE7GiFQ14iNAMlU8RE8R/jg8QrVAeIkGo5zIweY/CQ5icw3GNWJKOY8AQ1IqQN6Q14jHqGocEBEhtXUfVFkVd9WvEHK/PmWFhHvB2QGTYzuOgLrH1yZ6CfEiGOwPEmzoC6TrUJU7gVII4MMqHEwyNMDoRjjvGjHzoXciZXHuKls9DcAduOg3vXzDlYQDH+2vUlaztE7Mctzb0eO3LGVZpaFAkyZXHmUZyOPMX8T+ZW2sxXpytDzBL8sAE75lccn7fMEuv2DzJtXjBOZmbHmZrPtN1naDCsm86PMCxh327MrGDK66E4mPoDiWFVj0L9slxKhrxCHo2PE0jO3QKzqzBdPuBP1Zg32mEZWJv2gD4HPAhqCZVM3V3K+YMOo2M3BM5/h7GG4fTQCNiHSvKo6vWyGG96mm6XidijfMixMQLrQlxSoRREnK0ratpKDqmNsnjiX9l6qJWZliMDzBOPTHZOK9Llk8RY+SVPJl1ZWH7gfBlJnY/pMxSHtp5aWuNlA+8ssd9sv5mVwe9nHmajDQqF3JotbHodvbWRMr9eXB/qGwAfoRVP9pf9HfbqoPk8zF/UOUMvq+VcvhnMWnJ8m6x0CH3Hc6SBIfUCiQvbuPxcOk7vIGY7kZbc6phrQkSIeZOG4kC6nWfiOdtscXL2kHfG22SDul+Kco2CZAMk9VT7wGsbEmVCROP8+kSn2MDIg3Me1Z1GheZN5rTjqsdx4J1OoBH6GpneSmha1k8SM3lhzCGQEQd6eeJePInekDnZkfdzJnTt9oM5AM6McpRsSmiJIFEFrsHzJ1s3LsVJKTqPidQ6nC24xjrxOfLEWaEqdyUGBI5B5k6vuY5YoGIdJG2ttfPiM7v5cjsYkTfjv8AF6Xx7vCBXvIciSVuSNwSxT3+ISo0k1nbe9H2W6EEsv8AzIsq/t2JXG/beZWhsVYS25NhJogmDC1VTmTU5KDXMqRNyaLGYKBDBYuudTOL1BFHLCRW9aROFOzGXtpLVRviQmlPkTLP1y5zqpCTIn6nmdwBBEa5i2CUoT7QquupDyyzD/x+X52Y0ZeZe+lLbi0rwnvbdjLpqc7ddRP1PHOwLAP6zA2U5hfTswMktwMmvsJdvu/MNJy8Z9tblZ1ZH22D+8z3U+rBD2o4LfvKi7GybMj063YKvlpJX0wl+dnXuY9Se2f/AILxuoW2Hj3hZre5dN7yPEwvSHc0s6dBeZOzQ49Ar1xzLGuzWoGzAGSUkswkqar6eOi9rDYUf8zmd0XpGcCzI+PawJL1n3/IPEDfIGLhpSjAWH7mJ9/xBTnOGcs5VAOSwOgZ63xuCfj/AJT2835GXnmGzvovJJ30/LpvB8K/2GZfJ6Z1PHyzj24OQLR/lCE7/bXma9uvt3ivHTvY8ByPP/8AkQ6rN6hevdZeKv8Apc+P6Ssvi4X0x7ZHF+mOr31d5x/SHHFrdpG/keRCD9KdVTxXW5+FsA3/AHmlbrGLjOV/ija/ghSSB/aL/wBxqpHbSx9gWYJv+5k/6WFLdjD5eNfh2GvJqepx7MNQWyzQnoLfUFeQoGTiY7oOO2y/u/r+kwRj0TKb+fhY6k7G679a/uBMr8Gz1Wn5Onn7vI+6brL+muj5VXdhZdlFnsHIZT/aVTfR2UGPbk4xXfB23P8AtM8vjck+k+W01TAiF1kaldW2oQrcTwcoIKZhImYEyJn0I0WDcUitiUPMIUbgSuIVU3ELNCJeziRsupKGBiOjFKLNg7q9iVmWCNy8sA1KrNUaM348k6UlljK3BMIxslvBO4PkJsztCEGdf0cq1W7Yj+4mQUgahVVL2nVaE/0merbqFckJbRktb8ywq6DkW626Lv8AMmu6GmGnfkZdYAGyB5mv+nzZf/LPyQ4tVuSe2pCxkVytVY1dgKup0QfaBf4/XRc1WOSKlbgjgkwvOza87tya/wBeu2wfn2M6b8C8XF5b7dXxeXWXjftGQI867NSANvUlDcTkj0aAyqO8mVeTjuhBUeDNAxBkbVq6kESwobEdkGoHfj5LjSMVM0teOpPaR4k/8GjDxHMtI8WBvxM+twe9jo+D4MtOl2r66LkVkd3BPsDNUcIFfG4Hf05Rz6f9pp5SnjhMkYrx6cusF10x1D+o4aVKLOO0eZUWdOqdge4gjxv2jMvFyr6/T/imK+Nbi00/DlPVadMSh8ZT9oUjcCw1xqsp1NtfB+ZnP8O6gUCfxFnYOAA0kx+jdrd91h378w0MeDL1tpOo5ONXfT26s2ee3mOyict6u0dqL4X3P7wGhKqtLQv3fMven4pC99nk/MW5FXimE3UNOEAmyBEmMF2dS27QBBcjhDqTldsZ7VWSwH2iQM+hoSXIGtn3gg2WkqSrs8mWeCUqrsybR/KpXvP5PsP6mBVVk8Tn1CzDEp6dQ2rLNW3H2Vfbc14sPPKRnyZeOO3cbqHrV23Ws6Dv2wCgA7/rBzZfnM3qE1443xvn/wC/mQ2fwmHVX3szFR9q/P8ASU/UupGxj/8Axof8gPJ/cz2PLTzv7q4PVacLvr6fSDZrRtY8D+v/AIlbn9YZrAb73yCAPJ+358TOZvUNcbH4AgDG6887VfgRef6Svcr6lsCmtX0vwo1Ku7rtz/aGcj94G1CpwOWMs+l9MDsCw2ZMuWVTvSLGu6jmOFprdj7EzS9N+nOr3IC+RTT89znf+0tOlYtdKgBNH3M0GKUGh7kTaYaLdUdP0r1Wsh6c+lm1oHuI0IQPpz6hAAGVj6HH/wAs0S2Kp/p8yT1h/qj0O2RXzJx4g9bQgcifHVcR2sRIe/nzJrV4gbcGVjDG1P8AmGV2aEqK7NGEpdFlicWYs37xwbcBSzfvCK2mdmlJX2VlblqTuWe+IHkje5XHe05KV155k1Kb9pKuO9twSsbYyxrbF6Yoa0i2749gZ6fBwZ8/WPplbpNg9MZlD2jtHsD7w4Pj43Fh5HgCZrP+oXuYhW4+BKrK6q7gFm5Pme3w/Hw4Z17Te2xzPqBK6yKuD8TH9Z63bkN2lyQPzKvIy2b3gTPsza5foJLrHQ+qPB8yfH6rbUCFP2sOdyDuDJ2nweJW2k0W9hP2t4Mypxu+m56ZdAZTyPIhwfcwfTcqyjNX0eVA+5fmbCjIW2sNW2wZ5XPwXC7np6fBz+c1fYsnRj1eC95945W0ZzOgWeCGEJqfYgdb9w0ZNXsH8QA9CCI5kUjnUhrPEczalSkEysJX2V4MrbcS6tjrZlyzRoPzFtrjyZYqTtyBwFMfXi32HnYEue9R8RG0ewhs/wA2VcwcRKdF+TLVbB4ErFsktVhJ4htnlbe6sfU2NCQXqdSfEqL8+0kyU0p3JqFFehZtRldHPiWBr2xM72BV/MZ7R0LXSGutIFdalmJ/Ew3VesvkZV1lfDO2+fA+N/0lz9Z9VXFxBgo+rLfusA89vsP+8wORlhV9te2p3fHw8Z5Vx8+feh9+Z2ksWLMf1M3mVV+Y1zlahs/PxB2NmU4HhYfjYq1L+Z1TdctpmPjc9z8sfJMIdlQaHJnXsCKYsLHsyLgQp2fAlyfpKXCxu9w1nn/iaPCrVBwOPmRYuJVjoDadt8Sd8rsTtX7QeOPea4zQG+v2Dzz8yROoL9o8GUdmQWP3SH19GVsNUvUBxydePMm/jz+Jk0ySPeS/xI+Y9ksUs5hdVkqEsIhdNo4nyFxXse7bEFsElDgiJwCIp0YMnRjlfU5aPiQFtS/ZLCqyHUHepT0MZZ478SMsVRYDkSCyosdR6HiVX1Dn/wANV6VbasbyfgS/i8F5uSYwsrqIM/qqY3dVits+Gb5mfyM13PJ3BbbdkmQF9+8+pwxnHjMcWKZrST54jGfY5kROzEToR7M8sJE7fd7ThP8AWRu3yIrRoQjb94P1IC2n7QdryI6th7RW6ivZhMLKNf6uDvzLfp/UHxQXH3JvkfIlIpWm77htD/tD0ZWXS+NSLJlNU5bLuNtTYl9NdtZ2jjYMmCzL/S/UVpyG6dktpLDulj7N7j+s1YBRu1xPK5ePwy09Li5PKbOr2DzDatMIMoBktZ7D+JjW21hUm/EZdUwjsd+RLJUW0DxuBKNu4HkbjPuPsZoP4QE8rzJUw191EamdWp28KZMmHax4UzSpjqv+UD+kmWkfAi0Geq6ba36tw+jp/brY5lylIA5j+1QPHiFARKhVXxA8xuNQzKsABlPfdt/MSaR0olZ1jqdPTsO3JuI7UHA/1H2EfnZtdFbM7BQBskmec9e6yvUrdBt0IftX5PzNuHiudZcnJ4RRdQz7+oZluRbsvY2//wBRY+KW5s5MMSpGHfsH9vaSLocbnpzGR59tvdNppFfOo620Kp9o224KDIsaizNuBI7aR7/Mv+on0lwabMy4HX2iaShExFAT9XuYJW9ePWEqAH5kNuQT7zSSYgbdkbY7grXbOt7gxsJGyZwNzuHkYgP8xhcbkTNxIy35hsCe+d9SCepxF6hhsl4rcSatyIJvRkiNPmLDWNTmTlzqBUvqEBuJNhmWHcGY8whzB2GzHAlpMscZvErqQRDqNiLKHFmjaGz4ExXWso5GZY7HjehNRmXelg2tvnWpishuSTPW/wAXxeONzv2jO96DOTuM/bzOs25H7+Z6iDx7Hc6Dz8xm+R5juNQNx9SBz7eJORscyFz+8VNxG1+8kJ2IOH7dgHgjRjlbYHMQQZKb595zEtKt2mEOAR+YI6FGBkmnzE7qw6bDKQQR7TZ/S/WV6vh+lkkLl1faf+ofMyNJFlRHzAPVs6fnJfS5Ug+RMOfimcacfJ4V6urGtu15N3BhKPpHWKep4+n0tyj7k9x+R+IctprP3HY+Z5tx1dX278ct9xY1XdjaMs8XLCkEkSgNgcbB5iTJ7TppOlytzTctqgjW5OhmQo6l2AaaHV9YAX9UFyNMSD50I4Mo95l26yP9cjs62oH6obPTVvkInkiC356KDzMjd1wH/NALurlvDcQ1aV1Gly88HYBlRl5649TO7Ae/MocvrCY9Ze19fiYvrPW7uosVBK0/HzNMOK5VhnyzFY9f+ojm2NTUd0+D/wBUqlXHfWwUJ91MrRV7qeY4M6Hmehx4+E1HDnnc7urVqrEANTBx8eDITe4YAowbxrUZitbkP9ngeTLatVqGz9zfJmsm0bQ4+IX02TsfCw17Qo7V0APYQZ7ffciZ9+8reiENcD7yM2fvBieeDJlI3wYbNOh+Y4kSMcCdB48xk6Ts6kbER3eVbYPIkLse7cAduc3IydGM7jEGoao/EkqqPxLE0TqUEe08DHBr4IqatgcQkU7ElrqPxCVTiVeM5gr3p/EZ6H4lk1e40VcxeCvAIlOvaTVpqFLTJVpj8If41J15/TwQvuxmRvJ1szT/AFW+iiD25mWvO1BntfGx8OORy5/9B97nTwIzejHE8TcnA35jgRwOdSMcRx48EaiM8k9p+ZEwJPEROvMR55/3gEFgO9gRgftMmcbkLpvmSaQnuGxGsQeG3GqxXyDozraIHHMAfUwSvQPO4zJrFtRJE4BxwY+sbVl355is2FfiZFmO62VMRZW2jr3H/ebbF6i9lSmthYp/oZgm+3LZf8rcSwwL3xtLb3LXv7djU5eTjmXuJzzzwm8K2f8AHGvllZR/tHr1Kqw9pYBpmmzCax/MXRB/4/8AMAvyWKkBioJ3xwfA/wDEy/Bv0vi+XyZe42rZGv0tsSF81h7mYgdRyK/0WnX5ki9Zyjx9p/eReCuyfIjWtnv8mRtnv8mZhuq3/wClZC/UMhxwdftHOGi8/wDbTWZ2gS7AD8mAZPW1QEU/e3z7SgY2WH72JnVqJmmPDPtllzW+kmTlW5VndaxPwJGNyQVak1WP3tpRN8cddRjbb7QLv2h+Lhu/3XHSfHuZPRj108kAsJMX3uaTHRHqUrTtrXtEistjWb5kDsTGEhs/M4CT4kfdz4kiQNKg2PEmQCMTxHBtGNJ7HX7RpeNYkiMJPvAOs35jC84xkZiB5O43unNzkA9TCDcd2ge0W5zZM8SV6Fxh6nUeG41ItnUesvaNHbi8zmtx6ASbVw9BxJNRqiPP6TI32vTD/UdvqZdvwOJQWN/LG5adVJOVkA/6jKhz/LG/me/h/wAx5d91Gdbjvb9ow+Z0cr4lgjxOb3OMYlMVBE/icJ8fEWhz5iJC615itGjGPAnBrXvOsI0+OIjPIBEjKDU7s+3gxhO4j0RUx9I03nyJCWI1Eln85dHjeotjRtWH/FdSC6+xR3N7cSfrZAvx6h/l2xEJrsqwLaLL9g3MSW14AHj+5keYVfINw4awb/IT2H9fMWvpF7uwbUrTa53sb+38QS6zZ0OT8STLtPtIKxr7j5kW/UXJp1KtjbR4TXid7vmOLL2+/duGoHBXHBBGlwDEHLHQBj0EqqBHAc6Aj6aGblzoQxFRB9o5+ZUg2gqxy3L8D4hIAQaXQjS8azj5j9BIXAHMiazXiRs+5Ezf3gaV7NxoOzGA7jwPzAHqvMmQaEYn4koEaT18RExreJyAOJOo0mIn4jGMATESMmdJ3GHUQIkzm5w8xvdA9P/Z', '2025-06-17 19:59:30', '2025-07-04 19:15:55', 1),
(8, 'Pelle_A', 'Per Andersson', 'pelleason67@gmail.com', '$2y$10$igfFCdXanlgDkpYNtE1lGOD6ysAH1VQhDkezWng9be6exPC7/Lk2y', '$2y$10$igfFCdXanlgDkpYNtE1lGOD6ysAH1VQhDkezWng9be6exPC7/Lk2y', 'admin', NULL, '2025-06-29 18:05:25', '2025-07-01 13:11:03', 1),
(9, 'kenta', 'Kenta', 'kenta@familjenfalth.se', '$2y$10$jItnwZ9UdZbml56XBpD4puUg0RzRhCsiM6HNLbYAQ4mIBYmx4TBoe', '$2y$10$jItnwZ9UdZbml56XBpD4puUg0RzRhCsiM6HNLbYAQ4mIBYmx4TBoe', 'user', NULL, '2025-07-25 12:05:55', '2025-07-25 12:05:55', 1);

-- --------------------------------------------------------

--
-- Tabellstruktur `user_special_bets`
--

CREATE TABLE `user_special_bets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `special_bet_id` int(11) NOT NULL,
  `selected_option` varchar(255) NOT NULL COMMENT 'The option selected by user from available options',
  `points` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Index för dumpade tabeller
--

--
-- Index för tabell `bets`
--
ALTER TABLE `bets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_match` (`user_id`,`match_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_match_id` (`match_id`),
  ADD KEY `idx_points` (`points`),
  ADD KEY `idx_home_team_id` (`home_team_id`),
  ADD KEY `idx_away_team_id` (`away_team_id`);

--
-- Index för tabell `forum_posts`
--
ALTER TABLE `forum_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_title` (`title`);

--
-- Index för tabell `forum_replies`
--
ALTER TABLE `forum_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post_id` (`post_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Index för tabell `knockout_predictions`
--
ALTER TABLE `knockout_predictions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_round_team` (`user_id`,`round`,`team_id`),
  ADD KEY `idx_knockout_user_round` (`user_id`,`round`);

--
-- Index för tabell `knockout_scoring_config`
--
ALTER TABLE `knockout_scoring_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `match_type` (`match_type`),
  ADD KEY `idx_match_type` (`match_type`);

--
-- Index för tabell `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_matchTime` (`matchTime`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_matchType` (`matchType`),
  ADD KEY `idx_group` (`group`),
  ADD KEY `idx_home_team` (`home_team_id`),
  ADD KEY `idx_away_team` (`away_team_id`),
  ADD KEY `idx_matches_external_id` (`external_id`);

--
-- Index för tabell `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `token` (`token`);

--
-- Index för tabell `site_content`
--
ALTER TABLE `site_content`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `content_key` (`content_key`);

--
-- Index för tabell `special_bets`
--
ALTER TABLE `special_bets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Index för tabell `system_config`
--
ALTER TABLE `system_config`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `config_key` (`config_key`),
  ADD KEY `idx_config_key` (`config_key`);

--
-- Index för tabell `teams`
--
ALTER TABLE `teams`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_group` (`group`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_teams_external_id` (`external_id`);

--
-- Index för tabell `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_role` (`role`);

--
-- Index för tabell `user_special_bets`
--
ALTER TABLE `user_special_bets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_special_bet` (`user_id`,`special_bet_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_special_bet_id` (`special_bet_id`),
  ADD KEY `idx_points` (`points`);

--
-- AUTO_INCREMENT för dumpade tabeller
--

--
-- AUTO_INCREMENT för tabell `bets`
--
ALTER TABLE `bets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT för tabell `forum_posts`
--
ALTER TABLE `forum_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT för tabell `forum_replies`
--
ALTER TABLE `forum_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT för tabell `knockout_predictions`
--
ALTER TABLE `knockout_predictions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=278;

--
-- AUTO_INCREMENT för tabell `knockout_scoring_config`
--
ALTER TABLE `knockout_scoring_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT för tabell `matches`
--
ALTER TABLE `matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=156;

--
-- AUTO_INCREMENT för tabell `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT för tabell `site_content`
--
ALTER TABLE `site_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT för tabell `special_bets`
--
ALTER TABLE `special_bets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT för tabell `system_config`
--
ALTER TABLE `system_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT för tabell `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT för tabell `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT för tabell `user_special_bets`
--
ALTER TABLE `user_special_bets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Restriktioner för dumpade tabeller
--

--
-- Restriktioner för tabell `bets`
--
ALTER TABLE `bets`
  ADD CONSTRAINT `bets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bets_ibfk_2` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bets_ibfk_3` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bets_ibfk_4` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL;

--
-- Restriktioner för tabell `forum_posts`
--
ALTER TABLE `forum_posts`
  ADD CONSTRAINT `forum_posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restriktioner för tabell `forum_replies`
--
ALTER TABLE `forum_replies`
  ADD CONSTRAINT `forum_replies_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `forum_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `forum_replies_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restriktioner för tabell `matches`
--
ALTER TABLE `matches`
  ADD CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL;

--
-- Restriktioner för tabell `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `password_resets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
