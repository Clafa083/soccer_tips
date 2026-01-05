-- FIFA World Cup 2026 - Teams and Match Schedule
-- Generated for soccer_tips application
-- All times are in CEST (Swedish summer time)
-- Note: Some teams are still TBD from playoffs (marked as placeholders)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ========================================
-- TEAMS (48 teams in 12 groups A-L)
-- ========================================

-- Group A
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('Mexico', 'MEX', 'A', NULL),
('Sydafrika', 'RSA', 'A', NULL),
('Sydkorea', 'KOR', 'A', NULL),
('Play-off UEFA D', 'TBD', 'A', NULL);

-- Group B
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('Kanada', 'CAN', 'B', NULL),
('Schweiz', 'SUI', 'B', NULL),
('Qatar', 'QAT', 'B', NULL),
('Play-off UEFA A', 'TBD', 'B', NULL);

-- Group C
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('Brasilien', 'BRA', 'C', NULL),
('Marocko', 'MAR', 'C', NULL),
('Skottland', 'SCO', 'C', NULL),
('Haiti', 'HAI', 'C', NULL);

-- Group D
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('USA', 'USA', 'D', NULL),
('Paraguay', 'PAR', 'D', NULL),
('Australien', 'AUS', 'D', NULL),
('Play-off UEFA B', 'TBD', 'D', NULL);

-- Group E
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('Tyskland', 'GER', 'E', NULL),
('Ecuador', 'ECU', 'E', NULL),
('Elfenbenskusten', 'CIV', 'E', NULL),
('Curaçao', 'CUR', 'E', NULL);

-- Group F
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('Nederländerna', 'NED', 'F', NULL),
('Japan', 'JPN', 'F', NULL),
('Tunisien', 'TUN', 'F', NULL),
('Play-off UEFA C', 'TBD', 'F', NULL);

-- Group G
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('Belgien', 'BEL', 'G', NULL),
('Egypten', 'EGY', 'G', NULL),
('Iran', 'IRN', 'G', NULL),
('Nya Zeeland', 'NZL', 'G', NULL);

-- Group H
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('Spanien', 'ESP', 'H', NULL),
('Uruguay', 'URU', 'H', NULL),
('Saudiarabien', 'KSA', 'H', NULL),
('Kap Verde', 'CPV', 'H', NULL);

-- Group I
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('Frankrike', 'FRA', 'I', NULL),
('Senegal', 'SEN', 'I', NULL),
('Norge', 'NOR', 'I', NULL),
('Play-off AFC/CAF', 'TBD', 'I', NULL);

-- Group J
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('Argentina', 'ARG', 'J', NULL),
('Algeriet', 'ALG', 'J', NULL),
('Österrike', 'AUT', 'J', NULL),
('Jordanien', 'JOR', 'J', NULL);

-- Group K
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('Portugal', 'POR', 'K', NULL),
('Colombia', 'COL', 'K', NULL),
('Uzbekistan', 'UZB', 'K', NULL),
('Play-off CONCACAF/OFC', 'TBD', 'K', NULL);

-- Group L
INSERT INTO `teams` (`name`, `short_name`, `group`, `flag_url`) VALUES
('England', 'ENG', 'L', NULL),
('Kroatien', 'CRO', 'L', NULL),
('Ghana', 'GHA', 'L', NULL),
('Panama', 'PAN', 'L', NULL);

-- ========================================
-- GROUP STAGE MATCHES (72 matches)
-- Times converted from UK to CEST (+1 hour)
-- Uses subqueries to link teams by name
-- ========================================

-- Group A matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'Mexico'), (SELECT id FROM teams WHERE name = 'Sydafrika'), '2026-06-11 21:00:00', 'GROUP', 'A', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Sydkorea'), (SELECT id FROM teams WHERE name = 'Play-off UEFA D'), '2026-06-12 04:00:00', 'GROUP', 'A', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Play-off UEFA D'), (SELECT id FROM teams WHERE name = 'Sydafrika'), '2026-06-18 18:00:00', 'GROUP', 'A', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Mexico'), (SELECT id FROM teams WHERE name = 'Sydkorea'), '2026-06-19 03:00:00', 'GROUP', 'A', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Sydafrika'), (SELECT id FROM teams WHERE name = 'Sydkorea'), '2026-06-25 03:00:00', 'GROUP', 'A', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Play-off UEFA D'), (SELECT id FROM teams WHERE name = 'Mexico'), '2026-06-25 03:00:00', 'GROUP', 'A', 'scheduled');

