-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Serverversion: 10.6.20-MariaDB-ubu2204
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

-- --------------------------------------------------------

--
-- Tabellstruktur `knockout_predictions`
--

CREATE TABLE `knockout_predictions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `round` varchar(32) NOT NULL,
  `team_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Tabellstruktur `knockout_scoring_config`
--

CREATE TABLE `knockout_scoring_config` (
  `id` int(11) NOT NULL,
  `match_type` enum('ROUND_OF_16','QUARTER_FINAL','SEMI_FINAL','FINAL','WINNER') NOT NULL,
  `points_per_correct_team` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `active` tinyint(1) DEFAULT 1,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `matchType` enum('GROUP','ROUND_OF_16','QUARTER_FINAL','SEMI_FINAL','FINAL') DEFAULT 'GROUP',
  `group` varchar(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `allowed_home_groups` varchar(255) DEFAULT NULL COMMENT 'Comma-separated list of groups (A,B,C,D) that can be selected for home team',
  `allowed_away_groups` varchar(255) DEFAULT NULL COMMENT 'Comma-separated list of groups (A,B,C,D) that can be selected for away team',
  `home_group_description` varchar(255) DEFAULT NULL COMMENT 'Description shown to users for home team selection (e.g., "Vinnare grupp A och B")',
  `away_group_description` varchar(255) DEFAULT NULL COMMENT 'Description shown to users for away team selection (e.g., "Vinnare grupp C och D")'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `forum_posts`
--
ALTER TABLE `forum_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `forum_replies`
--
ALTER TABLE `forum_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `knockout_predictions`
--
ALTER TABLE `knockout_predictions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `knockout_scoring_config`
--
ALTER TABLE `knockout_scoring_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `matches`
--
ALTER TABLE `matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `site_content`
--
ALTER TABLE `site_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `special_bets`
--
ALTER TABLE `special_bets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `system_config`
--
ALTER TABLE `system_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `user_special_bets`
--
ALTER TABLE `user_special_bets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
