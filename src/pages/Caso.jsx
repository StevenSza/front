  import React, { useState, useEffect } from "react";
  import "../styles/Caso.css";

const Caso = () => {
  const [casoSeleccionado, setCasoSeleccionado] = useState(null); // nuevo estado
  const [listaExpedientes, setListaExpedientes] = useState([]);
  const [nombreBusqueda, setNombreBusqueda] = useState("");
  const [apellidoBusqueda, setApellidoBusqueda] = useState("");
  const [cliente, setCliente] = useState(null);
  const [documento, setDocumento] = useState("");
  const [casosCliente, setCasosCliente] = useState([]);
  const [formCaso, setFormCaso] = useState({
    numero: "",
    fechaInicio: "",
    fechaFin: "",
    especializacion: "",
    valor: ""
  });
  const [esNuevoCaso, setEsNuevoCaso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [especializaciones, setEspecializaciones] = useState([]);

  // Traer especializaciones al montar el componente
  useEffect(() => {
    const fetchEspecializaciones = async () => {
      const res = await fetch("http://localhost:8000/api/caso/especializaciones/");
      const data = await res.json();
      setEspecializaciones(data);
    };
    fetchEspecializaciones();
  }, []);

  // Buscar cliente
const buscarCliente = async () => {
  if (!nombreBusqueda || !apellidoBusqueda) return alert("Debe ingresar nombre y apellido");

  setLoading(true);
  try {
    const res = await fetch("http://localhost:8000/api/caso/buscar_cliente/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomcliente: nombreBusqueda,
        apellcliente: apellidoBusqueda
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Error al buscar cliente");
    }

    const data = await res.json();

    setCliente(data.cliente);
    setDocumento(data.cliente.doc || "");
    setCasosCliente(data.casos_cliente || []);

    // Formatear la fecha para el input type="date"
    const formatoFecha = (fecha) => fecha ? fecha.split("T")[0] : "";

    if (data.caso_activo) {
      setFormCaso({
        numero: data.caso_activo.nocaso,
        fechaInicio: formatoFecha(data.caso_activo.inicio),
        especializacion: data.caso_activo.esp || "",
        valor: data.caso_activo.valor ?? "", // si es null, poner string vacío
        fechaFin: formatoFecha(data.caso_activo.fin)
      });
      setEsNuevoCaso(false);
    } else {
      setFormCaso({
        numero: "",
        fechaInicio: "",
        fechaFin: "",
        especializacion: "",
        valor: ""
      });
      setEsNuevoCaso(true);
    }

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
  setLoading(false);
};


  // Seleccionar caso del desplegable
const seleccionarCaso = async (e) => {
  const nocaso = parseInt(e.target.value, 10); 
  if (!nocaso) {
    setFormCaso({ numero: "", fechaInicio: "", fechaFin: "", especializacion: "", valor: "" });
    setEsNuevoCaso(true);
    setCasoSeleccionado(null); // limpiar caso
    return;
  }

  try {
    // Buscar datos del caso en tu lista de casos del cliente
    const casoLocal = casosCliente.find(c => c.nocaso === nocaso);
    if (!casoLocal) return;

    setFormCaso({
      numero: casoLocal.nocaso,
      fechaInicio: casoLocal.inicio.split("T")[0],
      fechaFin: casoLocal.fin ? casoLocal.fin.split("T")[0] : "",
      especializacion: casoLocal.especializacion || casoLocal.esp || "",
      valor: casoLocal.valor ?? ""
    });
    setEsNuevoCaso(false);

    // Traer expedientes desde backend
    const res = await fetch(`http://localhost:8000/api/caso/buscar_caso/${nocaso}`);
    const data = await res.json();

    // Construir objeto que espera Expediente.jsx
    setCasoSeleccionado({
      caso: data.caso,               // <-- aquí va el objeto del caso
      lista_expedientes: data.lista_expedientes || []
    });

    console.log("Caso seleccionado:", data);

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};




  // Crear nuevo caso
// Crear nuevo caso
const crearNuevoCaso = async () => {
  if (!cliente) return alert("Debe buscar primero un cliente");

  try {
    const res = await fetch("http://localhost:8000/api/caso/crear_caso/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        codcliente: cliente.cod,
        nomcliente: cliente.nom,
        apellcliente: cliente.ape,
        ndocumento: cliente.doc
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Error al crear el caso");
    }

    const data = await res.json();
    
    // Actualizar el formulario con el nuevo caso
    setFormCaso({
      numero: data.nocaso,
      fechaInicio: new Date().toISOString().split("T")[0], // fecha de hoy
      fechaFin: "",
      especializacion: "",
      valor: ""
    });

    setEsNuevoCaso(true);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

// Guardar caso
const guardarCaso = async () => {
  if (!formCaso.numero || !formCaso.especializacion || !formCaso.valor) {
    return alert("Todos los campos son obligatorios");
  }

  try {
    const res = await fetch("http://localhost:8000/api/caso/guardar_caso/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nocaso: formCaso.numero,
        codcliente: cliente.cod,
        especializacion: formCaso.especializacion,
        valor: formCaso.valor
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error al guardar el caso");
    }

    alert(data.mensaje);

    // Actualizar la lista de casos del cliente y limpiar formulario
    buscarCliente();
    setEsNuevoCaso(false);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};



  return (
    <div className="caso-container">
      {/* ---------------- COLUMNA IZQUIERDA: CASO ---------------- */}
      <div className="columna">
        <label>No. Caso</label>
        <div className="fila-label-btn">
          <select disabled={!cliente} value={formCaso.numero} onChange={seleccionarCaso}>
            <option value="">Seleccione caso</option>
            {casosCliente.map((c) => (
              <option key={c.nocaso} value={c.nocaso}>
                Caso {c.nocaso}
              </option>
            ))}
          </select>

          <button className="btn-crear-caso" onClick={crearNuevoCaso}>
            Crear
          </button>
        </div>

        <label>Fecha Inicio</label>
        <input
          type="date"
          disabled={!esNuevoCaso}
          value={formCaso.fechaInicio}
          onChange={(e) => setFormCaso({ ...formCaso, fechaInicio: e.target.value })}
        />

        <label>Fecha Fin</label>
        <input type="date" disabled value={formCaso.fechaFin || ""} />

        <label>Especialización</label>
        <select
          disabled={!esNuevoCaso}
          value={formCaso.especializacion}
          onChange={(e) => setFormCaso({ ...formCaso, especializacion: e.target.value })}
        >
          <option value="">Seleccione</option>
          {especializaciones.map((esp) => (
            <option key={esp.codigo} value={esp.codigo}>
              {esp.nombre}
            </option>
          ))}
        </select>

        <label>Valor</label>
        <div className="fila-valor">
          <input
            type="number"
            disabled={!esNuevoCaso}
            value={formCaso.valor}
            onChange={(e) => setFormCaso({ ...formCaso, valor: e.target.value })}
          />
          <button className="btn-acuerdo">Acuerdo Pago</button>
        </div>
      </div>

      {/* ---------------- COLUMNA DERECHA: CLIENTE ---------------- */}
      <div className="columna">
        <label>Cliente</label>
        <div className="fila-input">
          <input
            type="text"
            value={cliente ? cliente.nom : nombreBusqueda}
            onChange={(e) => setNombreBusqueda(e.target.value)}
            placeholder="Nombre del cliente"
          />
          <input
            type="text"
            value={cliente ? cliente.ape : apellidoBusqueda}
            onChange={(e) => setApellidoBusqueda(e.target.value)}
            placeholder="Apellido del cliente"
          />

          <button className="btn-lupa" onClick={buscarCliente}>
            🔍
          </button>

          <button className="btn-crear-cliente">Crear</button>
        </div>

        <label>Documento</label>
        <input type="text" value={documento} disabled />

        <button className="btn-guardar" onClick={guardarCaso}>
          Guardar
        </button>
      </div>

      {loading && <p>Cargando...</p>}
    </div>
  );
};

export default Caso;