-- Group B matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'Kanada'), (SELECT id FROM teams WHERE name = 'Play-off UEFA A'), '2026-06-12 21:00:00', 'GROUP', 'B', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Qatar'), (SELECT id FROM teams WHERE name = 'Schweiz'), '2026-06-13 21:00:00', 'GROUP', 'B', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Schweiz'), (SELECT id FROM teams WHERE name = 'Play-off UEFA A'), '2026-06-18 21:00:00', 'GROUP', 'B', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Kanada'), (SELECT id FROM teams WHERE name = 'Qatar'), '2026-06-19 00:00:00', 'GROUP', 'B', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Schweiz'), (SELECT id FROM teams WHERE name = 'Kanada'), '2026-06-24 21:00:00', 'GROUP', 'B', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Play-off UEFA A'), (SELECT id FROM teams WHERE name = 'Qatar'), '2026-06-24 21:00:00', 'GROUP', 'B', 'scheduled');

-- Group C matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'Brasilien'), (SELECT id FROM teams WHERE name = 'Marocko'), '2026-06-14 00:00:00', 'GROUP', 'C', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Haiti'), (SELECT id FROM teams WHERE name = 'Skottland'), '2026-06-14 03:00:00', 'GROUP', 'C', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Skottland'), (SELECT id FROM teams WHERE name = 'Marocko'), '2026-06-20 00:00:00', 'GROUP', 'C', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Brasilien'), (SELECT id FROM teams WHERE name = 'Haiti'), '2026-06-20 03:00:00', 'GROUP', 'C', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Marocko'), (SELECT id FROM teams WHERE name = 'Haiti'), '2026-06-25 00:00:00', 'GROUP', 'C', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Skottland'), (SELECT id FROM teams WHERE name = 'Brasilien'), '2026-06-25 00:00:00', 'GROUP', 'C', 'scheduled');

-- Group D matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'USA'), (SELECT id FROM teams WHERE name = 'Paraguay'), '2026-06-13 03:00:00', 'GROUP', 'D', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Australien'), (SELECT id FROM teams WHERE name = 'Play-off UEFA B'), '2026-06-14 06:00:00', 'GROUP', 'D', 'scheduled'),
((SELECT id FROM teams WHERE name = 'USA'), (SELECT id FROM teams WHERE name = 'Australien'), '2026-06-19 21:00:00', 'GROUP', 'D', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Play-off UEFA B'), (SELECT id FROM teams WHERE name = 'Paraguay'), '2026-06-20 06:00:00', 'GROUP', 'D', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Play-off UEFA B'), (SELECT id FROM teams WHERE name = 'USA'), '2026-06-26 04:00:00', 'GROUP', 'D', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Paraguay'), (SELECT id FROM teams WHERE name = 'Australien'), '2026-06-26 04:00:00', 'GROUP', 'D', 'scheduled');

-- Group E matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'Tyskland'), (SELECT id FROM teams WHERE name = 'Curaçao'), '2026-06-14 19:00:00', 'GROUP', 'E', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Elfenbenskusten'), (SELECT id FROM teams WHERE name = 'Ecuador'), '2026-06-15 01:00:00', 'GROUP', 'E', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Tyskland'), (SELECT id FROM teams WHERE name = 'Elfenbenskusten'), '2026-06-20 22:00:00', 'GROUP', 'E', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Ecuador'), (SELECT id FROM teams WHERE name = 'Curaçao'), '2026-06-21 02:00:00', 'GROUP', 'E', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Curaçao'), (SELECT id FROM teams WHERE name = 'Elfenbenskusten'), '2026-06-25 22:00:00', 'GROUP', 'E', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Ecuador'), (SELECT id FROM teams WHERE name = 'Tyskland'), '2026-06-25 22:00:00', 'GROUP', 'E', 'scheduled');

-- Group F matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'Nederländerna'), (SELECT id FROM teams WHERE name = 'Japan'), '2026-06-14 22:00:00', 'GROUP', 'F', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Play-off UEFA C'), (SELECT id FROM teams WHERE name = 'Tunisien'), '2026-06-15 04:00:00', 'GROUP', 'F', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Nederländerna'), (SELECT id FROM teams WHERE name = 'Play-off UEFA C'), '2026-06-20 19:00:00', 'GROUP', 'F', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Tunisien'), (SELECT id FROM teams WHERE name = 'Japan'), '2026-06-21 06:00:00', 'GROUP', 'F', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Tunisien'), (SELECT id FROM teams WHERE name = 'Nederländerna'), '2026-06-26 01:00:00', 'GROUP', 'F', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Japan'), (SELECT id FROM teams WHERE name = 'Play-off UEFA C'), '2026-06-26 01:00:00', 'GROUP', 'F', 'scheduled');

