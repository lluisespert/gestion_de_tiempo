<?php
declare(strict_types=1);

require __DIR__ . "/config.php";

use App\Database;
use Dompdf\Dompdf;

$date = $_GET["date"] ?? null;
$start = $_GET["start"] ?? null;
$end = $_GET["end"] ?? null;

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

if (!$date && !($start && $end)) {
    http_response_code(400);
    header("Content-Type: text/plain; charset=utf-8");
    echo "Falta el parámetro date o start/end.";
    exit;
}

$sql = "SELECT * FROM tasks";
if ($where) {
    $sql .= " WHERE " . implode(" AND ", $where);
}
$sql .= " ORDER BY task_date ASC, id ASC";
$stmt = Database::connection()->prepare($sql);
$stmt->execute($params);
$tasks = $stmt->fetchAll();

$title = $date ? "Tareas del {$date}" : "Tareas del {$start} al {$end}";

$rowsHtml = "";
foreach ($tasks as $task) {
    $taskDate = htmlspecialchars((string) $task["task_date"], ENT_QUOTES, "UTF-8");
    $taskTitle = htmlspecialchars((string) $task["title"], ENT_QUOTES, "UTF-8");
    $taskDetails = htmlspecialchars((string) ($task["details"] ?? ""), ENT_QUOTES, "UTF-8");
    $rowsHtml .= "<tr>
        <td>{$taskDate}</td>
        <td>{$taskTitle}</td>
        <td>{$taskDetails}</td>
    </tr>";
}

$html = "
<!DOCTYPE html>
<html lang=\"es\">
<head>
  <meta charset=\"utf-8\" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; }
    h1 { font-size: 18px; margin: 0 0 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    th { background: #f2f2f2; }
  </style>
</head>
<body>
  <h1>{$title}</h1>
  <table>
    <thead>
      <tr>
        <th>Fecha</th>
        <th>Tarea</th>
        <th>Detalles</th>
      </tr>
    </thead>
    <tbody>
      {$rowsHtml}
    </tbody>
  </table>
</body>
</html>";

$dompdf = new Dompdf();
$dompdf->loadHtml($html, "UTF-8");
$dompdf->setPaper("A4", "portrait");
$dompdf->render();

$filename = $date ? "tareas_{$date}.pdf" : "tareas_{$start}_{$end}.pdf";
header("Content-Type: application/pdf");
header("Content-Disposition: attachment; filename=\"{$filename}\"");
echo $dompdf->output();
