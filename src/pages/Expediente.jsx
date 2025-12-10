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
      .then(data => {
        console.log("Ciudades cargadas:", data);
        setCiudades(data);
      })
      .catch(err => {
        console.error("Error cargando ciudades:", err);
      });

    // Todos los abogados
    fetch("http://localhost:8000/api/abogados/")
      .then(res => res.json())
      .then(data => {
        console.log("Abogados cargados:", data);
        setAbogados(data);
      })
      .catch(err => {
        console.error("Error cargando abogados:", err);
      });
  }, []);

  // ===== Cargar datos cuando cambia el caso =====
  useEffect(() => {
    if (!caso) {
      setExpedientes([]);
      return;
    }

    console.log("Caso recibido:", caso);

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
    setSePuedeEditar(!caso.caso?.fin);
  }, [caso]);

  // ===== Actualizar entidades cuando cambia la ciudad =====
  useEffect(() => {
    const exp = expedientes[indiceActual];
    if (!exp?.ciudad) {
      setEntidades([]);
      return;
    }

    console.log("Cargando entidades para ciudad:", exp.ciudad);
    fetch(`http://localhost:8000/api/entidades/?ciudad=${exp.ciudad}`)
      .then(res => res.json())
      .then(data => {
        console.log("Entidades cargadas:", data);
        setEntidades(data);
      })
      .catch(err => {
        console.error("Error cargando entidades:", err);
      });
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
    
    if (!caso || !caso.caso) {
      return alert("Debe seleccionar un caso primero");
    }
    
    if (!exp.abogado || !exp.ciudad || !exp.entidad) {
      return alert("Debe completar Abogado, Ciudad y Entidad");
    }

    const payload = {
      nocaso: caso.caso.nocaso,
      abogado: exp.abogado,
      ciudad: exp.ciudad,
      entidad: exp.entidad,
      noEtapa: exp.noEtapa
    };

    console.log("Guardando expediente:", payload);

    fetch("http://localhost:8000/api/guardar_expediente/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        console.log("Respuesta del servidor:", data);
        alert(data.mensaje);
        setExpedientes(prev =>
          prev.map((e, idx) =>
            idx === indiceActual ? { ...e, guardado: true, noExpediente: data.nuevoNo } : e
          )
        );
      })
      .catch(err => {
        console.error("Error al guardar:", err);
        alert("Error al guardar: " + err);
      });
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
      setIndiceActual(nuevaLista.length - 1);
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
  if (!caso) {
    return (
      <div className="expediente-container">
        <h2>Registro de Expediente</h2>
        <p style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
          Debe seleccionar un caso en la pestaña CASO para gestionar expedientes
        </p>
      </div>
    );
  }

  return (
    <div className="expediente-container">
      <h2>Registro de Expediente - Caso #{caso.caso?.nocaso}</h2>
      
      <div className="expediente-info">
        <p><strong>Etapa actual:</strong> {exp.noEtapa} de {expedientes.length}</p>
      </div>

      <div className="form-row">
        <label>Abogado</label>
        <select
          value={exp.abogado || ""}
          onChange={(e) => handleChange("abogado", e.target.value)}
          disabled={exp.guardado}
        >
          <option value="">Seleccione un abogado</option>
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
          disabled={exp.guardado}
        >
          <option value="">Seleccione una ciudad</option>
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
          disabled={exp.guardado || !exp.ciudad}
        >
          <option value="">Seleccione una entidad</option>
          {entidades.map(e => (
            <option key={e.cod} value={e.cod}>
              {e.nom}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label>Fecha Etapa</label>
        <input
          type="date"
          value={exp.fechaEtapa || ""}
          onChange={(e) => handleChange("fechaEtapa", e.target.value)}
          disabled={exp.guardado}
        />
      </div>

      <div className="button-group">
        <button onClick={guardarExpediente} disabled={exp.guardado} className="save-btn">
          Guardar Expediente
        </button>
        <button onClick={crearNuevaEtapa} className="new-btn">
          Crear Nueva Etapa
        </button>
        <button onClick={() => irA(-1)} disabled={indiceActual === 0} className="nav-btn">
          ◀ Anterior
        </button>
        <button onClick={() => irA(1)} disabled={indiceActual === expedientes.length - 1} className="nav-btn">
          Siguiente ▶
        </button>
      </div>
    </div>
  );
};

export default Expediente;