-- Group G matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'Belgien'), (SELECT id FROM teams WHERE name = 'Egypten'), '2026-06-15 21:00:00', 'GROUP', 'G', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Iran'), (SELECT id FROM teams WHERE name = 'Nya Zeeland'), '2026-06-16 03:00:00', 'GROUP', 'G', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Belgien'), (SELECT id FROM teams WHERE name = 'Iran'), '2026-06-21 21:00:00', 'GROUP', 'G', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Nya Zeeland'), (SELECT id FROM teams WHERE name = 'Egypten'), '2026-06-22 03:00:00', 'GROUP', 'G', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Nya Zeeland'), (SELECT id FROM teams WHERE name = 'Belgien'), '2026-06-27 05:00:00', 'GROUP', 'G', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Egypten'), (SELECT id FROM teams WHERE name = 'Iran'), '2026-06-27 05:00:00', 'GROUP', 'G', 'scheduled');

-- Group H matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'Spanien'), (SELECT id FROM teams WHERE name = 'Kap Verde'), '2026-06-15 18:00:00', 'GROUP', 'H', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Saudiarabien'), (SELECT id FROM teams WHERE name = 'Uruguay'), '2026-06-16 00:00:00', 'GROUP', 'H', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Spanien'), (SELECT id FROM teams WHERE name = 'Saudiarabien'), '2026-06-21 18:00:00', 'GROUP', 'H', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Uruguay'), (SELECT id FROM teams WHERE name = 'Kap Verde'), '2026-06-22 00:00:00', 'GROUP', 'H', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Kap Verde'), (SELECT id FROM teams WHERE name = 'Saudiarabien'), '2026-06-27 02:00:00', 'GROUP', 'H', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Uruguay'), (SELECT id FROM teams WHERE name = 'Spanien'), '2026-06-27 02:00:00', 'GROUP', 'H', 'scheduled');

-- Group I matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'Frankrike'), (SELECT id FROM teams WHERE name = 'Senegal'), '2026-06-16 21:00:00', 'GROUP', 'I', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Play-off AFC/CAF'), (SELECT id FROM teams WHERE name = 'Norge'), '2026-06-17 00:00:00', 'GROUP', 'I', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Frankrike'), (SELECT id FROM teams WHERE name = 'Play-off AFC/CAF'), '2026-06-22 23:00:00', 'GROUP', 'I', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Norge'), (SELECT id FROM teams WHERE name = 'Senegal'), '2026-06-23 02:00:00', 'GROUP', 'I', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Norge'), (SELECT id FROM teams WHERE name = 'Frankrike'), '2026-06-26 21:00:00', 'GROUP', 'I', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Senegal'), (SELECT id FROM teams WHERE name = 'Play-off AFC/CAF'), '2026-06-26 21:00:00', 'GROUP', 'I', 'scheduled');

-- Group J matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'Argentina'), (SELECT id FROM teams WHERE name = 'Algeriet'), '2026-06-17 03:00:00', 'GROUP', 'J', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Österrike'), (SELECT id FROM teams WHERE name = 'Jordanien'), '2026-06-17 06:00:00', 'GROUP', 'J', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Argentina'), (SELECT id FROM teams WHERE name = 'Österrike'), '2026-06-22 19:00:00', 'GROUP', 'J', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Jordanien'), (SELECT id FROM teams WHERE name = 'Algeriet'), '2026-06-23 05:00:00', 'GROUP', 'J', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Algeriet'), (SELECT id FROM teams WHERE name = 'Österrike'), '2026-06-28 04:00:00', 'GROUP', 'J', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Jordanien'), (SELECT id FROM teams WHERE name = 'Argentina'), '2026-06-28 04:00:00', 'GROUP', 'J', 'scheduled');

-- Group K matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'Portugal'), (SELECT id FROM teams WHERE name = 'Play-off CONCACAF/OFC'), '2026-06-17 19:00:00', 'GROUP', 'K', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Uzbekistan'), (SELECT id FROM teams WHERE name = 'Colombia'), '2026-06-18 04:00:00', 'GROUP', 'K', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Portugal'), (SELECT id FROM teams WHERE name = 'Uzbekistan'), '2026-06-23 19:00:00', 'GROUP', 'K', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Colombia'), (SELECT id FROM teams WHERE name = 'Play-off CONCACAF/OFC'), '2026-06-24 04:00:00', 'GROUP', 'K', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Colombia'), (SELECT id FROM teams WHERE name = 'Portugal'), '2026-06-28 01:30:00', 'GROUP', 'K', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Play-off CONCACAF/OFC'), (SELECT id FROM teams WHERE name = 'Uzbekistan'), '2026-06-28 01:30:00', 'GROUP', 'K', 'scheduled');

