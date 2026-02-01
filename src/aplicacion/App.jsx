import React from 'react'
import { useState } from 'react'
import '../estilos/estilos.css';
import ScrollToTop from "../components/ScrollToTop.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from '../pages/Home.jsx';

function App() {
  

  return (
    <Router>
      <ScrollToTop>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </ScrollToTop>
    </Router>
  )
}

export default App
