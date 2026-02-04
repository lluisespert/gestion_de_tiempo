import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../estilos/estilos.css";

function Home() {
  const navigate = useNavigate();
  const API_URL = "http://localhost/gestion_de_tiempo/src/backend/controller/tasks.php";
  const EXPORT_URL = "http://localhost/gestion_de_tiempo/src/backend/controller/export.php";

  const [showInsert, setShowInsert] = useState(false);
  const [showView, setShowView] = useState(false);
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewDate, setViewDate] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [pendingCompleted, setPendingCompleted] = useState({});
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editDetails, setEditDetails] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!date || !title.trim()) return;
    setSaving(true);
    setErrorMessage("");
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          details: details.trim() ? details.trim() : null,
          task_date: date,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "ERROR_GUARDANDO");
      }
      setTitle("");
      setDetails("");
      setShowInsert(false);
      setShowResults(false);
    } catch (error) {
      setErrorMessage("No se pudo guardar la tarea.");
    } finally {
      setSaving(false);
    }
  };

  const fetchTasksByDate = async (selectedDate) => {
    if (!selectedDate) return;
    setLoadingTasks(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_URL}?date=${selectedDate}`);
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "ERROR_CARGANDO");
      }
      setTasks(data.data || []);
      setShowResults(true);
    } catch (error) {
      setErrorMessage("No se pudieron cargar las tareas.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchTasksByRange = async () => {
    if (!rangeStart || !rangeEnd) return;
    setLoadingTasks(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_URL}?start=${rangeStart}&end=${rangeEnd}`);
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "ERROR_CARGANDO");
      }
      setTasks(data.data || []);
      setShowResults(true);
    } catch (error) {
      setErrorMessage("No se pudieron cargar las tareas del rango.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchAllTasks = async () => {
    setLoadingTasks(true);
    setErrorMessage("");
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "ERROR_CARGANDO");
      }
      setTasks(data.data || []);
      setShowResults(true);
    } catch (error) {
      setErrorMessage("No se pudieron cargar todas las tareas.");
    } finally {
      setLoadingTasks(false);
    }
  };

  const markPendingCompleted = (taskId, nextValue) => {
    setPendingCompleted((prev) => ({ ...prev, [taskId]: nextValue }));
  };

  const saveCompleted = async (taskId) => {
    setErrorMessage("");
    const nextValue = pendingCompleted[taskId];
    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, completed: nextValue ? 1 : 0 }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "ERROR_ACTUALIZANDO");
      }
      setTasks((prev) =>
        prev.map((item) =>
          item.id === taskId ? { ...item, completed: nextValue ? 1 : 0 } : item
        )
      );
      setPendingCompleted((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    } catch (error) {
      setErrorMessage("No se pudo actualizar la tarea.");
    }
  };

  const startEditDetails = (task) => {
    setEditingTaskId(task.id);
    setEditDetails(task.details || "");
  };

  const cancelEditDetails = () => {
    setEditingTaskId(null);
    setEditDetails("");
  };

  const saveDetails = async (taskId) => {
    setErrorMessage("");
    try {
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, details: editDetails }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "ERROR_ACTUALIZANDO");
      }
      setTasks((prev) =>
        prev.map((item) =>
          item.id === taskId ? { ...item, details: editDetails } : item
        )
      );
      setEditingTaskId(null);
      setEditDetails("");
      setShowResults(true);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } catch (error) {
      setErrorMessage("No se pudo actualizar el detalle.");
    }
  };

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm("¿Seguro que quieres eliminar esta tarea?");
    if (!confirmed) return;
    setErrorMessage("");
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "ERROR_ELIMINANDO");
      }
      setTasks((prev) => prev.filter((item) => item.id !== taskId));
    } catch (error) {
      setErrorMessage("No se pudo eliminar la tarea.");
    }
  };

  const exportDayPdf = (selectedDate) => {
    if (!selectedDate) return;
    window.open(`${EXPORT_URL}?date=${selectedDate}`, "_blank");
    setShowView(false);
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportRangePdf = () => {
    if (!rangeStart || !rangeEnd) return;
    window.open(`${EXPORT_URL}?start=${rangeStart}&end=${rangeEnd}`, "_blank");
    setShowView(false);
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container text-center home-center">
      <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3">
        <button
          type="button"
          className="btn-3d btn-3d-primary"
          onClick={() => setShowInsert((prev) => !prev)}
          aria-expanded={showInsert}
          aria-controls="insertar-tarea"
        >
          Insertar tareas
        </button>
        <button
          type="button"
          className="btn-3d btn-3d-secondary"
          onClick={() => setShowView((prev) => !prev)}
          aria-expanded={showView}
          aria-controls="visualizar-tareas"
        >
          Exportar tareas
        </button>
        <button type="button" className="btn-3d btn-3d-secondary" onClick={fetchAllTasks}>
          Visualizar tareas
        </button>
      </div>

      <div
        id="insertar-tarea"
        className={`insert-card menu-panel text-start ${showInsert ? "is-open" : ""}`}
        role="region"
        aria-hidden={!showInsert}
      >
        <form onSubmit={handleSubmit} className="insert-form">
          <label className="form-label text-light" htmlFor="fecha-tarea">
            Fecha
          </label>
          <input
            id="fecha-tarea"
            type="date"
            className="form-control form-control-lg mb-3"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />

          <label className="form-label text-light" htmlFor="titulo-tarea">
            Nombre de la tarea
          </label>
          <input
            id="titulo-tarea"
            type="text"
            className="form-control form-control-lg mb-3"
            placeholder="Ej: Comprar leche"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <label className="form-label text-light" htmlFor="detalle-tarea">
            Detalle de la tarea
          </label>
          <textarea
            id="detalle-tarea"
            className="form-control form-control-lg mb-3"
            rows="3"
            placeholder="Describe la tarea..."
            value={details}
            onChange={(event) => setDetails(event.target.value)}
          />

          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn-3d btn-3d-secondary btn-3d-small me-2"
              onClick={() => {
                setShowInsert(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Cerrar
            </button>
            <button type="submit" className="btn-3d btn-3d-primary btn-3d-small" disabled={saving}>
              {saving ? "Guardando..." : "Guardar tarea"}
            </button>
          </div>
        </form>
      </div>

      <div
        id="visualizar-tareas"
        className={`insert-card menu-panel text-start ${showView ? "is-open" : ""}`}
        role="region"
        aria-hidden={!showView}
      >
        <div className="d-flex justify-content-end mb-2">
          <button
            type="button"
            className="btn-3d btn-3d-secondary btn-3d-small"
            onClick={() => {
              setShowView(false);
              setShowResults(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Cerrar
          </button>
        </div>
        <div className="mb-3">
          <label className="form-label text-light" htmlFor="ver-fecha">
            Ver por día
          </label>
          <div className="d-flex flex-column flex-sm-row gap-2">
            <input
              id="ver-fecha"
              type="date"
              className="form-control form-control-lg"
              value={viewDate}
              onChange={(event) => setViewDate(event.target.value)}
            />
            <button
              type="button"
              className="btn-3d btn-3d-secondary btn-3d-small"
              onClick={() => exportDayPdf(viewDate)}
              disabled={!viewDate}
            >
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label text-light">Ver por rango</label>
          <div className="d-flex flex-column flex-sm-row gap-2 mb-2">
            <input
              type="date"
              className="form-control form-control-lg"
              value={rangeStart}
              onChange={(event) => setRangeStart(event.target.value)}
            />
            <input
              type="date"
              className="form-control form-control-lg"
              value={rangeEnd}
              onChange={(event) => setRangeEnd(event.target.value)}
            />
            <button
              type="button"
              className="btn-3d btn-3d-primary btn-3d-small"
              onClick={exportRangePdf}
              disabled={!rangeStart || !rangeEnd}
            >
              Exportar rango PDF
            </button>
          </div>
        </div>

        {errorMessage && <p className="text-warning mb-2">{errorMessage}</p>}
      </div>

      {showResults && (
        <div className="insert-card mt-4 mx-auto text-start is-open" role="region">
          <div className="d-flex justify-content-end mb-2">
            <button
              type="button"
              className="btn-3d btn-3d-secondary btn-3d-small"
              onClick={() => {
                setShowResults(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Cerrar
            </button>
          </div>
          <h2 className="h5 text-light mb-3">Resultados</h2>
          {loadingTasks ? (
            <p className="text-light">Cargando tareas...</p>
          ) : (
            <ul className="list-unstyled text-light">
              {tasks.length === 0 ? (
                <li>No hay tareas para mostrar.</li>
              ) : (
                tasks.map((item) => (
                  <li key={item.id} className="mb-3">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <input
                        type="checkbox"
                        checked={
                          pendingCompleted[item.id] !== undefined
                            ? pendingCompleted[item.id]
                            : Number(item.completed) === 1
                        }
                        onChange={(event) => markPendingCompleted(item.id, event.target.checked)}
                      />
                      <strong>{item.title}</strong>
                      <div className="d-flex gap-2 ms-auto">
                        {pendingCompleted[item.id] !== undefined && (
                          <button
                            type="button"
                            className="btn-3d btn-3d-primary btn-3d-small"
                            onClick={() => saveCompleted(item.id)}
                          >
                            Guardar
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-3d btn-3d-secondary btn-3d-small"
                          onClick={() => startEditDetails(item)}
                        >
                          Actualizar
                        </button>
                        <button
                          type="button"
                          className="btn-3d btn-3d-secondary btn-3d-small"
                          onClick={() => deleteTask(item.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="small text-light">
                      {item.details || "Sin detalles"}
                    </div>
                    <div className="small text-light">
                      {item.task_date}
                    </div>
                    {editingTaskId === item.id && (
                      <div className="mt-2">
                        <label className="form-label text-light" htmlFor={`editar-detalle-${item.id}`}>
                          Editar detalle
                        </label>
                        <textarea
                          id={`editar-detalle-${item.id}`}
                          className="form-control form-control-lg mb-2"
                          rows="3"
                          value={editDetails}
                          onChange={(event) => setEditDetails(event.target.value)}
                        />
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn-3d btn-3d-primary btn-3d-small"
                            onClick={() => saveDetails(item.id)}
                          >
                            Actualizar
                          </button>
                          <button
                            type="button"
                            className="btn-3d btn-3d-secondary btn-3d-small"
                            onClick={cancelEditDetails}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
