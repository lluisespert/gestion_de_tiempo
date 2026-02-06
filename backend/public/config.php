<?php

declare(strict_types=1);

// Load Composer's autoloader
require __DIR__ . '/../../vendor/autoload.php';

// Load environment variables from .env file
$dotenv = new Symfony\Component\Dotenv\Dotenv();
$dotenv->loadEnv(__DIR__ . '/../../.env');
