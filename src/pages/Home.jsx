import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../estilos/estilos.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container text-center mt-5">
      <h1 className="mb-4">Bienvenidos a mi web personal</h1>
      <p className="lead mb-4">
        Hola! Soy Lluís Espert Cuquerella. Esta es mi página web personal donde comparto mis proyectos y mi currículum.
      </p>
    </div>
  );
}

export default Home;