import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';
import './i18n'; 
import { useAlerta } from './AlertaContext.jsx'; 
import api from './api'; // Tu instancia configurada

function App() {
  const { mostrarAlerta } = useAlerta(); 

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("tokenAlma")); 
  const [pacientes, setPacientes] = useState([]);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [telefonoNuevo, setTelefonoNuevo] = useState("");

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [notaActual, setNotaActual] = useState("");
  const [resumenIA, setResumenIA] = useState("");
  const [cargandoIA, setCargandoIA] = useState(false);

  const [modoOscuro, setModoOscuro] = useState(localStorage.getItem("temaAlma") === "oscuro");

  const alternarTema = () => {
    const nuevoModo = !modoOscuro;
    setModoOscuro(nuevoModo);
    localStorage.setItem("temaAlma", nuevoModo ? "oscuro" : "claro");
  };

  useEffect(() => {
    if (token) obtenerPacientes();
  }, [token]);

  useEffect(() => {
    if (modoOscuro) {
      document.body.style.backgroundColor = "#121212";
    } else {
      document.body.style.backgroundColor = "#f0f2f5";
    }
  }, [modoOscuro]);

  // ======= 1. CORREGIDO PARA AXIOS =======
  const obtenerPacientes = async () => {
    try {
      const respuesta = await api.get("/pacientes", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      // Axios mete la respuesta exitosa directamente en .data
      setPacientes(respuesta.data);
    } catch (error) { 
      console.error("Error obteniendo pacientes:", error); 
    }
  };

  // ======= 2. SOLUCIÓN AL ERROR 400 (OAuth2 Form Format) =======
  const manejarLogin = async (evento) => {
    evento.preventDefault();
    try {
      // Convertimos los datos al formato x-www-form-urlencoded que exige FastAPI
      const datosFormulario = new URLSearchParams();
      datosFormulario.append('username', username);
      datosFormulario.append('password', password);

      const { data } = await api.post("/login", datosFormulario, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      setToken(data.tu_gafete_digital);
      localStorage.setItem("tokenAlma", data.tu_gafete_digital);
      setMensajeError(""); // Limpiamos errores previos
      
    } catch (error) {
      if (error.response && error.response.data) {
        setMensajeError(error.response.data.detail || "Credenciales incorrectas.");
      } else {
        setMensajeError("Error de conexión con el servidor.");
      }
    }
  };

  // ======= 3. CORREGIDO PARA AXIOS =======
  const registrarPaciente = async (e) => {
    e.preventDefault();
    try {
      await api.post("/pacientes", {
        nombre: nombreNuevo,
        telefono: telefonoNuevo
      });
      
      // Si Axios no lanza error, asumimos éxito (HTTP 200/201)
      setNombreNuevo("");
      setTelefonoNuevo("");
      obtenerPacientes();
      mostrarAlerta("exito", "Completado", "Paciente registrado con éxito.");
    } catch (error) { 
      if (error.response && error.response.data) {
        mostrarAlerta("error", "Error", error.response.data.detail || "No se pudo registrar el paciente.");
      } else {
        mostrarAlerta("error", "Error de red", "Error al registrar paciente");
      }
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("tokenAlma");
    setToken(null);
    setPacientes([]);
    setPacienteSeleccionado(null);
  };

  // ======= 4. CORREGIDO PARA AXIOS =======
  const analizarNotaConIA = async () => {
    if (!notaActual.trim()) {
      mostrarAlerta("error", "Campo Vacío", "Por favor, escribe algo en las notas antes de analizar.");
      return;
    }

    setCargandoIA(true);
    setResumenIA(""); 

    try {
      const citaId = 1; 
      
      const respuesta = await api.post(`/citas/${citaId}/reporte`, {
        notas_psicologo: notaActual
      }, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      // Axios parsea automáticamente el JSON en respuesta.data
      setResumenIA(respuesta.data.analisis_ia); 
      mostrarAlerta("exito", "¡Análisis Completado!", "Reporte clínico generado y guardado en la base de datos ✨");
    } catch (error) {
      console.error("Error conectando al servidor:", error);
      if (error.response && error.response.data) {
        mostrarAlerta("error", "Error", error.response.data.detail || "No se pudo generar el reporte");
      } else {
        mostrarAlerta("error", "Sin Conexión", "El servidor no responde. Verifica tu conexión o el backend.");
      }
    } finally {
      setCargandoIA(false);
    }
  };

  return (
    <div className={modoOscuro ? "app-wrapper modo-oscuro" : "app-wrapper"}>
      <button className="btn-tema" onClick={alternarTema}>
        {modoOscuro ? "☀️ Modo Claro" : "🌙 Modo Oscuro"}
      </button>

      {token ? (
        <div className="contenedor-panel">
          <header className="header-panel">
            <h1>ALMA 🧠</h1>
            <button className="btn-logout" onClick={cerrarSesion}>Cerrar Sesión</button>
          </header>
          
          <main className="contenido-principal">
            {pacienteSeleccionado ? (
              <section className="seccion-expediente">
                <button 
                  className="btn-volver" 
                  onClick={() => {
                    setPacienteSeleccionado(null);
                    setNotaActual(""); 
                    setResumenIA("");
                  }}
                >
                  ⬅ Volver a la lista
                </button>
                
                <div className="cabecera-paciente">
                  <h2>Expediente Clínico</h2>
                  <h3>{pacienteSeleccionado.nombre}</h3>
                  <p>📞 {pacienteSeleccionado.telefono}</p>
                </div>

                <div className="area-notas">
                  <h4>Notas de la Sesión</h4>
                  <textarea 
                    placeholder="Escribe aquí las observaciones clínicas del paciente durante la sesión..."
                    rows="6"
                    className="caja-notas"
                    value={notaActual}
                    onChange={(e) => setNotaActual(e.target.value)}
                  ></textarea>
                  
                  <div className="acciones-nota">
                    <button className="btn-guardar-nota">Guardar Nota Normal</button>
                    <button 
                      className="btn-ia" 
                      onClick={analizarNotaConIA}
                      disabled={cargandoIA}
                    >
                      {cargandoIA ? "🧠 Analizando..." : "✨ Analizar con IA"}
                    </button>
                  </div>

                  {resumenIA && (
                    <div className="tarjeta-ia">
                      <h4>🤖 Resumen y Análisis Clínico (Generado por IA)</h4>
                      <ReactMarkdown>{resumenIA}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <>
                <section className="seccion-registro">
                  <h2>Registrar Nuevo Paciente</h2>
                  <form onSubmit={registrarPaciente} className="form-registro">
                    <input type="text" placeholder="Nombre completo" value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} required />
                    <input type="text" placeholder="Teléfono" value={telefonoNuevo} onChange={(e) => setTelefonoNuevo(e.target.value)} required />
                    <button type="submit" className="btn-guardar">Agregar a la lista</button>
                  </form>
                </section>

                <section className="seccion-lista">
                  <h2>Expedientes en esta Clínica</h2>
                  <div className="grid-pacientes">
                    {pacientes.length === 0 ? <p>No hay pacientes registrados.</p> : 
                      pacientes.map((p) => (
                        <div key={p.id} className="tarjeta-paciente">
                          <h3>{p.nombre}</h3>
                          <p>📞 {p.telefono}</p>
                          <button 
                            className="btn-ver" 
                            onClick={() => setPacienteSeleccionado(p)}
                          >
                            Ver Expediente
                          </button>
                        </div>
                      ))
                    }
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      ) : (
        <div className="pantalla-login">
          <div className="tarjeta-login">
            <h1>ALMA 🧠</h1>
            <form onSubmit={manejarLogin}>
              {mensajeError && <p className="error">{mensajeError}</p>}
              <div className="grupo-input">
                <label>Usuario</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="grupo-input">
                <label>Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-entrar">Entrar al Sistema</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;