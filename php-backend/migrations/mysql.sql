-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Värd: familjenfalth.se.mysql.service.one.com:3306
-- Tid vid skapande: 19 jun 2025 kl 09:36
-- Serverversion: 10.6.20-MariaDB-ubu2204
-- PHP-version: 8.1.2-1ubuntu2.21

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
-- Tabellstruktur `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `token` (`token`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

--
-- Dumpning av Data i tabell `bets`
--

INSERT INTO `bets` (`id`, `user_id`, `match_id`, `home_score`, `away_score`, `home_team_id`, `away_team_id`, `points`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 3, 1, NULL, NULL, 1, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(2, 3, 1, 5, 1, NULL, NULL, 3, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(3, 4, 1, 2, 0, NULL, NULL, 1, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(4, 2, 2, 1, 3, NULL, NULL, 3, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(5, 5, 2, 0, 2, NULL, NULL, 1, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(6, 3, 3, 2, 0, NULL, NULL, 1, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(7, 4, 3, 3, 0, NULL, NULL, 3, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(8, 5, 4, 2, 1, NULL, NULL, 3, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(9, 2, 4, 1, 0, NULL, NULL, 1, '2025-06-17 19:59:30', '2025-06-17 19:59:30');

-- --------------------------------------------------------

--
-- Tabellstruktur `em24_users`
--

CREATE TABLE `em24_users` (
  `id` int(11) NOT NULL,
  `first_name` text CHARACTER SET utf8mb3 COLLATE utf8mb3_swedish_ci NOT NULL,
  `last_name` text CHARACTER SET utf8mb3 COLLATE utf8mb3_swedish_ci NOT NULL,
  `email` text NOT NULL,
  `admin_rights` text NOT NULL,
  `total_points` float DEFAULT NULL,
  `username` text NOT NULL,
  `password` text NOT NULL,
  `paid` text NOT NULL,
  `phone` text DEFAULT NULL,
  `best_scorer` text DEFAULT NULL,
  `worst_team` text DEFAULT NULL,
  `bronze` text DEFAULT NULL,
  `gold` text DEFAULT NULL,
  `place_nigeria` text DEFAULT NULL,
  `place_ivory_coast` text DEFAULT NULL,
  `first_swe_scorer` text DEFAULT NULL,
  `swe_start_team` text DEFAULT NULL,
  `bet_frozen` text DEFAULT NULL,
  `best_team` text DEFAULT NULL,
  `match_most_goals` text DEFAULT NULL,
  `last_updated` text DEFAULT NULL,
  `image` text CHARACTER SET utf8mb3 COLLATE utf8mb3_swedish_ci DEFAULT NULL,
  `description` text CHARACTER SET utf8mb3 COLLATE utf8mb3_swedish_ci DEFAULT NULL,
  `favo_list` text DEFAULT NULL,
  `time_first_goal_in_final` text DEFAULT NULL,
  `no_matches_w_penalties_in_final` text DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Dumpning av Data i tabell `em24_users`
--

INSERT INTO `em24_users` (`id`, `first_name`, `last_name`, `email`, `admin_rights`, `total_points`, `username`, `password`, `paid`, `phone`, `best_scorer`, `worst_team`, `bronze`, `gold`, `place_nigeria`, `place_ivory_coast`, `first_swe_scorer`, `swe_start_team`, `bet_frozen`, `best_team`, `match_most_goals`, `last_updated`, `image`, `description`, `favo_list`, `time_first_goal_in_final`, `no_matches_w_penalties_in_final`) VALUES
(1, 'Claes', 'Fälth', 'claes@familjenfalth.se', 'Yes', 48, 'clafa', 'ri8tYRxsSbvuQ', 'Yes', '', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Tyskland', '', '2024-06-10 22:22:27', 'croppic/temp/1717439728.png', 'Bor i norra Kinda. Är med och fixar EANKBT. Gillar att umgås, mangla och gå från klarhet till klarhet, samt ofullständiga meninga', NULL, '14', NULL),
(12, 'Ulrik ', 'Karlsson', 'ulrikkarlsson78@hotmail.com', '', 60, 'Ulrik ', 'riJ27AwczmjWs', 'Yes', '734475177', 'Kylian Mbappe, Frankrike', '', '', 'Spanien', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-02 15:08:52', 'croppic/temp/1717332939.png', 'Södertäljebo, men född och uppvuxen i Rimforsa där mina päron fortfarande bor. Hälsar på dem ibland. ', NULL, '15', NULL),
(13, 'Edvin ', 'Greneskog ', 'edvin.greneskog@gmail.com', '', 44, 'FotbollsEdde', 'ri6MZ11A0IS/k', 'Yes', '702517576', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-03 10:25:55', 'croppic/temp/1717346870.png', 'Från Rydaholm men hade fyra trevliga år i Rimforsa som bland annat ungdomsledare! Hängiven fotbollstittare sedan vm 2018.', NULL, '40', NULL),
(52, 'Hugo', 'Svantesson', 'hugosvante09@gmail.com', '', 56, 'hugosvante', 'riUHjLVo/WhHw', 'Yes', '702477756', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-08 14:06:17', 'croppic/temp/1717846080.png', '', NULL, 'Tilläggstid 1:a halvlek', NULL),
(14, 'Pelle', 'Andersson', 'pelleason67@gmail.com', 'Yes', 57, 'Pelle A', 'ri8j.x5pUbi/Y', 'Yes', '706890798', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-11 20:52:02', 'croppic/temp/1717394986.png', 'Vacker, genomklok, lagom tjock man i sina bästa år. Rimforsabo. ', NULL, '64', NULL),
(15, 'Pontus', 'Weitman', 'pontus@weitman.se', '', 54, 'Pontus', 'rirfdZN1rFjBw', 'Yes', '730440035', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-12 22:10:35', 'croppic/temp/1720294420.png', '', '1', 'Tilläggstid 1:a halvlek', NULL),
(16, 'Fredrik', 'Bergström', 'fredrikbergstrom2015@hotmail.com', '', 66, 'Freddie', 'riBLlNSjigCU.', 'Yes', '768955338', 'Harry Kane, England', '', '', 'England', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-12 20:43:09', 'croppic/temp/1717417819.png', 'Gammal Liljeholmare  som tippat varje år men aldrig vunnit. TILL I ÅR!! För football is coming home. \r\nFörövrigt anser jag Jonathan Isgren bör förlora.', '16;99', '27', NULL),
(18, 'Oskar', 'Andersson', 'Oskar.ason@gmail.com', '', 54, 'Bödvar', 'riWStQe3xQwc.', 'Yes', '706209261', 'Romelu Lukaku, Belgien', '', '', 'Tyskland', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-04 14:14:05', 'croppic/temp/1717439283.png', '', NULL, '57', NULL),
(17, 'Klara', 'Borg', 'Klara@borgbacken.se', '', 66, 'Klaraborg', 'riHNZmjbQg29s', 'Yes', '735135453', 'Någon annan', '', '', 'Spanien', NULL, NULL, '', NULL, NULL, 'Spanien', '', '2024-06-12 07:05:52', '', 'När man inte kan tippa Sverige som guldlag, fick det bli ett annat lag på samma bokstav. Jag kan meddela att Spanien kommer lyfta bucklan i år!', NULL, 'Tilläggstid 1:a halvlek', NULL),
(19, 'Noa', 'Andersson', 'noa.andersson01@gmail.com', '', 60, 'Noa', 'rimb1midLiQWM', 'Yes', '793339483', 'Harry Kane, England', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-03 21:47:27', '', '', NULL, '34', NULL),
(20, 'Dan', 'Appelgren', 'dan.appelgren@hotmail.com', '', 43, 'danappel', 'rivWQzT.k7ux.', 'Yes', '706405581', 'Memphis Depay, Holland', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Holland', '', '2024-06-12 22:18:26', '', '', '20;65;36', '37', NULL),
(21, 'Jan', 'Gustafsson', 'jan.rimforsa@gmail.com', '', 50, 'Janne G', 'ri5W9Y/VFoznA', 'Yes', '735034078', 'Harry Kane, England', '', '', 'Holland', NULL, NULL, '', NULL, NULL, 'Tyskland', '', '2024-06-06 16:15:26', 'croppic/temp/1717442980.png', '', NULL, '59', NULL),
(22, 'Olle', 'Kilbrand', 'olle.kilbrand@gmail.com', '', 52, 'okilbrand', 'rikWpL5NU/O7g', 'Yes', '704784489', 'Andrej Kramaric, Kroatien', '', '', 'Spanien', NULL, NULL, '', NULL, NULL, 'Spanien', '', '2024-06-03 21:50:21', 'croppic/temp/1717443467.png', '', NULL, '21', NULL),
(23, 'Karin ', 'Åberg ', 'Karinabergsepost@gmail.com', '', 49, 'KarinAgnetaÅberg', 'riuNbdZK//99.', 'Yes', '', 'Romelu Lukaku, Belgien', '', '', 'Belgien', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-03 22:04:12', 'croppic/temp/1717476329.png', 'Bor i Örebro, har 3 barn, spenderar mesta fritiden som handbollstränare och jobbar till vardags med magnetkameror!', NULL, '23', NULL),
(24, 'Rikard', 'Salomonsson', 'rikard.salomonsson@outlook.com', '', 69, 'Rikard_S', 'riCx/VDC6Ve2w', 'Yes', '705516496', 'Någon annan', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-11 07:48:43', '', '', NULL, '42', NULL),
(25, 'Niklas ', 'Hallingström ', 'hallingstrom@hotmail.com', '', 52, 'Liverpool ', 'riGYv/iXB7DPM', 'Yes', '709431505', 'Kylian Mbappe, Frankrike', '', '', 'Portugal', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-08 10:40:18', 'croppic/temp/1717448255.png', 'Stor Liverpool supporter ', NULL, '60', NULL),
(26, 'Anna', 'Berner', 'berneranna@hotmail.com', '', 45, 'berneranna', 'ri5TXhnVP4CPA', 'Yes', '737341585', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-04 22:04:21', 'croppic/temp/1717448370.png', '', NULL, '19', NULL),
(28, 'Anna', 'S Johansson', 'anna.svensson.johansson@gmail.com', '', 52, 'AnnaSJ', 'rimzqIS2FrPus', 'Yes', '730590623', 'Kylian Mbappe, Frankrike', '', '', 'England', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-08 18:14:25', '', '', NULL, '18', NULL),
(75, 'Roy', 'Lindhout', 'Roy.lindhout@outlook.com', '', 46, 'roylin180', 'risFAuPqS2ihw', 'Yes', '768288366', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Holland', '', '2024-06-10 21:23:23', '', '', NULL, '24', NULL),
(30, 'Ola', 'Berner', 'seizpob@gmail.com', '', 56, 'BernerOla', 'riDzLJUCrGVuM', 'Yes', '706418478', 'Jude Bellingham, England', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-04 15:44:59', 'croppic/temp/1717506868.png', 'Från Bollebygd, Lovande 68-åring. \r\nFotboll och handboll e fina grejer.', '51;26;30;80;103;86;89;23', '33', NULL),
(31, 'Jakob', 'Thoresen', 'jakob.thoresen@gmail.com', '', 57, 'Jakobthoresen', 'riT8pDSmi7HY2', 'Yes', '738439431', 'Kylian Mbappe, Frankrike', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-12 20:20:22', '', 'Trogen tippare med kopplingar till Liljeholmen och Ekumeniakyrkan i Rimforsa', '85;24;31;62', '28', NULL),
(32, 'Oliver', 'Gustafsson', 'oliver.putsered@hotmail.com', '', 52, 'o_gustafsson', 'ridBINIohDmPQ', 'Yes', '735377617', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-10 21:35:49', '', '', '31;62', '63', NULL),
(33, 'Markus', 'Lindstedt', 'markus.lindstedt@outlook.com', '', 53, 'Arnor', 'riKRSqfPhX9VI', 'Yes', '723043742', 'Harry Kane, England', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-11 08:58:21', 'croppic/temp/1717514418.png', 'Inflyttad Kindabo som anser att ÖSK borde tvånguppflyttas retroaktivt av Svenska Fotbollförbundet som dessvärre är djupt korrumperat och troligen ligger bakom att Ralf Edström tvingades sluta som expertkommentator i Sportradion. Sanningen är ofta smärtsam, som när Ralf en gång utbrast, i direktsändning: Push up är för mig en behå.', NULL, '32', NULL),
(34, 'Victor', 'Berrio García', 'viccctor_@hotmail.com', '', 44, 'saftochbulle', 'riKxteKbLVBQs', 'Yes', '763474934', 'Kylian Mbappe, Frankrike', '', '', 'Tyskland', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-04 20:36:55', '', 'Kompositör bosatt i Örebro, och uppväxt i Rimforsa, samt egenutnämnd guldfavorit till årets EM-tips.  Förbereden eder på kolossala mängder stryk.', NULL, '78', NULL),
(35, 'Olivia', 'Tingvall', 'olivia.tingvall@gmail.com', '', 50, 'oltin1000', 'riYXEirEPLFZo', 'Yes', '768778868', 'Cristiano Ronaldo, Portugal', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-04 22:43:21', 'croppic/temp/1717522691.png', '', NULL, '37', NULL),
(36, 'Oskar', 'Briland', 'oskar.briland@gmail.com', '', 62, 'oskarbriland', 'rik6pi4gv8//.', 'Yes', '704073687', 'Kylian Mbappe, Frankrike', '', '', 'Spanien', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-12 13:04:03', '', '2-barnsfar, ofrivillig stockholmare ', '85;20;65;36', '27', NULL),
(37, 'Iréne Ingvarsdotter', 'Brandén', 'irene.branden@gmail.com', '', 61, 'Ingvarsdotter', 'rinM3aJy7ASyc', 'Yes', '705890304', 'Kylian Mbappe, Frankrike', '', '', 'Spanien', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-05 21:27:22', '', 'Skjuter från höften', NULL, '39', NULL),
(38, 'Jonah ', 'Svantesson ', 'jonahsvante@gmail.com', '', 54, 'HanoJ', 'ridXXYB/PjimA', 'Yes', '723164122', 'Harry Kane, England', '', '', 'England', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-10 17:38:02', 'croppic/temp/1718035402.png', '3 i EM tipp 2020', NULL, '52', NULL),
(39, 'Ing-Marie', 'Gustafsson ', 'Mima.g.61@ hotmail.com', '', 44, 'Nollkoll', 'riRnqQKfs3ufk', 'Yes', '767770530', 'Rasmus Højlund, Danmark', '', '', 'Italien', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-07 10:25:00', 'croppic/temp/1717749048.png', 'Nollkoll på boll.', NULL, '13', NULL),
(40, 'Kurt', 'Eklund', 'kurt@eklundsbyggrorel.se', '', 47, 'Järven', 'riQ9EWbAiWJ82', 'Yes', '706802048', 'Romelu Lukaku, Belgien', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-06 19:40:33', '', 'Bor i Järvträsk 10 mil västerut från Skellefteå .\r\nVarit med förr efter tips från min bror Roland.', NULL, '57', NULL),
(41, 'Sussie ', 'Andersson', '68suan@gmail.com', '', 36, 'SussieA', 'rimT6cBNbp84M', 'Yes', '738190361', 'Cristiano Ronaldo, Portugal', '', '', 'Portugal', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-12 14:06:03', '', '', NULL, '14', NULL),
(42, 'Elias', 'Asplund', 'elasplund@gmail.com', '', 60, 'laspidasp', 'riDG0icHaXyco', 'Yes', '732682711', 'Harry Kane, England', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Tyskland', '', '2024-06-10 20:21:27', 'croppic/temp/1717689921.png', 'Jag är kingen!!!', NULL, '27', NULL),
(43, 'ÅSA', 'PERSSON EKLUND', 'perssonsfix@hotmail.com', '', 49, 'AasaPer ', 'ribEmjSRiY0Dc', 'Yes', '727476222', 'Viktor Tsygankov, Ukraina', '', '', 'Holland', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-08 22:49:22', 'croppic/temp/1717691246.png', 'Järvträsk och gift med Kurt!', NULL, '22', NULL),
(44, 'Lovisa', 'Andersson', 'lollo.a_97@hotmail.com', '', 54, 'lovand', 'ridTR41IFeuRY', 'Yes', '767935932', 'Romelu Lukaku, Belgien', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-11 20:59:18', '', '', NULL, '16', NULL),
(78, 'Rasmus ', 'Svensson', 'Rasmus.svensson.sc2@hotmail.com', '', 55, 'Rasmus', 'ridIe9noyGYzg', 'Yes', '0734-014713 ', 'Kylian Mbappe, Frankrike', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-11 12:56:40', 'croppic/temp/1718102771.png', 'Davids kompis. Anglofil. Glory Glory Man United.', NULL, '31', NULL),
(46, 'Haider', 'Chahyn', 'Liverpool_fansen@hotmail.com', '', 50, 'Haider.Chahyn', 'ri4DcsNmWGe0M', 'Yes', '767065255', 'Kai Havertz, Tyskland', '', '', 'Tyskland', NULL, NULL, '', NULL, NULL, 'Tyskland', '', '2024-06-11 17:23:55', '', '', NULL, '38', NULL),
(47, 'Martin', 'Lilja', 'martinlilja55@hotmail.com', '', 57, 'Zeus Boko', 'rixe.aleLNDEU', 'Yes', '704099306', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-09 12:42:06', '', 'Kompis med Jonatan B! ', NULL, '54', NULL),
(48, 'Pia', 'Tingvall', 'pia.tingvall@coompanion.se', '', 53, 'Heja Sverige', 'ri0WtcehbRsJk', 'Yes', '706380082', 'Harry Kane, England', '', '', 'Tyskland', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-07 09:10:22', 'croppic/temp/1717743000.png', 'Någon måste ju vara bäst på att tippa sämst. Så tänker jag.', NULL, '16', NULL),
(49, 'Håkan', 'Nilsson', 'nilsson.hakan.bengt@gmail.com', '', 50, 'HåkanMaria', 'riukhMLnJnI/o', 'Yes', '763164600', 'Lamine Yamal, Spanien', '', '', 'Spanien', NULL, NULL, '', NULL, NULL, 'Holland', '', '2024-06-07 14:21:07', '', 'Vi är från Skåne Malmö vän med Familjen Sussie Andersson ', NULL, '19', NULL),
(50, 'Kenneth', 'Berrio García', 'kenneth.berrio-garcia@liljeholmen.nu', '', 63, 'go o glad', 'riUMqSKETYmGI', 'Yes', '705586556', 'Lamine Yamal, Spanien', '', '', 'Spanien', NULL, NULL, '', NULL, NULL, 'Spanien', '', '2024-06-12 21:39:52', '', 'en glad spanjor', '100;44;14;41;101;90;50;34;37;84;33;64;81;48', '38', NULL),
(51, 'Agneta', 'Berner', 'agneta_proregio@hotmail.com', '', 52, 'agnbe', 'riKml2ZPiW2QQ', 'Yes', '768323340', 'Någon annan', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Tyskland', '', '2024-06-08 22:11:58', 'croppic/temp/1718395241.png', 'Fotbollsintresserad västgötska som håller på Frankrike när inte Sverige är med. ', '51;26;30;80;103;89;23', '43', NULL),
(53, 'Lars', 'Karlsson', 'lars@wallners.se', '', 52, 'Slaka', 'rim0P/0y3/Kig', 'Yes', '072-1885508', 'Kevin De Bruyne, Belgien', '', '', 'Belgien', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-10 09:03:16', 'croppic/temp/1717847040.png', 'Rimforsa såg det på Facebook', NULL, '37', NULL),
(54, 'Robin', 'Ibañez', 'ibanezrobin95@gmail.com', '', 53, 'robinibanez', 'ritodNqCeis7Y', 'Yes', '706699961', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-11 21:09:39', '', '', '100;44;14;90;50;34;58;94;54;74;75;96;81;31', '76', NULL),
(55, 'Anne-Christine', 'Kargén', 'stina.kargen@hotmail.com', '', 44, 'Stina', 'ripQB.BdYKOGY', 'Yes', '701706934', 'Kevin De Bruyne, Belgien', '', '', 'Danmark', NULL, NULL, '', NULL, NULL, 'Danmark', '', '2024-06-09 17:59:02', '', '', NULL, '34', NULL),
(56, 'Fredrik', 'Carlin ', 'Fredrik.carlin@gmail.com', '', 54, 'Figgebig ', 'ripHRX/6ltElc', 'Yes', '723380507', 'Jude Bellingham, England', '', '', 'England', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-10 11:12:08', '', '', NULL, '28', NULL),
(57, 'Tom', 'Eklund', 'tom.eklund97@hotmail.com', '', 59, 'Tomeklund', 'riqWJqAEbd1gc', 'Yes', '767779040', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Spanien', '', '2024-06-08 22:15:20', 'croppic/temp/1717872087.png', '26åring från Blåsmark - Piteå som längtat efter detta grymma EM tips! Kul med fotboll! ', NULL, '10', NULL),
(58, 'Jonatan', 'Brandén', 'jonatanbranden@gmail.com', '', 49, 'Jbranden', 'riV8EyUqj7Gdk', 'Yes', '', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-12 23:40:07', '', '', NULL, '39', NULL),
(59, 'Roland', 'Eklund', 'roland@reaff.se', '', 43, 'roland@reaff.se', 'rite3Le9O6oBs', 'Yes', '705789040', 'Kylian Mbappe, Frankrike', '', '', 'Tyskland', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-09 09:34:27', 'croppic/temp/1717914931.png', 'Idrottsintresserad +60 åring. ', '37;58;40;59;57;43', '32', NULL),
(60, 'Anders', 'Wman', 'anders@weitman.se', '', 50, 'wman', 'riXylfqRcJUr6', 'Yes', '734184025', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-12 14:50:33', '', '', NULL, '35', NULL),
(61, 'Robert', 'Agerskog', 'ra@nordicmedcom.se', '', 56, 'Glenn', 'riv6WNc2dCae.', 'Yes', '705084469', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-09 15:49:51', '', 'En helt vanlig Glenn från Götet, Forza Blåvitt!!!', NULL, '32', NULL),
(62, 'Leif', 'Thoresen', 'leif.thoresen@live.com', '', 51, 'Leif', 'ritSPdHkmTyZk', 'Yes', '705813489', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-13 03:08:46', '', 'Ljungby ', '85;32;24;31;62', '11', NULL),
(63, 'Johannes', 'Kullered', 'jkullered@gmail.com', '', 50, 'Kredman', 'rits2kD1qGGqI', 'Yes', '793345505', 'Alvaro Morata, Spanien', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-12 19:23:44', '', 'Vann en gång, kommer inte ihåg när faktiskt. .', NULL, '41', NULL),
(64, 'Jonas', 'Ottosson', 'jonas@tornstigen.se', '', 59, 'kumlajonas', 'ria/Nc08Dl/kw', 'Yes', '709901761', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-12 16:44:37', '', 'Jag är en närking som fått nys om detta tips via min arbetskamrat Kenneth Berrio Garcia.', NULL, '68', NULL),
(89, 'Whilliam', 'Fälth', 'whilliamfalth@gmail.com', '', 49, 'Gogubbe', 'rimsKftKUNwSk', 'Yes', '793403879', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-12 16:59:18', 'croppic/temp/1718200223.png', '', NULL, '25', NULL),
(65, 'David', 'Appelgren', 'davapp00@gmail.com', '', 58, 'Davemila', 'riYth/o1jS8A.', 'Yes', '736873733', 'Harry Kane, England', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Tyskland', '', '2024-06-12 11:53:33', 'croppic/temp/1718003405.png', 'Växjöbo. 42 år. Måttligt sportintresserad. Att tippa ökar intresset med drygt 38%.', NULL, '33', NULL),
(66, 'Viktor', 'Jensen', 'viktorjensen@gmail.com', '', 47, 'Victorious', 'riscyQXHuXwpw', 'Yes', '709515107', 'Rasmus Højlund, Danmark', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-10 10:53:12', '', 'Kollega med Billy på Claytech i Lund', NULL, '36', NULL),
(67, 'Saga', 'Borg', 'saga@borgbacken.se', '', 56, 'sagaborg', 'riFqiHKvvSUR.', 'Yes', '761685406', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-12 08:27:54', 'croppic/temp/1718473484.png', 'Tvilling med Klara Borg...', NULL, '24', NULL),
(68, 'Herman', 'Raask', 'herman.raask@gmail.com', '', 46, 'hermanraask', 'rimGCetjGmoxg', 'Yes', '709100813', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-11 10:57:03', '', '', NULL, '57', NULL),
(70, 'Albin ', 'Lindholm ', 'alindholm06@gmail.com', '', 50, 'Leinden', 'riMFPGNlEnIKQ', 'Yes', '729718361', 'Phil Foden, England', '', '', 'Tyskland', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-10 17:26:23', 'croppic/temp/1718032184.png', '', NULL, '23', NULL),
(73, 'Arvid', 'Knutsson', 'arvid0622@gmail.com', '', 65, 'Arvid Knutsson', 'riaqmgVEqTEyU', 'Yes', '702006200', 'Någon annan', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-11 22:39:43', 'croppic/temp/1718039399.png', '', '42;72;73;70;38', 'Tilläggstid 1:a halvlek', NULL),
(74, 'Ella', 'Kullered', 'ellakullered@gmail.com', '', 59, 'Ella Kullered', 'rildR3UEKx8Sg', 'Yes', '725200107', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Tyskland', '', '2024-06-12 19:13:16', '', '', '100;74;63', '42', NULL),
(85, 'Elias', 'Axmarker', 'elias@axmarker.se', '', 56, 'Elias', 'ritY1hVTMC5Kg', 'Yes', '730220219', 'Kylian Mbappe, Frankrike', '', '', 'Tyskland', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-12 23:19:02', '', '', NULL, '51', NULL),
(77, 'Viktor', 'Rehn', 'viktor@rehn.nu', '', 49, 'Claes1337Fälth', 'riDLEeoL4BOiw', 'Yes', '709669312', 'Harry Kane, England', '', '', 'England', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-11 13:02:11', '', '', NULL, '35', NULL),
(79, 'Staffan', 'Hallenbert', 'staffan.hallenbert@terrazzovast.se', '', 56, 'Staffan', 'riZOq2JnWpZyE', 'Yes', '768520880', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-11 21:03:13', '', '', NULL, '74', NULL),
(80, 'Eva Maria ', 'Davidsson ', '', '', 52, 'Pilla', 'riOs44Sp/0L2k', 'Yes', 'Emariadavidsson@gmail.com', 'Harry Kane, England', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Spanien', '', '2024-06-11 21:56:10', '', '', NULL, '27', NULL),
(81, 'Amanda', 'Palmgren', 'amanda.palmgren@outlook.com', '', 54, 'amandapalmgren', 'rizVsP6ectvus', 'Yes', '705776610', 'Harry Kane, England', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-11 21:28:02', 'croppic/temp/1718133270.png', '', NULL, '41', NULL),
(82, 'Eskil', 'Claesson', 'eskil.claesson@gmail.com', '', 49, 'Eskilclaesson', 'rizDaeA8dyfW.', 'Yes', '702329493', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-11 22:00:43', '', '', NULL, '7', NULL),
(83, 'Birger', 'Claesson', 'birger@rydlersbygg.se', '', 58, 'Birgerclaesson', 'rikWqbf8mBGpw', 'Yes', '070-6013728', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-11 21:55:59', '', '', '14;83;82;92;79;52;38;102', '22', NULL),
(84, 'Oscar', 'Järnland', 'oscar.jarnland@hotmail.com', '', 53, 'Jarnland', 'ri25b4me38VWk', 'Yes', '730974569', 'Någon annan', '', '', 'Tyskland', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-11 22:37:12', '', '', NULL, '62', NULL),
(86, 'Carmith ', 'Fälth', 'carmithfalth@gmail.com', '', 41, 'Carmith', 'riE8rtDI1vyAE', 'Yes', '705155325', 'Ferran Torres, Spanien', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Spanien', '', '2024-06-12 16:13:57', '', 'Claes bror', NULL, '39', NULL),
(87, 'Erik', 'Nordlinder ', 'Erik.nordlinder@gmail.com ', '', 53, 'erino405', 'ricRSuOv9P50w', 'Yes', '766201647', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-12 13:29:12', 'croppic/temp/1718189289.png', 'Bor i Barhäll, Linköping med fru och en liten hund. Jobbar på Qualcomm.', NULL, '27', NULL),
(90, 'David', 'Berrio Garcia', 'david.bercia@gmail.com', '', 68, 'david.bercia@gmail.com', 'ri7wtYTQioqx.', 'Yes', '076-337 11 59', 'Alvaro Morata, Spanien', '', '', 'Spanien', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-12 18:24:06', '', 'Ständig tipsare, börjar bli dags för seger.', NULL, '67', NULL),
(91, 'Billy', 'Fälth', 'billyfalth68@gmail.com', '', 50, 'Kiblin', 'riZSIKEkkxYhU', 'Yes', '702863293', 'Phil Foden, England', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-12 19:56:40', '', '', NULL, '16', NULL),
(92, 'August', 'Davidsson', 'agge642@gmail.com', '', 46, 'Kai Haveri', 'ri.CMvv6zXgbo', 'Yes', '735909747', 'Kai Havertz, Tyskland', '', '', 'Tyskland', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-12 21:31:02', '', '25 år från Ornunga, vän med Familjen Andersson.', NULL, 'Tilläggstid 1:a halvlek', NULL),
(93, 'Andreas', 'Borg', 'andreas@borgbacken.se', 'Yes', 47, 'andreasborg', 'rimojUTvO1pQ.', 'Yes', '767729300', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-12 21:27:48', '', 'Tipsmedarrangör från Rimforsa', NULL, '30', NULL),
(94, 'Joel', 'Gustafsson ', 'joelvillgott@gmail.com', '', 55, 'SNYGGJOEL', 'ribKpe4f5GWD2', 'Yes', '768722333', 'Harry Kane, England', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-12 23:55:54', '', '', NULL, '18', NULL),
(95, 'Anton', 'Degerlund Elfstrand', 'anton.elfstrand@outlook.com', '', 63, 'Degen', 'riLsnwpHZeR3Y', 'Yes', '767947747', 'Kylian Mbappe, Frankrike', '', '', 'Tyskland', NULL, NULL, '', NULL, NULL, 'Holland', '', '2024-06-12 21:28:04', '', 'Tjo mitt namn är Anton 17 år bor i Kungsbacka och fick reda på detta från min klasskamrat Whilliam ', NULL, '39', NULL),
(96, 'Albin', 'Lindsmyr', 'lindsmyralbin@gmail.com', '', 43, 'Albin Lindsmyr', 'rizU7Gd357FV.', 'Yes', '793053021', 'Kylian Mbappe, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-12 22:32:42', 'croppic/temp/1718223202.png', 'Jag har precis genomgått utbildning inom Svenska Spel och ATG så jag kan det är med tips och sånt nu :)', NULL, 'Tilläggstid 1:a halvlek', NULL),
(97, 'Kristin', 'Borg', 'kristin@borgbacken.se', '', 57, 'Kristin', 'riLQHB6Bw.jck', 'Yes', '732522952', 'Jude Bellingham, England', '', '', 'England', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-12 21:52:58', '', 'För att variera mig använde jag bara nollor och tvåor i årets tips.', NULL, '16', NULL),
(98, 'Axel', 'Borg', 'axel@borgbacken.se', '', 53, 'Axel Borg', 'riE9GzGs0btT6', 'Yes', '722096075', 'Romelu Lukaku, Belgien', '', '', 'Belgien', NULL, NULL, '', NULL, NULL, 'Belgien', '', '2024-06-12 22:11:07', 'croppic/temp/1718220809.png', 'Proffstippare genom blod. Son till tipsarrangör Andreas Borg och EM2012-tipsvinnare Kristin Borg.', NULL, 'Tilläggstid 1:a halvlek', NULL),
(99, 'Jonathan', 'Isgren', 'jonathanisgren92@gmail.com', '', 40, 'Igbes', 'riH6hzVcIOvvs', 'Yes', '732055777', 'Någon annan', '', '', 'Italien', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-12 23:36:56', 'croppic/temp/1718220910.png', 'Gick Musikproduktion på Liljeholmens folkhögskola 2011/2012.\r\n\r\nFredrik Bergström är min nemesis. Det enda jag värdesätter är att vinna över honom och gärna med så liten marginal som möjligt.\r\n\r\nMed Någon annan som bästa målskytt menar jag Scamacca.', NULL, 'Det blir straffläggning efter 0-0', NULL),
(100, 'Jona', 'Andersson', 'jona_and@outlook.com', '', 57, 'Jonqinho', 'ria9Im8Oukir6', 'Yes', '722357708', 'Harry Kane, England', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'England', '', '2024-06-12 22:31:05', '', '', NULL, '28', NULL),
(101, 'Anita', 'Berrio Garcia', 'anita.berrio-garcia@liljeholmen.nu', '', 64, 'lilaniber', 'riUMqSKETYmGI', 'Yes', '705421457', 'Olivier Giroud, Frankrike', '', '', 'Frankrike', NULL, NULL, '', NULL, NULL, 'Frankrike', '', '2024-06-12 22:33:15', '', '', NULL, '28', NULL),
(102, 'Patrik', 'Svantesson', 'patriksvante@gmail.com', '', 61, 'Patrik S', 'riKgo4qEs/rUQ', 'Yes', '705213600', 'Någon annan', '', '', 'Tyskland', NULL, NULL, '', NULL, NULL, 'Portugal', '', '2024-06-12 23:04:55', 'croppic/temp/1718226887.png', 'Västergötland Asklanda, bor på landet med familj,', '19;18;14;83;82;92;52;38;102', '60', NULL),
(103, 'Johan', 'Davidsson', 'Davidsson.j@gmail.com', '', 49, 'Johdav', 'riLc.AX4oeS/E', 'Yes', '702295551', 'Bruno Fernandes, Portugal', '', '', 'Portugal', NULL, NULL, '', NULL, NULL, 'Tyskland', '', '2024-06-12 22:32:37', '', '', NULL, '17', NULL),
(108, 'test', 'test', 'claes@familjenfalth.se', '', NULL, 'test', 'rij.uEL2QOTHU', '', '733011989', 'Niclas Fullkrug, Tyskland', '', '', 'Albanien', NULL, NULL, '', NULL, NULL, 'Albanien', '', '2024-07-15 12:58:44', '', 'hej hej', NULL, '2', NULL);

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
(1, 2, 'Predictions for Group A', 'Who do you think will advance from Group A? Germany looks strong but Switzerland could surprise!', '2024-06-10 10:00:00', '2024-06-10 10:00:00'),
(2, 3, 'Spain looking dominant', 'After that 3-0 win against Croatia, Spain is definitely my pick for the championship. Their midfield is incredible!', '2024-06-16 09:00:00', '2024-06-16 09:00:00'),
(3, 4, 'Upset predictions?', 'Any bold predictions for upsets in the next round? I have a feeling Georgia might surprise Portugal...', '2024-06-17 14:30:00', '2024-06-17 14:30:00');

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
(1, 1, 3, 'I agree about Germany, but I think Hungary could be the dark horse in Group A!', '2024-06-10 11:00:00'),
(2, 1, 5, 'Switzerland definitely has potential. They always perform well in major tournaments.', '2024-06-10 12:00:00'),
(3, 2, 4, 'Absolutely! That passing game is mesmerizing. Pedri and Gavi are the future.', '2024-06-16 10:00:00'),
(4, 3, 2, 'Georgia vs Portugal would be amazing! Though I think France might surprise everyone by struggling.', '2024-06-17 15:00:00');

-- --------------------------------------------------------

--
-- Tabellstruktur `knockout_scoring`
--

CREATE TABLE `knockout_scoring` (
  `id` int(11) NOT NULL,
  `matchType` varchar(50) NOT NULL,
  `pointsPerCorrectTeam` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `knockout_scoring`
--

INSERT INTO `knockout_scoring` (`id`, `matchType`, `pointsPerCorrectTeam`, `created_at`, `updated_at`) VALUES
(1, 'ROUND_OF_16', 1, '2025-06-17 19:55:42', '2025-06-17 19:55:42'),
(2, 'QUARTER_FINAL', 2, '2025-06-17 19:55:42', '2025-06-17 19:55:42'),
(3, 'SEMI_FINAL', 3, '2025-06-17 19:55:42', '2025-06-17 19:55:42'),
(4, 'FINAL', 4, '2025-06-17 19:55:42', '2025-06-17 19:55:42');

-- --------------------------------------------------------

--
-- Tabellstruktur `knockout_scoring_config`
--

CREATE TABLE `knockout_scoring_config` (
  `id` int(11) NOT NULL,
  `match_type` enum('ROUND_OF_16','QUARTER_FINAL','SEMI_FINAL','FINAL') NOT NULL,
  `points_per_correct_team` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `knockout_scoring_config`
--

INSERT INTO `knockout_scoring_config` (`id`, `match_type`, `points_per_correct_team`, `created_at`, `updated_at`) VALUES
(1, 'ROUND_OF_16', 1, '2025-06-06 05:26:33', '2025-06-06 05:26:33'),
(2, 'QUARTER_FINAL', 2, '2025-06-06 05:26:33', '2025-06-06 05:26:33'),
(3, 'SEMI_FINAL', 3, '2025-06-06 05:26:33', '2025-06-06 05:26:33'),
(4, 'FINAL', 4, '2025-06-06 05:26:33', '2025-06-06 05:26:33');

-- --------------------------------------------------------

--
-- Tabellstruktur `matches`
--

CREATE TABLE `matches` (
  `id` int(11) NOT NULL,
  `home_team_id` int(11) DEFAULT NULL,
  `away_team_id` int(11) DEFAULT NULL,
  `home_score` int(11) DEFAULT NULL,
  `away_score` int(11) DEFAULT NULL,
  `matchTime` datetime NOT NULL,
  `status` enum('scheduled','live','finished') DEFAULT 'scheduled',
  `matchType` enum('GROUP','ROUND_OF_16','QUARTER_FINAL','SEMI_FINAL','FINAL') DEFAULT 'GROUP',
  `group` varchar(1) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `matches`
--

INSERT INTO `matches` (`id`, `home_team_id`, `away_team_id`, `home_score`, `away_score`, `matchTime`, `status`, `matchType`, `group`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 5, 1, '2024-06-14 21:00:00', 'finished', 'GROUP', NULL, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(2, 3, 4, 1, 3, '2024-06-15 15:00:00', 'finished', 'GROUP', NULL, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(3, 5, 6, 3, 0, '2024-06-15 18:00:00', 'finished', 'GROUP', NULL, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(4, 7, 8, 2, 1, '2024-06-15 21:00:00', 'finished', 'GROUP', NULL, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(5, 9, 10, NULL, NULL, '2024-06-16 18:00:00', 'scheduled', 'GROUP', NULL, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(6, 11, 12, NULL, NULL, '2024-06-16 21:00:00', 'scheduled', 'GROUP', NULL, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(7, 13, 14, NULL, NULL, '2024-06-16 15:00:00', 'scheduled', 'GROUP', NULL, '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(8, 15, 16, NULL, NULL, '2024-06-17 21:00:00', 'scheduled', 'GROUP', NULL, '2025-06-17 19:59:30', '2025-06-17 19:59:30');

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
(1, 'bets_locked', 'false', 'Anger om betting är låst för alla användare', '2025-06-17 19:55:42', '2025-06-17 19:55:42'),
(2, 'tournament_name', 'VM', 'Namnet på turneringen (t.ex. VM, EM)', '2025-06-17 19:55:42', '2025-06-17 19:55:42'),
(3, 'app_version', '1.0', 'Applikationsversion', '2025-06-17 19:55:42', '2025-06-17 19:55:42'),
(4, 'tournament_year', '2026', 'Året för turneringen', '2025-06-17 19:55:42', '2025-06-17 19:55:42'),
(5, 'tournament_description', 'Familjen Fälths officiella tipset', 'Beskrivning av turneringen', '2025-06-17 19:55:42', '2025-06-17 19:55:42');

-- --------------------------------------------------------

--
-- Tabellstruktur `teams`
--

CREATE TABLE `teams` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `group` varchar(1) DEFAULT NULL,
  `flag_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `teams`