-- Group L matches
INSERT INTO `matches` (`home_team_id`, `away_team_id`, `matchTime`, `matchType`, `group`, `status`) VALUES
((SELECT id FROM teams WHERE name = 'England'), (SELECT id FROM teams WHERE name = 'Kroatien'), '2026-06-17 22:00:00', 'GROUP', 'L', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Ghana'), (SELECT id FROM teams WHERE name = 'Panama'), '2026-06-18 01:00:00', 'GROUP', 'L', 'scheduled'),
((SELECT id FROM teams WHERE name = 'England'), (SELECT id FROM teams WHERE name = 'Ghana'), '2026-06-23 22:00:00', 'GROUP', 'L', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Panama'), (SELECT id FROM teams WHERE name = 'Kroatien'), '2026-06-24 01:00:00', 'GROUP', 'L', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Panama'), (SELECT id FROM teams WHERE name = 'England'), '2026-06-27 23:00:00', 'GROUP', 'L', 'scheduled'),
((SELECT id FROM teams WHERE name = 'Kroatien'), (SELECT id FROM teams WHERE name = 'Ghana'), '2026-06-27 23:00:00', 'GROUP', 'L', 'scheduled');

-- ========================================
-- ROUND OF 32 MATCHES (16 matches)
-- Teams TBD after group stage
-- ========================================

INSERT INTO `matches` (`matchTime`, `matchType`, `status`, `home_group_description`, `away_group_description`, `allowed_home_groups`, `allowed_away_groups`) VALUES
('2026-06-28 21:00:00', 'ROUND_OF_32', 'scheduled', '2:a Grupp A', '2:a Grupp B', 'A', 'B'),
('2026-06-29 22:30:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp E', 'Bästa 3:a', 'E', NULL),
('2026-06-30 03:00:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp F', '2:a Grupp C', 'F', 'C'),
('2026-06-29 19:00:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp C', '2:a Grupp F', 'C', 'F'),
('2026-06-30 23:00:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp I', 'Bästa 3:a', 'I', NULL),
('2026-06-30 19:00:00', 'ROUND_OF_32', 'scheduled', '2:a Grupp E', '2:a Grupp I', 'E', 'I'),
('2026-07-01 03:00:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp A', 'Bästa 3:a', 'A', NULL),
('2026-07-01 18:00:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp L', 'Bästa 3:a', 'L', NULL),
('2026-07-02 02:00:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp D', 'Bästa 3:a', 'D', NULL),
('2026-07-01 22:00:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp G', 'Bästa 3:a', 'G', NULL),
('2026-07-03 01:00:00', 'ROUND_OF_32', 'scheduled', '2:a Grupp K', '2:a Grupp L', 'K', 'L'),
('2026-07-02 21:00:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp H', '2:a Grupp J', 'H', 'J'),
('2026-07-03 05:00:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp B', 'Bästa 3:a', 'B', NULL),
('2026-07-04 00:00:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp J', '2:a Grupp H', 'J', 'H'),
('2026-07-04 03:30:00', 'ROUND_OF_32', 'scheduled', '1:a Grupp K', 'Bästa 3:a', 'K', NULL),
('2026-07-03 20:00:00', 'ROUND_OF_32', 'scheduled', '2:a Grupp D', '2:a Grupp G', 'D', 'G');

-- ========================================
-- ROUND OF 16 MATCHES (8 matches)
-- ========================================

INSERT INTO `matches` (`matchTime`, `matchType`, `status`, `home_group_description`, `away_group_description`) VALUES
('2026-07-04 23:00:00', 'ROUND_OF_16', 'scheduled', 'Vinnare 32-del 2', 'Vinnare 32-del 5'),
('2026-07-04 19:00:00', 'ROUND_OF_16', 'scheduled', 'Vinnare 32-del 1', 'Vinnare 32-del 3'),
('2026-07-05 22:00:00', 'ROUND_OF_16', 'scheduled', 'Vinnare 32-del 4', 'Vinnare 32-del 6'),
('2026-07-06 02:00:00', 'ROUND_OF_16', 'scheduled', 'Vinnare 32-del 7', 'Vinnare 32-del 8'),
('2026-07-06 21:00:00', 'ROUND_OF_16', 'scheduled', 'Vinnare 32-del 11', 'Vinnare 32-del 12'),
('2026-07-07 02:00:00', 'ROUND_OF_16', 'scheduled', 'Vinnare 32-del 9', 'Vinnare 32-del 10'),
('2026-07-07 18:00:00', 'ROUND_OF_16', 'scheduled', 'Vinnare 32-del 14', 'Vinnare 32-del 16'),
('2026-07-07 22:00:00', 'ROUND_OF_16', 'scheduled', 'Vinnare 32-del 13', 'Vinnare 32-del 15');

