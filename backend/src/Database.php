<?php
declare(strict_types=1);

namespace App;

final class Database
{
    private static \PDO $connection;

    private function __construct() {}

    private static function getNewConnection(): \PDO
    {
        $host = $_ENV['DB_HOST'];
        $database = $_ENV['DB_NAME'];
        $user = $_ENV['DB_USER'];
        $password = $_ENV['DB_PASS'];
        $port = $_ENV['DB_PORT'];
        $charset = $_ENV['DB_CHARSET'];

        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset={$charset}";

        return new \PDO($dsn, $user, $password, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
        ]);
    }

    public static function connection(): \PDO
    {
        try {
            return self::$connection ??= self::getNewConnection();
        } catch (\PDOException $e) {
            http_response_code(500);
            header("Content-Type: application/json; charset=utf-8");
            echo json_encode([
                "ok" => false,
                "error" => "DB_CONNECTION_FAILED",
                "message" => $e->getMessage(),
            ]);
            exit;
        }
    }
}
