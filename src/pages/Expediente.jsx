import React, { useState, useEffect } from "react";
import "../styles/Expediente.css";

const Expediente = ({ caso }) => {
  const [expedientes, setExpedientes] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [sePuedeEditar, setSePuedeEditar] = useState(true);

  const [abogados, setAbogados] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [impugnaciones, setImpugnaciones] = useState([]);

  // ===== Cargar datos globales: abogados y ciudades =====
  useEffect(() => {
    // Todas las ciudades
    fetch("http://localhost:8000/api/ciudades/")
      .then(res => res.json())
      .then(setCiudades)
      .catch(console.error);

    // Todos los abogados
    fetch("http://localhost:8000/api/abogados/")
      .then(res => res.json())
      .then(setAbogados)
      .catch(console.error);
  }, []);

  // ===== Cargar datos cuando cambia el caso =====
  useEffect(() => {
    if (!caso) {
      setExpedientes([]);
      return;
    }

    // Si hay expedientes desde el backend, los usamos
    if (caso.lista_expedientes && caso.lista_expedientes.length > 0) {
      const expBackend = caso.lista_expedientes.map(e => ({
        noExpediente: e.consec || "",
        noEtapa: e.etapa || 1,
        fechaEtapa: e.fecha ? e.fecha.split("T")[0] : new Date().toISOString().split("T")[0],
        abogado: e.abogado || "",
        ciudad: e.lugar || "",
        entidad: "",
        impugnacion: "",
        suceso: "",
        resultado: "",
        documentos: [],
        guardado: true
      }));
      setExpedientes(expBackend);
    } else {
      // Primer expediente vacío
      setExpedientes([{
        noExpediente: "",
        noEtapa: 1,
        fechaEtapa: new Date().toISOString().split("T")[0],
        abogado: "",
        ciudad: "",
        entidad: "",
        impugnacion: "",
        suceso: "",
        resultado: "",
        documentos: [],
        guardado: false
      }]);
    }

    setIndiceActual(0);
    setSePuedeEditar(!caso.fin);
  }, [caso]);

  // ===== Actualizar entidades cuando cambia la ciudad =====
  useEffect(() => {
    const exp = expedientes[indiceActual];
    if (!exp?.ciudad) {
      setEntidades([]); // limpiar si no hay ciudad
      return;
    }

    fetch(`http://localhost:8000/api/entidades/?ciudad=${exp.ciudad}`)
      .then(res => res.json())
      .then(setEntidades)
      .catch(console.error);
  }, [expedientes, indiceActual]);

  // ===== Handlers =====
  const handleChange = (field, value) => {
    setExpedientes(prev =>
      prev.map((e, idx) => (idx === indiceActual ? { ...e, [field]: value } : e))
    );
  };

  const handleFileChange = (e) => handleChange("documentos", Array.from(e.target.files));

  const guardarExpediente = () => {
    const exp = expedientes[indiceActual];
    if (!exp.abogado || !exp.ciudad || !exp.entidad) {
      return alert("Debe completar Abogado, Ciudad y Entidad");
    }

    const payload = { ...exp, nocaso: caso?.nocaso };
    fetch("http://localhost:8000/api/expediente/guardar_expediente/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        alert(data.mensaje);
        setExpedientes(prev =>
          prev.map((e, idx) =>
            idx === indiceActual ? { ...e, guardado: true, noExpediente: data.nuevoNo } : e
          )
        );
      })
      .catch(err => alert("Error al guardar: " + err));
  };

  const crearNuevaEtapa = () => {
    const expActual = expedientes[indiceActual];

    const nuevaEtapa = {
      noExpediente: "",
      noEtapa: expActual ? expActual.noEtapa + 1 : 1,
      fechaEtapa: new Date().toISOString().split("T")[0],
      abogado: "",
      ciudad: "",
      entidad: "",
      impugnacion: "",
      suceso: "",
      resultado: "",
      documentos: [],
      guardado: false
    };

    setExpedientes(prev => {
      const nuevaLista = [...prev, nuevaEtapa];
      setIndiceActual(nuevaLista.length - 1); // apunta a la nueva etapa correctamente
      return nuevaLista;
    });
  };

  const irA = (delta) => {
    const nuevoIndice = indiceActual + delta;
    if (nuevoIndice < 0 || nuevoIndice >= expedientes.length) return;
    setIndiceActual(nuevoIndice);
  };

  const exp = expedientes[indiceActual] || {};

  // ===== Render =====
  return (
    <div className="expediente-container">
      <h2>Registro de Expediente</h2>

      <div className="form-row">
        <label>Abogado</label>
        <select
          value={exp.abogado || ""}
          onChange={(e) => handleChange("abogado", e.target.value)}
        >
          <option value="">Seleccione</option>
          {abogados.map(a => (
            <option key={a.ced} value={a.ced}>
              {a.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Ciudad</label>
        <select
          value={exp.ciudad || ""}
          onChange={(e) => handleChange("ciudad", e.target.value)}
        >
          <option value="">Seleccione</option>
          {ciudades.map(c => (
            <option key={c.cod} value={c.cod}>
              {c.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Entidad</label>
        <select
          value={exp.entidad || ""}
          onChange={(e) => handleChange("entidad", e.target.value)}
        >
          <option value="">Seleccione</option>
          {entidades.map(e => (
            <option key={e.cod} value={e.cod}>
              {e.nom}
            </option>
          ))}
        </select>
      </div>

      <button onClick={crearNuevaEtapa}>Crear Nueva Etapa</button>
      <button onClick={guardarExpediente}>Guardar</button>
      <button onClick={() => irA(-1)} disabled={indiceActual === 0}>◀ Anterior</button>
      <button onClick={() => irA(1)} disabled={indiceActual === expedientes.length - 1}>Siguiente ▶</button>
    </div>
  );
};

export default Expediente;
