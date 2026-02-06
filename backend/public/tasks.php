<?php
declare(strict_types=1);

require __DIR__ . "/config.php";

use App\Database;

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

$pdo = Database::connection();
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {
    $date = $_GET["date"] ?? null;
    $start = $_GET["start"] ?? null;
    $end = $_GET["end"] ?? null;
    $completed = isset($_GET["completed"]) ? (int) $_GET["completed"] : null;

    $where = [];
    $params = [];

    if ($date) {
        $where[] = "task_date = :date";
        $params[":date"] = $date;
    }

    if ($start && $end) {
        $where[] = "task_date BETWEEN :start AND :end";
        $params[":start"] = $start;
        $params[":end"] = $end;
    }

    if ($completed !== null) {
        $where[] = "completed = :completed";
        $params[":completed"] = $completed;
    }

    $sql = "SELECT * FROM tasks";
    if ($where) {
        $sql .= " WHERE " . implode(" AND ", $where);
    }
    $sql .= " ORDER BY task_date ASC, id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $tasks = $stmt->fetchAll();

    respond(200, ["ok" => true, "data" => $tasks]);
}

if ($method === "POST") {
    $body = json_decode(file_get_contents("php://input"), true);
    if (!is_array($body)) {
        respond(400, ["ok" => false, "error" => "INVALID_JSON"]);
    }

    $title = trim((string) ($body["title"] ?? ""));
    $details = isset($body["details"]) ? (string) $body["details"] : null;
    $taskDate = (string) ($body["task_date"] ?? "");

    if ($title === "" || $taskDate === "") {
        respond(422, ["ok" => false, "error" => "MISSING_FIELDS"]);
    }

    $stmt = $pdo->prepare(
        "INSERT INTO tasks (title, details, task_date) VALUES (:title, :details, :task_date)"
    );
    $stmt->execute([
        ":title" => $title,
        ":details" => $details,
        ":task_date" => $taskDate,
    ]);

    respond(201, ["ok" => true, "id" => (int) $pdo->lastInsertId()]);
}

if ($method === "PUT") {
  $body = json_decode(file_get_contents("php://input"), true);
  if (!is_array($body)) {
    respond(400, ["ok" => false, "error" => "INVALID_JSON"]);
  }

  $id = isset($body["id"]) ? (int) $body["id"] : 0;
  $completed = isset($body["completed"]) ? (int) $body["completed"] : null;
  $details = array_key_exists("details", $body) ? (string) $body["details"] : null;

  if ($id <= 0) {
    respond(422, ["ok" => false, "error" => "MISSING_ID"]);
  }

  $fields = [];
  $params = [":id" => $id];

  if ($completed !== null) {
    $fields[] = "completed = :completed";
    $fields[] = "completed_at = IF(:completed = 1, NOW(), NULL)";
    $params[":completed"] = $completed;
  }

  if ($details !== null) {
    $fields[] = "details = :details";
    $params[":details"] = $details;
  }

  if (!$fields) {
    respond(422, ["ok" => false, "error" => "NO_FIELDS"]);
  }

  $stmt = $pdo->prepare("UPDATE tasks SET " . implode(", ", $fields) . " WHERE id = :id");
  $stmt->execute($params);

  respond(200, ["ok" => true]);
}

if ($method === "DELETE") {
  $body = json_decode(file_get_contents("php://input"), true);
  if (!is_array($body)) {
    respond(400, ["ok" => false, "error" => "INVALID_JSON"]);
  }

  $id = isset($body["id"]) ? (int) $body["id"] : 0;
  if ($id <= 0) {
    respond(422, ["ok" => false, "error" => "MISSING_ID"]);
  }

  $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :id");
  $stmt->execute([":id" => $id]);

  respond(200, ["ok" => true]);
}

respond(405, ["ok" => false, "error" => "METHOD_NOT_ALLOWED"]);
