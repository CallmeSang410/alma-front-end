import React, { useState, useEffect, useMemo } from 'react';
import { Clock, FileText, DollarSign, UserCheck, UserPlus, FileWarning, CalendarX, PieChart, X, CheckCircle2 } from 'lucide-react';
import { createPortal } from 'react-dom';



const Dashboard = ({ onNavigateToReportes }) => {
    // ================= ESTADOS =================
    // ✅ Como debe quedar
    const [pacientesInactivos, setPacientesInactivos] = useState([]);
   
   // Estado para abrir/cerrar la ventana flotante
    const [modalReportesAbierto, setModalReportesAbierto] = useState(false);
     // 🌟 NUEVO ESTADO: Memoria para los datos reales del backend
    const [datosKpi, setDatosKpi] = useState({
        pacientes: { total: "...", crecimiento: "Calculando..." },
        expedientes: { pendientes: "...", lista: [] } // 🌟 Agregamos "lista: []" aquí
    });
    const [citasHoy, setCitasHoy] = useState([]);
    const [motivosConsulta, setMotivosConsulta] = useState([]);
    const [modalHistorialAbierto, setModalHistorialAbierto] = useState(false);
    const descartarAviso = (id) => {
        setPacientesInactivos(prev => prev.filter(paciente => paciente.id !== id));
    };

    // 🌟 NUEVO MOTOR: Conexión con FastAPI al cargar el Dashboard
   useEffect(() => {
    const cargarDatosArriba = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const baseUrl = `http://${window.location.hostname}:8000`;

        try {
            // 1. 🌟 NUEVO: Agregamos el cuarto fetch al Promise.all
           const [resPacientes, resExpedientes, resAgenda, resMotivos, resAlertas] = await Promise.all([
                fetch(`${baseUrl}/dashboard/pacientes-activos`, { headers }),
                fetch(`${baseUrl}/dashboard/expedientes-pendientes`, { headers }),
                fetch(`${baseUrl}/dashboard/agenda-hoy`, { headers }),
                fetch(`${baseUrl}/estadisticas/motivos-distribucion`, { headers }),
                fetch(`${baseUrl}/dashboard/alertas-inactividad`, { headers }) // 👈 NUEVO
            ]);

            // 2. Guardamos los números de las tarjetas de arriba (KPIs)
            if (resPacientes.ok && resExpedientes.ok) {
                const dataPacientes = await resPacientes.json();
                const dataExpedientes = await resExpedientes.json();

                setDatosKpi({
                    pacientes: {
                        total: dataPacientes.total,
                        crecimiento: dataPacientes.crecimiento_mes,
                        historial: dataPacientes.historial || {}
                    },
                   expedientes: {
                        pendientes: dataExpedientes.cantidad_pendientes,
                        lista: dataExpedientes.detalles || [] 
                    }
                });
            }

            // 3. Guardamos la línea de tiempo de abajo
            if (resAgenda.ok) {
                const dataAgenda = await resAgenda.json();
                setCitasHoy(dataAgenda);
            }

            // 4. 🌟 NUEVO: Procesamos los motivos que calculó tu base de datos
            if (resMotivos.ok) {
                const dataMotivos = await resMotivos.json();
                
                // Mapeamos los colores que ya tenías definidos arriba en tu diseño
                const coloresBw = ['bg-emerald-500', 'bg-teal-400', 'bg-blue-400', 'bg-indigo-400'];
                
                const datosFormateados = dataMotivos.map((item, index) => ({
                    motivo: item.motivo,
                    porcentaje: item.porcentaje,
                    color: coloresBw[index % coloresBw.length] // Asigna color según la posición
                }));

                setMotivosConsulta(datosFormateados);
            }
            if (resAlertas.ok) {
                    const dataAlertas = await resAlertas.json();
                    setPacientesInactivos(dataAlertas);
                }

        } catch (error) {
            console.error("Error de red cargando el dashboard:", error);
        }
    };

        cargarDatosArriba();
    }, []);

        // ================= KPIs CLÍNICOS (Conectados al Estado Mágico) =================
    const crecimientoStr = datosKpi.pacientes.crecimiento || "0%";
    let colorCrecimiento = "text-slate-400 font-medium"; // Gris por defecto si es 0%

    if (crecimientoStr.startsWith('+')) {
        colorCrecimiento = "text-[#0D9488] font-bold"; // Verde si creció
    } else if (crecimientoStr.startsWith('-')) {
        colorCrecimiento = "text-rose-500 font-bold";  // Rojo si cayó
    }

        const clinicaStats = [
            { 
                title: "Pacientes Activos", 
                value: datosKpi.pacientes.total,        // 🌟 DATO REAL
                trend: `${crecimientoStr} vs mes anterior`,  // 🌟 DATO REAL (Ej: "+15% vs mes anterior")
                trendColor: colorCrecimiento,           // 🎨 COLOR DINÁMICO
                icon: <UserCheck className="w-6 h-6" strokeWidth={2} />, 
                color: "text-[#0D9488]", 
                bg: "bg-teal-50", 
                hasSparkline: true ,
                // 🌟 AGREGAMOS EL BOTÓN AQUÍ:
                actionButton: "VER HISTORIAL MENSUAL",
                onActionClick: () => setModalHistorialAbierto(true),
                // 🌟 AGREGAMOS ESTO: Le decimos explícitamente que NO es una alerta 
        // para que no agarre el color rojo por defecto en tu .map de abajo
                isAlert: false, 
                buttonColorOverride: "bg-teal-600 hover:bg-teal-700 shadow-teal-600/20"
            },
        { 
            title: "Expedientes por Actualizar", 
            value: datosKpi.expedientes.pendientes, // 🌟 DATO REAL
            trend: "Más de 24h sin notas clínicas",
            trendColor: "text-rose-500 font-bold", 
            icon: <FileWarning className="w-6 h-6" strokeWidth={2} />, 
            color: "text-rose-600", 
            bg: "bg-rose-50",
            actionButton: "Redactar Reportes Ahora",
            isAlert: true,
            onActionClick: () => setModalReportesAbierto(true)
        }
    ];

    // ================= SALUD DEL CONSULTORIO (Negocio) =================
    const businessStats = [
        { title: "Ingresos Estimados (Mes)", value: "$3,450", trend: "+15% vs mes anterior", icon: <DollarSign size={20}/>, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Tasa de Retención", value: "82%", trend: "Agendaron 2da sesión", icon: <UserCheck size={20}/>, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Nuevos Pacientes", value: "12", trend: "Expedientes abiertos este mes", icon: <UserPlus size={20}/>, color: "text-indigo-600", bg: "bg-indigo-50" }
    ];
    // 🧠 MEMORIA: Calculamos y ordenamos el historial una sola vez, no cada vez que se abre el modal
    const historialOrdenado = useMemo(() => {
        const historial = datosKpi.pacientes?.historial;
        if (!historial || Object.keys(historial).length === 0) return [];
        
        return Object.entries(historial).sort((a, b) => {
            const [mesA, anioA] = a[0].split('-');
            const [mesB, anioB] = b[0].split('-');
            return new Date(anioB, mesB - 1) - new Date(anioA, mesA - 1);
        });
    }, [datosKpi.pacientes?.historial]);
    return (
        <>
            <div className="space-y-8 relative animate-fade-in pb-10">
                
                {/* CABECERA */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-[#113130] tracking-tight">Bienvenido, Dr. Administrador</h1>
                        <p className="text-slate-500 text-sm mt-1">Resumen de tu jornada clínica y estado del consultorio.</p>
                    </div>
                </div>

                {/* ================= KPIs CLÍNICOS (Top) ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {clinicaStats.map((stat, index) => (
                        <div key={index} className={`p-6 rounded-[1.5rem] shadow-sm border transition-shadow flex flex-col justify-between h-full ${stat.isAlert ? 'bg-rose-50/30 border-rose-100' : 'bg-white border-slate-100 hover:shadow-md'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${stat.isAlert ? 'text-rose-600' : 'text-slate-500'}`}>{stat.title}</p>
                                    <h3 className="text-4xl font-black text-[#113130]">{stat.value}</h3>
                                </div>
                                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    {stat.icon}
                                </div>
                            </div>
                            
                            <div className="mt-2 flex flex-col justify-end flex-1">
                                {stat.hasSparkline && (
                                    <div className="w-full h-12 mt-2 mb-3 relative overflow-hidden">
                                        <svg viewBox="0 0 100 30" className="w-full h-full drop-shadow-sm" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#0D9488" stopOpacity="0.25" />
                                                    <stop offset="100%" stopColor="#0D9488" stopOpacity="0.01" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M0,25 C20,25 30,18 50,18 C70,18 85,5 100,5 L100,30 L0,30 Z" fill="url(#fillGrad)" />
                                            <path d="M0,25 C20,25 30,18 50,18 C70,18 85,5 100,5" fill="none" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                                
                                <p className={`text-xs mt-auto ${stat.trendColor}`}>{stat.trend}</p>

                               {stat.actionButton && (
                        <button 
                            onClick={stat.onActionClick}
                            disabled={stat.isAlert && datosKpi.expedientes?.pendientes === 0}
                            className={`mt-4 w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 text-white shadow-md ${
                                stat.isAlert 
                                    ? (datosKpi.expedientes?.pendientes === 0 
                                        ? 'bg-rose-300 shadow-none cursor-not-allowed' 
                                        : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20')
                                    : (stat.buttonColorOverride || 'bg-slate-800 hover:bg-slate-900') // 👈 Usa el color personalizado (Teal) o un gris oscuro por defecto
                            }`}
                        >
                            {stat.actionButton}
                        </button>
                    )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ================= SALUD DEL CONSULTORIO (Métricas de Negocio) ================= */}
                <div className="bg-[#113130] rounded-3xl p-6 sm:p-8 shadow-md">
                    <div className="mb-6">
                        <h2 className="text-lg font-black text-white">Salud del Consultorio</h2>
                        <p className="text-xs text-teal-200/70 font-medium mt-1">Métricas financieras y de crecimiento del mes actual.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {businessStats.map((biz, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:bg-white/15 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2.5 rounded-xl ${biz.bg} ${biz.color}`}>
                                        {biz.icon}
                                    </div>
                                    <span className="text-white text-2xl font-black">{biz.value}</span>
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-teal-100 uppercase tracking-wider">{biz.title}</p>
                                    <p className="text-xs text-teal-200/60 mt-1 font-medium">{biz.trend}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= LÍNEA DE TIEMPO HORIZONTAL DE CITAS ================= */}
                <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden relative">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-lg font-black text-[#113130]">Agenda del Día</h2>
                            <p className="text-xs text-slate-500 font-medium mt-1">Línea de tiempo de tus citas confirmadas.</p>
                        </div>
                    </div>
                    
                    <div className="relative w-full overflow-x-auto pb-6 scrollbar-thin">
                        <div className="flex min-w-max gap-8 px-2 pt-2 relative">
                            {/* Línea horizontal central */}
                            <div className="absolute top-[12px] left-0 right-0 h-[2px] bg-slate-100 z-0"></div>
                            
                            {citasHoy?.map((cita) => {
                                const isCompletada = cita.estado === 'completada';
                                const isEnCurso = cita.estado === 'en_curso';
                                const colorDot = isCompletada ? 'bg-emerald-500 border-emerald-500' : isEnCurso ? 'bg-amber-400 border-amber-400 animate-pulse' : 'bg-slate-300 border-slate-300';
                                const cardBg = isEnCurso ? 'bg-teal-50/50 border-[#0F766E]/20' : 'bg-white border-slate-100 hover:border-slate-300';

                                return (
                                    <div key={cita.id} className="relative z-10 w-64 flex flex-col gap-4 group">
                                        {/* Punto y Hora */}
                                        <div className="flex items-center gap-3 bg-white pr-3 w-fit">
                                            <div className={`w-5 h-5 rounded-full border-4 ring-4 ring-white transition-colors duration-300 ${colorDot}`}></div>
                                            <span className={`text-sm font-black transition-colors ${isEnCurso ? 'text-[#0F766E]' : 'text-slate-600 group-hover:text-[#113130]'}`}>{cita.hora}</span>
                                        </div>
                                        
                                        {/* Tarjeta */}
                                        <div className={`p-4 rounded-2xl border transition-all duration-300 shadow-xs group-hover:shadow-sm ${cardBg}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-bold text-[#113130] text-sm truncate pr-2">{cita.paciente}</h4>
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                                                    isCompletada ? 'bg-emerald-100 text-emerald-700' : 
                                                    isEnCurso ? 'bg-[#0F766E] text-white' : 'bg-slate-100 text-slate-500'
                                                }`}>
                                                    {cita.estado.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5"><FileText size={13}/> {cita.tipo}</p>
                                                <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5"><Clock size={13}/> {cita.duracion}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

        {/* COLUMNA IZQ: MOTIVOS Y ALERTAS (Todo envuelto en un flex-col con gap-6) */}
<div className="flex flex-col gap-6 h-fit">

    {/* ======================= TARJETA 1: MOTIVOS DE CONSULTA ======================= */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6"> 
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-lg font-black text-[#113130] flex items-center gap-2">
                    <PieChart className="text-[#0F766E]" size={20} />
                    Distribución de Motivos
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1">Diagnósticos principales del mes actual.</p>
            </div>
        </div>

        <div className="space-y-4">
            {/* 🌟 EL CAMBIO MÁGICO: Usamos el estado dinámico y validamos si está vacío */}
            {motivosConsulta.length === 0 ? (
                <p className="text-sm text-slate-500 italic text-center py-4">No hay suficientes datos registrados aún.</p>
            ) : (
                motivosConsulta.map((item, idx) => (
                    <div key={idx} className="relative group">
                        <div className="flex justify-between text-sm font-bold mb-1.5">
                            <span className="text-slate-600 group-hover:text-[#113130] transition-colors">{item.motivo}</span>
                            <span className="text-[#113130]">{item.porcentaje}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                                style={{ width: `${item.porcentaje}%` }}
                            ></div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
    {/* ======================= FIN TARJETA 1 ======================= */}


    {/* ======================= TARJETA 2: PACIENTES INACTIVOS ======================= */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-6 h-fit">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-lg font-black text-[#113130] flex items-center gap-2">
                    <CalendarX className="text-rose-500" size={20} />
                    Alertas de Inactividad
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1">Pacientes con más de 30 días sin agendar.</p>
            </div>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">
                {pacientesInactivos.length} Alertas
            </span>
        </div>
        
        <div className="space-y-3">
            {pacientesInactivos.length > 0 ? (
                pacientesInactivos.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        <div>
                            <h4 className="text-sm font-bold text-[#113130] leading-tight">{patient.name}</h4>
                            <p className={`text-[10px] font-bold uppercase tracking-wider mt-1.5 inline-block px-2 py-0.5 rounded-md ${patient.color} ${patient.bg}`}>
                                Última cita: {patient.ultimaCita}
                            </p>
                        </div>
                        <button 
                            onClick={() => descartarAviso(patient.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Descartar aviso"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 text-slate-400">
                    <CheckCircle2 className="mx-auto text-emerald-400 mb-2" size={32} />
                    <p className="text-sm font-bold">¡Todo al día!</p>
                    <p className="text-xs">No hay pacientes en riesgo de inactividad.</p>
                </div>
            )}
        </div>
    </div>
    {/* ======================= FIN TARJETA 2 ======================= */}

</div>
{/* COLUMNA IZQ: FIN */}
                {/* ================= MODAL DE EXPEDIENTES PENDIENTES ================= */}
        {modalReportesAbierto && createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Fondo oscuro sin lag */}
                <div className="absolute inset-0 bg-[#113130]/80 transition-opacity" onClick={() => setModalReportesAbierto(false)} />
                
                {/* Tarjeta del Modal */}
                <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 sm:p-8 relative z-10 shadow-2xl animate-fade-in border border-rose-100">
                    
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-black text-[#113130] flex items-center gap-2">
                                <svg className="w-6 h-6 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                Reportes Pendientes
                            </h3>
                            <p className="text-sm text-slate-500 font-medium mt-1">Sesiones que pasaron hace más de 24 horas.</p>
                        </div>
                        <button onClick={() => setModalReportesAbierto(false)} className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
                        {datosKpi.expedientes.lista?.map((cita) => (
                            <div key={cita.cita_id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-rose-50/30 hover:border-rose-100 transition-colors flex justify-between items-center gap-4">
                                <div className="truncate">
                                    <h4 className="text-sm font-black text-[#113130] truncate">{cita.paciente_nombre}</h4>
                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <span>📅 {cita.fecha}</span>
                                        <span className="truncate">📝 {cita.motivo}</span>
                                    </div>
                                </div>
                               <button 
                                    onClick={() => {
                                        setModalReportesAbierto(false); // 1. Cerramos el modal para que no estorbe
                                        
                                        // 2. Disparamos la función que nos pasará el componente padre
                                        if (onNavigateToReportes) {
                                            onNavigateToReportes(cita.cita_id); 
                                        } else {
                                            console.warn("Falta conectar la navegación en el App.jsx");
                                        }
                                    }}
                                    className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-rose-600/20 transition-colors"
                                >
                                    Redactar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>, document.body
        )}
       {/* ================= MODAL DE HISTORIAL DE PACIENTES (Cero Blur, Cero Lag) ================= */}
{modalHistorialAbierto && createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4">
        {/* Le quitamos el blur y las transiciones pesadas, ahora es un pop-up directo */}
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-fade-in">
            
            {/* Header del modal */}
            <div className="bg-[#113130] p-5 flex justify-between items-center text-white">
                <div>
                    <h3 className="font-bold text-lg">Historial de Ingresos</h3>
                    <p className="text-teal-100/70 text-xs">Nuevos pacientes por mes</p>
                </div>
                <button 
                    onClick={() => setModalHistorialAbierto(false)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Lista de meses (Usando la memoria rápida que ya creamos) */}
            <div className="p-5 max-h-[60vh] overflow-y-auto">
                {historialOrdenado.length === 0 ? (
                    <div className="text-center py-6 text-slate-400">
                        <UserCheck className="mx-auto mb-2 opacity-50" size={32} />
                        <p className="text-sm">No hay registros históricos aún.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {historialOrdenado.map(([fechaStr, cantidad], idx) => {
                            const [mes, anio] = fechaStr.split('-');
                            const nombreMes = new Date(anio, mes - 1).toLocaleString('es-ES', { month: 'long' });
                            
                            return (
                                <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#0D9488] transition-colors">
                                    <span className="text-sm font-bold text-slate-700 capitalize">{nombreMes} {anio}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black text-[#0D9488]">+{cantidad}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Pacientes</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                <button 
                    onClick={() => setModalHistorialAbierto(false)}
                    className="text-sm font-bold text-slate-500 hover:text-[#113130] transition-colors"
                >
                    Cerrar ventana
                </button>
            </div>
        </div>
    </div>,
    document.body
)}
            </div> 
            
            <style>{`
                .animate-fade-in { animation: fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .scrollbar-thin::-webkit-scrollbar { height: 6px; }
                .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
                .scrollbar-thin::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
            `}</style>
        </>
    );
};

export default Dashboard;