--

INSERT INTO `teams` (`id`, `name`, `group`, `flag_url`, `created_at`, `updated_at`) VALUES
(1, 'Germany', 'A', 'https://flagcdn.com/w320/de.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(2, 'Scotland', 'A', 'https://flagcdn.com/w320/gb-sct.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(3, 'Hungary', 'A', 'https://flagcdn.com/w320/hu.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(4, 'Switzerland', 'A', 'https://flagcdn.com/w320/ch.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(5, 'Spain', 'B', 'https://flagcdn.com/w320/es.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(6, 'Croatia', 'B', 'https://flagcdn.com/w320/hr.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(7, 'Italy', 'B', 'https://flagcdn.com/w320/it.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(8, 'Albania', 'B', 'https://flagcdn.com/w320/al.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(9, 'Slovenia', 'C', 'https://flagcdn.com/w320/si.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(10, 'Denmark', 'C', 'https://flagcdn.com/w320/dk.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(11, 'Serbia', 'C', 'https://flagcdn.com/w320/rs.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(12, 'England', 'C', 'https://flagcdn.com/w320/gb-eng.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(13, 'Poland', 'D', 'https://flagcdn.com/w320/pl.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(14, 'Netherlands', 'D', 'https://flagcdn.com/w320/nl.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(15, 'Austria', 'D', 'https://flagcdn.com/w320/at.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(16, 'France', 'D', 'https://flagcdn.com/w320/fr.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(17, 'Belgium', 'E', 'https://flagcdn.com/w320/be.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(18, 'Slovakia', 'E', 'https://flagcdn.com/w320/sk.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(19, 'Romania', 'E', 'https://flagcdn.com/w320/ro.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(20, 'Ukraine', 'E', 'https://flagcdn.com/w320/ua.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(21, 'Turkey', 'F', 'https://flagcdn.com/w320/tr.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(22, 'Georgia', 'F', 'https://flagcdn.com/w320/ge.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(23, 'Portugal', 'F', 'https://flagcdn.com/w320/pt.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(24, 'Czech Republic', 'F', 'https://flagcdn.com/w320/cz.png', '2025-06-17 19:59:30', '2025-06-17 19:59:30');

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
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `users`
--

INSERT INTO `users` (`id`, `username`, `name`, `email`, `password_hash`, `password`, `role`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'admin', 'admin@example.com', '$2y$10$.IckEmaxy/O0qr2Ey3Bk7umgWJM3hjQFOTKbStxm5WPMJncI4tIt.', '$2y$10$.IckEmaxy/O0qr2Ey3Bk7umgWJM3hjQFOTKbStxm5WPMJncI4tIt.', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(2, 'alice', 'alice', 'alice@example.com', '$2y$10$.IckEmaxy/O0qr2Ey3Bk7umgWJM3hjQFOTKbStxm5WPMJncI4tIt.', '$2y$10$.IckEmaxy/O0qr2Ey3Bk7umgWJM3hjQFOTKbStxm5WPMJncI4tIt.', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(3, 'bob', 'bob', 'bob@example.com', '$2y$10$.IckEmaxy/O0qr2Ey3Bk7umgWJM3hjQFOTKbStxm5WPMJncI4tIt.', '$2y$10$.IckEmaxy/O0qr2Ey3Bk7umgWJM3hjQFOTKbStxm5WPMJncI4tIt.', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(4, 'charlie', 'charlie', 'charlie@example.com', '$2y$10$.IckEmaxy/O0qr2Ey3Bk7umgWJM3hjQFOTKbStxm5WPMJncI4tIt.', '$2y$10$.IckEmaxy/O0qr2Ey3Bk7umgWJM3hjQFOTKbStxm5WPMJncI4tIt.', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie', '2025-06-17 19:59:30', '2025-06-17 19:59:30'),
(5, 'diana', 'diana', 'diana@example.com', '$2y$10$.IckEmaxy/O0qr2Ey3Bk7umgWJM3hjQFOTKbStxm5WPMJncI4tIt.', '$2y$10$.IckEmaxy/O0qr2Ey3Bk7umgWJM3hjQFOTKbStxm5WPMJncI4tIt.', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=diana', '2025-06-17 19:59:30', '2025-06-17 19:59:30');

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
-- Index för tabell `em24_users`
--
ALTER TABLE `em24_users`
  ADD PRIMARY KEY (`id`);

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
-- Index för tabell `knockout_scoring`
--
ALTER TABLE `knockout_scoring`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matchType` (`matchType`),
  ADD KEY `idx_matchType` (`matchType`);

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
  ADD KEY `idx_away_team` (`away_team_id`);

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
  ADD KEY `idx_name` (`name`);

--
-- Index för tabell `special_bets`
--
ALTER TABLE `special_bets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_is_active` (`is_active`);

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
-- AUTO_INCREMENT för dumpade tabeller
--

--
-- AUTO_INCREMENT för tabell `bets`
--
ALTER TABLE `bets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT för tabell `em24_users`
--
ALTER TABLE `em24_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT för tabell `forum_posts`
--
ALTER TABLE `forum_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT för tabell `forum_replies`
--
ALTER TABLE `forum_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT för tabell `knockout_scoring`
--
ALTER TABLE `knockout_scoring`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT för tabell `knockout_scoring_config`
--
ALTER TABLE `knockout_scoring_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT för tabell `matches`
--
ALTER TABLE `matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT för tabell `system_config`
--
ALTER TABLE `system_config`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT för tabell `teams`
--
ALTER TABLE `teams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT för tabell `special_bets`
--
ALTER TABLE `special_bets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT för tabell `user_special_bets`
--
ALTER TABLE `user_special_bets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT för tabell `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
-- Restriktioner för tabell `special_bets`
--
-- Inga foreign keys för special_bets

--
-- Restriktioner för tabell `user_special_bets`
--
ALTER TABLE `user_special_bets`
  ADD CONSTRAINT `user_special_bets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_special_bets_ibfk_2` FOREIGN KEY (`special_bet_id`) REFERENCES `special_bets` (`id`) ON DELETE CASCADE;

--
-- Restriktioner för tabell `matches`
--
ALTER TABLE `matches`
  ADD CONSTRAINT `matches_ibfk_1` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `matches_ibfk_2` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


-- Migration för att ändra image_url kolumn för att stödja base64-bilder
-- Kör denna SQL-fråga i databasen

ALTER TABLE `users` 
MODIFY COLUMN `image_url` LONGTEXT DEFAULT NULL;

-- LONGTEXT kan hantera upp till 4GB data, vilket är mer än tillräckligt för base64-bilder

-- --------------------------------------------------------

--
-- Tabellstruktur `special_bets`
--

CREATE TABLE `special_bets` (
  `id` int(11) NOT NULL,
  `question` varchar(500) NOT NULL,
  `options` JSON NOT NULL COMMENT 'Array of possible answers',
  `correct_option` varchar(255) DEFAULT NULL COMMENT 'The correct answer from options',
  `points` int(11) NOT NULL DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpning av Data i tabell `special_bets`
--

INSERT INTO `special_bets` (`id`, `question`, `options`, `correct_option`, `points`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Vem blir VM:s målkung?', '["Kylian Mbappé", "Erling Haaland", "Lionel Messi", "Cristiano Ronaldo", "Harry Kane", "Annan spelare"]', NULL, 5, 1, '2025-06-25 10:00:00', '2025-06-25 10:00:00'),
(2, 'Vilket lag kommer på tredje plats?', '["Brasilien", "Argentina", "Frankrike", "England", "Spanien", "Tyskland", "Portugal", "Nederländerna"]', NULL, 3, 1, '2025-06-25 10:00:00', '2025-06-25 10:00:00'),
(3, 'Hur många gula kort får Sverige totalt?', '["0-2 kort", "3-5 kort", "6-8 kort", "9-11 kort", "12+ kort"]', NULL, 2, 1, '2025-06-25 10:00:00', '2025-06-25 10:00:00'),
(4, 'Första målskytten i finalen?', '["Kylian Mbappé", "Erling Haaland", "Lionel Messi", "Cristiano Ronaldo", "Harry Kane", "Annan spelare"]', NULL, 4, 1, '2025-06-25 10:00:00', '2025-06-25 10:00:00'),
(5, 'Vilken spelare får flest gula kort?', '["Casemiro", "Sergio Busquets", "N\'Golo Kanté", "Fabinho", "Rodri", "Annan spelare"]', NULL, 3, 1, '2025-06-25 10:00:00', '2025-06-25 10:00:00');

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

-- --------------------------------------------------------

--
-- Tabellstruktur `site_content`
--

CREATE TABLE `site_content` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content_key` varchar(100) NOT NULL UNIQUE,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `content_type` enum('text', 'html', 'markdown') NOT NULL DEFAULT 'html',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `content_key` (`content_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumpa data för tabell `site_content`
--

INSERT INTO `site_content` (`content_key`, `title`, `content`, `content_type`) VALUES
('homepage_welcome', 'Välkommen!', '<h2>Välkommen till vårt tipset!</h2><p>Tävla med vänner och familj genom att tippa på matcher. Samla poäng genom att gissa rätt resultat och klättra upp på resultattavlan!</p><p><strong>Så här fungerar det:</strong></p><ul><li>Tippa på matcher före de börjar</li><li>Få poäng för rätt resultat och utfall</li><li>Tävla på resultattavlan</li><li>Delta i forumdiskussioner</li></ul>', 'html'),
('homepage_rules', 'Regler och Poängsystem', '<h3>Poängsystem</h3><ul><li><strong>Exakt resultat:</strong> 3 poäng</li><li><strong>Rätt utfall (vinst/oavgjort):</strong> 1 poäng</li><li><strong>Fel tips:</strong> 0 poäng</li></ul><h3>Viktiga regler</h3><ul><li>Tips måste lämnas innan matchstart</li><li>Tips kan inte ändras efter matchstart</li><li>Alla registrerade användare kan delta</li></ul>', 'html');



-- Migration: Add group constraints for knockout matches
-- This allows admins to configure which groups can be selected for home/away teams in knockout matches

ALTER TABLE `matches` 
ADD COLUMN `allowed_home_groups` VARCHAR(255) NULL COMMENT 'Comma-separated list of groups (A,B,C,D) that can be selected for home team',
ADD COLUMN `allowed_away_groups` VARCHAR(255) NULL COMMENT 'Comma-separated list of groups (A,B,C,D) that can be selected for away team',
ADD COLUMN `home_group_description` VARCHAR(255) NULL COMMENT 'Description shown to users for home team selection (e.g., "Vinnare grupp A och B")',
ADD COLUMN `away_group_description` VARCHAR(255) NULL COMMENT 'Description shown to users for away team selection (e.g., "Vinnare grupp C och D")';

-- Update existing knockout matches with example constraints
-- These are just examples - admins can modify them later
UPDATE `matches` 
SET 
    `allowed_home_groups` = 'A,B',
    `allowed_away_groups` = 'C,D',
    `home_group_description` = 'Vinnare grupp A och B',
    `away_group_description` = 'Vinnare grupp C och D'
WHERE `matchType` = 'ROUND_OF_16' AND `id` % 2 = 1;

UPDATE `matches` 
SET 
    `allowed_home_groups` = 'C,D',
    `allowed_away_groups` = 'A,B',
    `home_group_description` = 'Vinnare grupp C och D',
    `away_group_description` = 'Vinnare grupp A och B'
WHERE `matchType` = 'ROUND_OF_16' AND `id` % 2 = 0;

-- For quarter finals and beyond, we'll allow any team (since they come from previous knockout rounds)
UPDATE `matches` 
SET 
    `allowed_home_groups` = NULL,
    `allowed_away_groups` = NULL,
    `home_group_description` = 'Alla kvalificerade lag',
    `away_group_description` = 'Alla kvalificerade lag'
WHERE `matchType` IN ('QUARTER_FINAL', 'SEMI_FINAL', 'FINAL');


-- Migration: Add external_id columns for Football-Data.org API integration
-- Run this to enable import functionality from Football-Data.org

-- Add external_id to teams table
ALTER TABLE `teams` 
ADD COLUMN `external_id` INT DEFAULT NULL AFTER `id`,
ADD COLUMN `short_name` VARCHAR(50) DEFAULT NULL AFTER `name`,
ADD INDEX `idx_teams_external_id` (`external_id`);

-- Add external_id to matches table  
ALTER TABLE `matches`
ADD COLUMN `external_id` INT DEFAULT NULL AFTER `id`,
ADD INDEX `idx_matches_external_id` (`external_id`);

-- Note: Run this migration before importing data from Football-Data.org API