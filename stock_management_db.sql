-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 23, 2026 at 07:56 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `stock_management_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `category_name`, `description`, `created_at`) VALUES
(1, 'DDA', 'IS MINE', '2026-11-16 14:37:50');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `unit_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `product_name`, `sku`, `category_id`, `supplier_id`, `quantity`, `unit_price`, `created_at`) VALUES
(1, 'banana', 'prd001', 1, 1, 9, 0.05, '2026-11-16 14:39:39');

-- --------------------------------------------------------

--
-- Table structure for table `stock_transactions`
--

CREATE TABLE `stock_transactions` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `transaction_type` enum('IN','OUT') NOT NULL,
  `quantity` int(11) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stock_transactions`
--

INSERT INTO `stock_transactions` (`id`, `product_id`, `user_id`, `transaction_type`, `quantity`, `reference`, `notes`, `created_at`) VALUES
(1, 1, 15, 'IN', 4, 'INV002', 'YES', '2026-11-16 15:09:23');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `supplier_name` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `supplier_name`, `phone`, `email`, `address`, `created_at`) VALUES
(1, 'LEMEMBEL', '0788993372', 'daniel@22222', 'kigali', '2026-11-16 14:38:46');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff') DEFAULT 'staff',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'KWIBUKA DANIEL', '0722449488', '$2b$10$CcE/OgsetqECKta37omUz.iAdciXu2F4MQy.pIuu.RgH78L8uUGQG', 'staff', '2026-11-13 09:22:52'),
(2, 'ISHIMWE CLAUDE', 'danielkwibuka4@gmail.com', '$2b$10$fzp0AHTRxBbIeXz1xcPtdu71yTzplLBIP/qNsXU2PU3C0qBxJPK/K', 'staff', '2026-11-13 09:24:51'),
(3, 'GAVANI HITI', 'gavani@gmail.com', '$2b$10$3O4ctnzt.h/AdVBaE4HV3.byjMXV21QdG.Mdo/u4ze3lZlAQvioQi', 'staff', '2026-11-13 09:31:09'),
(4, 'Daniel', 'daniel@gmail.co', '$2b$10$UtpeR7YqHZtdR9u.gaSe1.Hfp6LWXLNZXfakgwJzDqvReW1xk5B0u', 'staff', '2026-11-13 09:37:11'),
(5, 'DANIEL', 'daniel@gmail.com', '$2b$10$YdvWoh2cJALcY3cbQnqqNu7iBzjf57NQFGaPbCRbvuhIhEe1/DWoW', 'staff', '2026-11-13 09:52:24'),
(6, 'mucyo evode', 'mucyo@gmail.com', '$2b$10$a4vdjei74O.HNd6MRGOQKOcJOfiw8rhNRNrYdkxf57v2kvvukxLJS', 'staff', '2026-11-13 09:55:11'),
(7, 'KWIBUKA DANIEL', 'kwibuka4@gmail.com', '$2b$10$zDk5yt3Ec2faNKdXCMOECuIiqd.jeLML7EloL7IxOl7hp1r0rR142', 'staff', '2026-11-13 09:58:06'),
(8, 'bugingo josua', 'josua@gmail.com', '$2b$10$cFvWnX3ckedas1d2Q.rK3OCy6kbhdVaZMQ3rvkgEDAt0ojQ2urI/e', 'staff', '2026-11-16 11:12:50'),
(10, 'bugingo josua', 'josuabugingo@gmail.com', '$2b$10$f9EO6rJCPtS3bgE3oP2IC.XNJpTfBLKzTcAQ6I9xfe8/Jz8zQGubG', 'staff', '2026-11-16 11:13:12'),
(11, 'kwibuka daniel', 'daniel@11111', '$2b$10$DsSf200/i/4KAg9DSbZUGOADsdez8EvjQS5sp53mB4W2P2MtnSPLW', 'staff', '2026-11-16 11:44:45'),
(12, 'bigingo josua', 'daniele@11111', '$2b$10$adGL0ORN.FzQXYneQJGqwethS7wlEsm9SqEJs4QqVTx1LBzjC8D8C', 'staff', '2026-11-16 11:46:38'),
(13, 'IRAKOZE CLEMANSE', 'danielkwibuka2@gmail.com', '$2b$10$A.cxTy9ZHlyE4ANrETvKIuUX23Ilwe7cGom6Czq0IG2zng3Mj2O6y', 'staff', '2026-11-16 11:48:27'),
(14, 'uwimana anastase', 'uwimananastase@gmail.com', '$2b$10$at.a0z/NAdPgUPPimk2XC.9RlSuRwete/wOWR3Ow.Wn.UVm.Zsit.', 'staff', '2026-11-16 14:42:52'),
(15, 'mawombe josua', 'mawombe@gmail.com', '$2b$10$RvFIoV1lG69se.6kFBhe..LvAkSyRB4ebaxygqrWp0nzdg3eSn5JG', 'staff', '2026-11-16 14:43:58'),
(16, 'uwimana anastase', 'uwimana@gmail.com', '$2b$10$UI2X1CwdztNL8ESjY.894ereIixS/g93PLCDf6qW33d8gVjS1eVQa', 'staff', '2026-11-17 09:13:33'),
(17, 'KWIBUKA DANIEL', 'kwibuka@gmail.com', '$2b$10$6Dc38kKi/S8zlofPtdkH6.DBzuVR4VBdaWtx6GgwyEz1ioFI27Qte', 'staff', '2026-11-17 09:23:33');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `category_name` (`category_name`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `stock_transactions`
--
ALTER TABLE `stock_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stock_transactions`
--
ALTER TABLE `stock_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `stock_transactions`
--
ALTER TABLE `stock_transactions`
  ADD CONSTRAINT `stock_transactions_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `stock_transactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
