import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("tokenAlma")); 
  const [pacientes, setPacientes] = useState([]);
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [telefonoNuevo, setTelefonoNuevo] = useState("");


  // --- NUEVO: ¿Qué paciente estamos viendo en el consultorio? ---
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    // --- NUEVO: ESTADOS PARA EL EXPEDIENTE Y LA IA ---
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

  const obtenerPacientes = async () => {
    try {
      const respuesta = await fetch("http://127.0.0.1:8000/pacientes", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (respuesta.ok) {
        const data = await respuesta.json();
        setPacientes(data);
      }
    } catch (error) { console.error("Error", error); }
  };

  const manejarLogin = async (evento) => {
    evento.preventDefault();
    try {
      const respuesta = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }) 
      });
      const data = await respuesta.json();
      if (respuesta.ok) {
        setToken(data.tu_gafete_digital);
        localStorage.setItem("tokenAlma", data.tu_gafete_digital);
      } else { setMensajeError(data.detail); }
    } catch (error) { setMensajeError("Error de conexión."); }
  };

  const registrarPaciente = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await fetch("http://127.0.0.1:8000/pacientes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ nombre: nombreNuevo, telefono: telefonoNuevo })
      });
      if (respuesta.ok) {
        setNombreNuevo("");
        setTelefonoNuevo("");
        obtenerPacientes();
      }
    } catch (error) { alert("Error al registrar paciente"); }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("tokenAlma");
    setToken(null);
    setPacientes([]);
    setPacienteSeleccionado(null); // Limpiamos el consultorio al salir
  };

  // --- NUEVO: FUNCIÓN PARA PEDIRLE EL RESUMEN A LA IA ---
  const analizarNotaConIA = async () => {
    if (!notaActual.trim()) {
      alert("Por favor, escribe algo en las notas antes de analizar.");
      return;
    }

    setCargandoIA(true);
    setResumenIA(""); 

    try {
      // 1. Ajustamos la URL a tu ruta real: /citas/{id}/reporte
      // Por ahora usaremos un ID de cita temporal (ej: 1), luego lo haremos dinámico
      const citaId = 1; 
      
      const respuesta = await fetch(`http://127.0.0.1:8000/citas/${citaId}/reporte`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        // 2. Ajustamos el nombre del campo a 'notas_psicologo' como pide tu schemas.ReporteCreate
        body: JSON.stringify({ 
          notas_psicologo: notaActual 
        })
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        // 3. Tu backend devuelve el objeto reporte, extraemos 'analisis_ia'
        setResumenIA(data.analisis_ia); 
        alert("Reporte clínico generado y guardado en la base de datos ✨");
      } else {
        alert("Error: " + (data.detail || "No se pudo generar el reporte"));
      }
    } catch (error) {
      console.error("Error conectando al servidor:", error);
      alert("El servidor no responde. Verificá que Uvicorn esté corriendo.");
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
            
            {/* RENDERIZADO CONDICIONAL: ¿Estamos en el Expediente o en la Lista? */}
            {pacienteSeleccionado ? (
              
            /* ====== VISTA 2: EL CONSULTORIO (EXPEDIENTE) ====== */
              <section className="seccion-expediente">
                <button 
                  className="btn-volver" 
                  onClick={() => {
                    setPacienteSeleccionado(null);
                    setNotaActual(""); // Limpiamos la nota al salir
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

                {/* Si la IA nos devuelve un resumen, mostramos esta tarjeta */}
                  {resumenIA && (
                    <div className="tarjeta-ia">
                      <h4>🤖 Resumen y Análisis Clínico (Generado por IA)</h4>
                      {/* Magia aquí: ReactMarkdown traduce los asteriscos a HTML real */}
                      <ReactMarkdown>{resumenIA}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </section>

            ) : (

              /* ====== VISTA 1: LA RECEPCIÓN (LISTA Y REGISTRO) ====== */
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
                          {/* NUEVO: Al hacer clic, guardamos a este paciente en la memoria */}
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


/*1. Iniciar Git en tu carpeta*/
git init

/* 2. Agregar todos tus archivos (el punto es importante)*/
git add .

# 3. Empaquetarlos con un mensaje
git commit -m "Primer commit: Interfaz de Recepción y Expediente con IA"

# 4. Asegurar que la rama principal se llame 'main'
git branch -M main

# 5. Conectar tu carpeta local con el repositorio de GitHub
# OJO: Cambia este enlace por el que te dio TU GitHub en la página de alma-frontend
git remote add origin https://github.com/TU_USUARIO/alma-frontend.git

# 6. Subir todo a la nube
git push -u origin main