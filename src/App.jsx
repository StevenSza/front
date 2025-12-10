import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Caso from "./pages/Caso";
import Expediente from "./pages/Expediente";

function App() {
  return (
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/caso" />} />
        <Route path="/caso" element={<Caso />} />
        <Route path="/expediente" element={<Expediente />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
