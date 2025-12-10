import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Caso from "./pages/Caso";
import Expediente from "./pages/Expediente";

function App() {
  const [casoSeleccionado, setCasoSeleccionado] = useState(null);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/caso" />} />
        <Route 
          path="/caso" 
          element={<Caso onCasoSeleccionado={setCasoSeleccionado} />} 
        />
        <Route 
          path="/expediente" 
          element={<Expediente caso={casoSeleccionado} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;