-- ========================================
-- QUARTER FINALS (4 matches)
-- ========================================

INSERT INTO `matches` (`matchTime`, `matchType`, `status`, `home_group_description`, `away_group_description`) VALUES
('2026-07-09 22:00:00', 'QUARTER_FINAL', 'scheduled', 'Vinnare åttondelsfinal 1', 'Vinnare åttondelsfinal 2'),
('2026-07-10 21:00:00', 'QUARTER_FINAL', 'scheduled', 'Vinnare åttondelsfinal 5', 'Vinnare åttondelsfinal 6'),
('2026-07-11 23:00:00', 'QUARTER_FINAL', 'scheduled', 'Vinnare åttondelsfinal 3', 'Vinnare åttondelsfinal 4'),
('2026-07-12 03:00:00', 'QUARTER_FINAL', 'scheduled', 'Vinnare åttondelsfinal 7', 'Vinnare åttondelsfinal 8');

-- ========================================
-- SEMI FINALS (2 matches)
-- ========================================

INSERT INTO `matches` (`matchTime`, `matchType`, `status`, `home_group_description`, `away_group_description`) VALUES
('2026-07-14 21:00:00', 'SEMI_FINAL', 'scheduled', 'Vinnare kvartsfinal 1', 'Vinnare kvartsfinal 2'),
('2026-07-15 21:00:00', 'SEMI_FINAL', 'scheduled', 'Vinnare kvartsfinal 3', 'Vinnare kvartsfinal 4');

-- ========================================
-- BRONZE MATCH & FINAL (2 matches)
-- ========================================

INSERT INTO `matches` (`matchTime`, `matchType`, `status`, `home_group_description`, `away_group_description`) VALUES
('2026-07-18 23:00:00', 'FINAL', 'scheduled', 'Förlorare semifinal 1', 'Förlorare semifinal 2'),
('2026-07-19 21:00:00', 'FINAL', 'scheduled', 'Vinnare semifinal 1', 'Vinnare semifinal 2');

-- ========================================
-- KNOCKOUT SCORING CONFIG
-- ========================================

INSERT INTO `knockout_scoring_config` (`match_type`, `points_per_correct_team`, `active`, `description`) VALUES
('ROUND_OF_32', 1, 1, 'Tippa vilka 32 lag som går vidare från gruppspel'),
('ROUND_OF_16', 2, 1, 'Tippa vilka 16 lag som går vidare till åttondelsfinal'),
('QUARTER_FINAL', 3, 1, 'Tippa vilka 8 lag som går vidare till kvartsfinal'),
('SEMI_FINAL', 4, 1, 'Tippa vilka 4 lag som går vidare till semifinal'),
('FINAL', 5, 1, 'Tippa vilka 2 lag som går till final'),
('WINNER', 10, 1, 'Tippa vinnaren av VM');

COMMIT;

-- ========================================
-- NOTES:
-- ========================================
-- 1. Teams marked as "Play-off" are still TBD from UEFA/AFC/CAF/CONCACAF/OFC playoffs
-- 2. All times are in CEST (Central European Summer Time)
-- 3. Run this file AFTER setting up the base database schema (soccer_db.sql)
-- 4. Update playoff team names when they are determined
--
-- Total: 48 teams, 104 matches (72 group + 16 round of 32 + 8 round of 16 + 4 QF + 2 SF + 2 Final/Bronze)
--
-- Playoff paths still to be determined:
-- - UEFA Path A: Bosnia-Herzegovina, Italy, Northern Ireland, Wales
-- - UEFA Path B: Kosovo, Romania, Slovakia, Turkey
-- - UEFA Path C: Albania, Poland, Sweden, Ukraine
-- - UEFA Path D: Czech Republic, Denmark, North Macedonia, Republic of Ireland
-- - AFC/CAF playoff: Bolivia, Iraq, Suriname
-- - CONCACAF/OFC playoff: DR Congo, Jamaica, New Caledonia
