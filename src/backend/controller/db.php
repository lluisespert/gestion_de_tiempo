<?php
declare(strict_types=1);

// Ajusta estos valores a tu entorno local.
$DB_HOST = "localhost";
$DB_NAME = "gestion_de_tiempo";
$DB_USER = "root";
$DB_PASS = "";
$DB_CHARSET = "utf8mb4";

$dsn = "mysql:host={$DB_HOST};dbname={$DB_NAME};charset={$DB_CHARSET}";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
} catch (PDOException $e) {
    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode([
        "ok" => false,
        "error" => "DB_CONNECTION_FAILED",
        "message" => $e->getMessage(),
    ]);
    exit;
}
