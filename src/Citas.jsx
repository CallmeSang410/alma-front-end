import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Citas.css';
import { useAlerta, AlertaProvider } from './AlertaContext.jsx'; 

// ================= COMPONENTES VISUALES PREMIUM =================

// 1. Selector Simple (Para Estado y Modalidad)
const SelectorPremium = ({ valor, opciones, alCambiar, placeholder, conError }) => {
    const [abierto, setAbierto] = useState(false);
    return (
        <div className="relative">
            <div 
                onClick={() => setAbierto(!abierto)}
                className={`w-full rounded-2xl px-5 py-4 text-sm font-bold cursor-pointer flex justify-between items-center transition-all ${conError ? 'bg-rose-50 border-rose-400 text-rose-700 border' : 'bg-slate-50 border-slate-200 text-[#113130] hover:border-[#0F766E]/40 border'} ${abierto ? 'ring-2 ring-[#0F766E]/30 border-[#0F766E] bg-white' : ''}`}
            >
                <span className={!valor ? 'text-slate-400' : ''}>
                    {valor ? opciones.find(o => o.valor === valor)?.etiqueta : placeholder}
                </span>
                <svg className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${abierto ? 'rotate-180 text-[#0F766E]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </div>
            {abierto && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)}></div>
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                        {opciones.map((opt) => (
                            <div 
                                key={opt.valor}
                                onClick={() => { alCambiar(opt.valor); setAbierto(false); }}
                                className={`px-5 py-3.5 cursor-pointer text-sm font-bold transition-colors flex justify-between items-center ${valor === opt.valor ? 'bg-teal-50 text-[#0F766E]' : 'text-slate-500 hover:bg-slate-50 hover:text-[#113130]'}`}
                            >
                                {opt.etiqueta}
                                {valor === opt.valor && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// 2. Buscador de Pacientes con Lupa
const BuscadorPacientesPremium = ({ valor, pacientes, alCambiar, conError }) => {
    const [abierto, setAbierto] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    
    const pacienteSeleccionado = pacientes.find(p => String(p.id) === String(valor));

    return (
        <div className="relative">
            <div 
                onClick={() => setAbierto(!abierto)}
                className={`w-full rounded-2xl px-5 py-4 text-sm font-bold cursor-pointer flex justify-between items-center transition-all ${conError ? 'bg-rose-50 border-rose-400 text-rose-700 border' : 'bg-slate-50 border-slate-200 text-[#113130] hover:border-[#0F766E]/40 border'} ${abierto ? 'ring-2 ring-[#0F766E]/30 border-[#0F766E] bg-white' : ''}`}
            >
                <span className={!pacienteSeleccionado ? 'text-slate-400' : 'truncate max-w-[85%]'}>
                    {pacienteSeleccionado ? `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.telefono ? `- ${pacienteSeleccionado.telefono}` : ''}` : 'Seleccione o busque un paciente...'}
                </span>
                <svg className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${abierto ? 'rotate-180 text-[#0F766E]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
            </div>

            {abierto && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)}></div>
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[320px]">
                        <div className="p-3 border-b border-slate-100 relative shrink-0">
                            <svg className="absolute left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre o teléfono..." 
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                autoFocus
                                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/30"
                            />
                        </div>
                        <div className="overflow-y-auto hide-scrollbar flex-1">
                            {pacientes.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.telefono && p.telefono.includes(busqueda))).map(p => (
                                <div 
                                    key={p.id}
                                    onClick={() => { alCambiar(p.id); setAbierto(false); setBusqueda(''); }}
                                    className={`px-5 py-3 cursor-pointer text-sm transition-colors flex flex-col border-l-4 ${String(valor) === String(p.id) ? 'bg-teal-50 border-[#0F766E]' : 'hover:bg-slate-50 border-transparent'}`}
                                >
                                    <span className={`font-bold ${String(valor) === String(p.id) ? 'text-[#0F766E]' : 'text-[#113130]'}`}>{p.nombre}</span>
                                    {p.telefono && <span className="text-[11px] font-black tracking-widest text-slate-400 mt-0.5">{p.telefono}</span>}
                                </div>
                            ))}
                            {pacientes.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || (p.telefono && p.telefono.includes(busqueda))).length === 0 && (
                                <div className="p-6 text-center text-sm font-bold text-slate-400 flex flex-col items-center gap-2">
                                    No se encontró ningún paciente 🔍
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// 3. 🌟 NUEVO: Calendario Premium Custom
const DatePickerPremium = ({ valor, alCambiar, conError }) => {
    const [abierto, setAbierto] = useState(false);
    const [fechaVista, setFechaVista] = useState(new Date());

    useEffect(() => {
        if (abierto && valor) {
            const [y, m, d] = valor.split('-');
            setFechaVista(new Date(y, m - 1, d));
        } else if (abierto && !valor) {
            setFechaVista(new Date());
        }
    }, [abierto, valor]);

    const formatearFechaDisplay = (fechaStr) => {
        if (!fechaStr) return 'Seleccionar fecha...';
        const [y, m, d] = fechaStr.split('-');
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${d} de ${meses[parseInt(m)-1]}, ${y}`;
    };

    const diasMes = new Date(fechaVista.getFullYear(), fechaVista.getMonth() + 1, 0).getDate();
    const diaInicio = new Date(fechaVista.getFullYear(), fechaVista.getMonth(), 1).getDay();

    const diasArray = Array.from({ length: diasMes }, (_, i) => i + 1);
    const blancosArray = Array.from({ length: diaInicio }, (_, i) => i);
    const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return (
        <div className="relative">
            <div onClick={() => setAbierto(!abierto)} className={`w-full rounded-2xl px-5 py-4 text-sm font-bold cursor-pointer flex justify-between items-center transition-all ${conError ? 'bg-rose-50 border-rose-400 text-rose-700 border' : 'bg-slate-50 border-slate-200 text-[#113130] hover:border-[#0F766E]/40 border'} ${abierto ? 'ring-2 ring-[#0F766E]/30 border-[#0F766E] bg-white' : ''}`}>
                <span className={!valor ? 'text-slate-400' : ''}>
                    {formatearFechaDisplay(valor)}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${abierto ? 'rotate-180 text-[#0F766E]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>

            {abierto && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)}></div>
                    <div className="absolute z-50 w-full sm:w-80 mt-2 bg-white border border-slate-100 rounded-[2rem] shadow-2xl p-6 animate-fade-in left-0">
                        {/* Header Mes/Año */}
                        <div className="flex justify-between items-center mb-6">
                            <button type="button" onClick={() => setFechaVista(new Date(fechaVista.getFullYear(), fechaVista.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <span className="text-[13px] font-black uppercase tracking-widest text-[#113130]">
                                {mesesNombres[fechaVista.getMonth()]} {fechaVista.getFullYear()}
                            </span>
                            <button type="button" onClick={() => setFechaVista(new Date(fechaVista.getFullYear(), fechaVista.getMonth() + 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                        
                        {/* Días de la semana */}
                        <div className="grid grid-cols-7 gap-1 mb-3">
                            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
                                <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-wider">{d}</div>
                            ))}
                        </div>
                        
                        {/* Cuadrícula de días */}
                        <div className="grid grid-cols-7 gap-1">
                            {blancosArray.map(b => <div key={`blank-${b}`}></div>)}
                            {diasArray.map(d => {
                                const fechaStr = `${fechaVista.getFullYear()}-${String(fechaVista.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const seleccionado = valor === fechaStr;
                                const hoy = new Date().toISOString().split('T')[0] === fechaStr;
                                
                                return (
                                    <button
                                        key={d}
                                        type="button"
                                        onClick={() => { alCambiar(fechaStr); setAbierto(false); }}
                                        className={`aspect-square flex items-center justify-center text-xs font-bold rounded-xl transition-all 
                                            ${seleccionado ? 'bg-[#0F766E] text-white shadow-md shadow-teal-900/20' : 
                                            hoy ? 'border-2 border-[#0F766E] text-[#0F766E] bg-teal-50/50' : 'hover:bg-slate-100 text-slate-600'}`}
                                    >
                                        {d}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// 4. 🌟 NUEVO: Reloj Premium Custom (Dos columnas)
const TimePickerPremium = ({ valor, alCambiar, conError }) => {
    const [abierto, setAbierto] = useState(false);
    const horas = Array.from({length: 24}, (_, i) => String(i).padStart(2, '0'));
    const minutos = Array.from({length: 60}, (_, i) => String(i).padStart(2, '0'));

    const [hSelect, mSelect] = valor ? valor.split(':') : ['--', '--'];

    return (
        <div className="relative">
            <div onClick={() => setAbierto(!abierto)} className={`w-full rounded-2xl px-5 py-4 text-sm font-bold cursor-pointer flex justify-between items-center transition-all ${conError ? 'bg-rose-50 border-rose-400 text-rose-700 border' : 'bg-slate-50 border-slate-200 text-[#113130] hover:border-[#0F766E]/40 border'} ${abierto ? 'ring-2 ring-[#0F766E]/30 border-[#0F766E] bg-white' : ''}`}>
                <span className={!valor ? 'text-slate-400' : ''}>
                    {valor ? `${valor} hrs` : '-- : --'}
                </span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${abierto ? 'rotate-180 text-[#0F766E]' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>

            {abierto && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setAbierto(false)}></div>
                    <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-3xl shadow-2xl p-5 animate-fade-in flex gap-6 h-[300px]">
                        {/* Columna Horas */}
                        <div className="flex-1 flex flex-col h-full">
                            <span className="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Hora</span>
                            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1 pr-2">
                                {horas.map(h => (
                                    <button 
                                        key={h}
                                        type="button"
                                        onClick={() => {
                                            const newTime = `${h}:${mSelect !== '--' ? mSelect : '00'}`;
                                            alCambiar(newTime);
                                        }}
                                        className={`py-3 text-sm font-bold rounded-xl transition-colors ${hSelect === h ? 'bg-[#0F766E] text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="w-px bg-slate-100 h-full rounded-full"></div>

                        {/* Columna Minutos */}
                        <div className="flex-1 flex flex-col h-full">
                            <span className="text-[10px] font-black text-center text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Minuto</span>
                            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1 pl-2">
                                {minutos.map(m => (
                                    <button 
                                        key={m}
                                        type="button"
                                        onClick={() => {
                                            const newTime = `${hSelect !== '--' ? hSelect : '08'}:${m}`;
                                            alCambiar(newTime);
                                            setAbierto(false); // Cerramos el selector al elegir el minuto
                                        }}
                                        className={`py-3 text-sm font-bold rounded-xl transition-colors ${mSelect === m ? 'bg-teal-50 text-[#0F766E]' : 'hover:bg-slate-50 text-slate-600'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};


// ================= COMPONENTE PRINCIPAL =================
const Citas = () => {
    const contextoAlerta = useAlerta();
    const mostrarAlerta = contextoAlerta ? contextoAlerta.mostrarAlerta : (t, tit, msj) => alert(`${tit}: ${msj}`);

    const cssOcultarNativos = `
        .input-sin-flechas::-webkit-inner-spin-button,
        .input-sin-flechas::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        .input-sin-flechas {
            -moz-appearance: textfield;
        }
    `;

    const [view, setView] = useState('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('Todas');
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    const [appointments, setAppointments] = useState([]);
    const [patientsList, setPatientsList] = useState([]); 

    const [isNewPatient, setIsNewPatient] = useState(false);
    const [newPatientData, setNewPatientData] = useState({ nombre: '', telefono: '' });

    const [formData, setFormData] = useState({ 
        id: null, 
        paciente_id: '', 
        date: '', 
        time: '', 
        reason: '', 
        status: 'Pendiente',
        atention: 'Presencial',
        tarifa: ''
    });

    useEffect(() => {
        if (appointmentToCancel) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [appointmentToCancel]);
    const [filterAtention, setFilterAtention] = useState('Todas');

    // Agregá esta función (podés ponerla cerca de getStatusStyles)
    const getAtentionStyles = (atention) => {
        switch(atention) {
            case 'A domicilio': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Presencial': return 'bg-teal-50 text-[#0F766E] border-teal-200';
            case 'Virtual': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };
    const cargarDatos = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const resPacientes = await fetch('http://127.0.0.1:8000/pacientes', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const resCitas = await fetch('http://127.0.0.1:8000/citas', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (resPacientes.ok && resCitas.ok) {
                const pacientesDB = await resPacientes.json();
                const citasDB = await resCitas.json();

                setPatientsList(pacientesDB);

                const citasFormateadas = citasDB.map(cita => {
                    const paciente = pacientesDB.find(p => p.id === cita.paciente_id);
                    const [fecha, horaFull] = cita.fecha_cita.split('T');
                    const hora = horaFull ? horaFull.substring(0, 5) : "00:00";

                    return {
                        id: cita.id,
                        paciente_id: cita.paciente_id,
                        patientName: paciente ? paciente.nombre : "Paciente Eliminado/Desconocido",
                        patientPhone: paciente ? paciente.telefono : "",
                        date: fecha,
                        time: hora,
                        reason: cita.motivo,
                        status: cita.estado || "Pendiente",
                        atention: cita.modalidad || "Presencial",
                        tarifa: cita.tarifa || '' 
                    };
                });
                window.dispatchEvent(new Event('citasActualizadas'));
                setAppointments(citasFormateadas);
            }
        } catch (error) {
            console.error("Error al cargar los datos:", error);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, []);

    const handleOpenForm = (appointment = null) => {
        setFormErrors({});
        setIsNewPatient(false);
        setNewPatientData({ nombre: '', telefono: '' });

        if (appointment) {
            setFormData(appointment);
        } else {
            setFormData({ 
                id: null, 
                paciente_id: '', 
                date: '', 
                time: '', 
                reason: '', 
                status: 'Pendiente',
                atention: 'Presencial',
                tarifa: ''
            });
        }
        setView('form');
    };

    const handleSaveAppointment = async (e) => {
        e.preventDefault();
        
        const errors = {};
        if (isNewPatient && !formData.id) {
            if (!newPatientData.nombre.trim()) errors.nuevoNombre = true;
        } else {
            if (!formData.paciente_id) errors.paciente_id = true;
        }

        if (!formData.date.trim()) errors.date = true;
        if (!formData.time.trim()) errors.time = true;
        if (!formData.reason.trim()) errors.reason = true;
        if (!formData.atention.trim()) errors.atention = true;
        if (!formData.status.trim()) errors.status = true;
        if (formData.tarifa === '' || formData.tarifa === null) errors.tarifa = true;

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});

        try {
            const token = localStorage.getItem('token');
            let finalPacienteId = formData.paciente_id;

            if (isNewPatient && !formData.id) {
                const resNuevoPaciente = await fetch('http://127.0.0.1:8000/pacientes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        nombre: newPatientData.nombre,
                        telefono: newPatientData.telefono,
                        email: null,
                        edad: null,
                        sexo: null,
                        estado: 'Pendiente',
                    })
                });

                if (resNuevoPaciente.ok) {
                    const pacienteCreado = await resNuevoPaciente.json();
                    finalPacienteId = pacienteCreado.id; 
                } else {
                    mostrarAlerta('error', 'Error', 'Error al crear el paciente rápido.');
                    return; 
                }
            }

            const fechaCombinada = `${formData.date}T${formData.time}:00`;
            const datosParaCita = {
                motivo: formData.reason,
                fecha_cita: fechaCombinada,
                modalidad: formData.atention,
                estado: formData.status,
                tarifa: formData.tarifa ? parseFloat(formData.tarifa) : 0
            };

            let url = formData.id ? `http://127.0.0.1:8000/citas/${formData.id}` : `http://127.0.0.1:8000/pacientes/${finalPacienteId}/citas`;
            let method = formData.id ? 'PUT' : 'POST';

            const respuesta = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(datosParaCita)
            });

            if (respuesta.ok) {
                window.dispatchEvent(new Event('actualizarRadarCitas'));
                cargarDatos(); 
                setView('list');
                mostrarAlerta('exito', '¡Guardado!', formData.id ? 'Cita modificada con éxito.' : 'Cita creada con éxito.');
            } else {
                mostrarAlerta('error', 'Error', 'No se pudo guardar la cita en la base de datos.');
            }
        } catch (error) {
            mostrarAlerta('error', 'Sin conexión', 'No pudimos conectar con el servidor.');
        }
    };

   const confirmCancelAppointment = async () => {
        try {
            const respuesta = await fetch(`http://127.0.0.1:8000/citas/${appointmentToCancel}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (respuesta.ok) {
                cargarDatos(); 
                setAppointmentToCancel(null);
                mostrarAlerta('exito', '¡Eliminada!', 'La cita se eliminó correctamente.');
                
                // 🌟 EL GRITO PARA EL CALENDARIO: Le avisa a Interface.jsx que borre el punto rojo
                window.dispatchEvent(new Event('citasActualizadas'));
            } else {
                mostrarAlerta('error', 'Error', 'No se pudo eliminar la cita.');
            }
        } catch (error) {
            mostrarAlerta('error', 'Error', 'Ocurrió un error al intentar eliminar la cita.');
        }
    };

    const handleCompletarCita = async (citaId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/citas/${citaId}/completar`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setAppointments(prevCitas => prevCitas.filter(cita => cita.id !== citaId));
                mostrarAlerta('exito', '¡Completada!', 'La cita se ha marcado como completada.');
                
                // 🌟 EL GRITO EXTRA: Si completás la cita, el calendario también se actualiza al instante
                window.dispatchEvent(new Event('citasActualizadas'));
            } else {
                mostrarAlerta('error', 'Error', 'No se pudo completar la cita.');
            }
        } catch (error) {
            mostrarAlerta('error', 'Error de Red', 'No pudimos conectar con el servidor.');
        }
    };

    const filteredAppointments = appointments.filter(appt => {
        // 1. Filtro de búsqueda (texto)
        const matchesSearch = appt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              appt.reason.toLowerCase().includes(searchQuery.toLowerCase());
        
        // 2. Filtro de Estado
        let matchesStatus = filterStatus === 'Todas' ? appt.status.toLowerCase() !== 'completada' : appt.status === filterStatus;

        // 3. 🌟 EL FILTRO RECUPERADO DE MODALIDAD
        let matchesAtention = filterAtention === 'Todas' ? true : appt.atention === filterAtention;

        // La cita solo se muestra si pasa los 3 filtros
        return matchesSearch && matchesStatus && matchesAtention;
    });

    const getStatusStyles = (status) => {
        switch(status) {
            case 'Reservada': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
            case 'Pendiente': return 'bg-amber-50 text-amber-600 border-amber-200';
            case 'Cancelada': return 'bg-rose-50 text-rose-500 border-rose-200 line-through opacity-70';
            default: return 'bg-slate-50 text-slate-500 border-slate-200';
        }
    };

    const ErrorIcon = () => (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    );

    // ================= VISTA 1: LISTA DE CITAS =================
    if (view === 'list') {
        return (
            <div className="space-y-6 relative animate-fade-in pb-10">
                <style>{cssOcultarNativos}</style>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-black text-[#113130] tracking-tight">Agenda de Citas</h1>
                            <p className="text-slate-500 text-sm font-medium mt-1">Organiza y filtra tus próximas consultas</p>
                        </div>
                        <button onClick={() => handleOpenForm()} className="bg-[#0F766E] hover:bg-[#0D9488] text-white px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-900/20 w-full sm:w-auto shrink-0">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg> 
                            Nueva Cita
                        </button>
                    </div>

                                <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t border-slate-50">
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        placeholder="Buscar por paciente o motivo..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0F766E] transition-all font-medium" 
                    />
                    <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                {/* FILTRO 1: ESTADO (El que sobrevivió) */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 lg:pb-0 shrink-0">
                    {['Todas', 'Pendiente', 'Reservada', 'Cancelada'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === status ? 'bg-[#113130] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* 🌟 FILTRO 2: MODALIDAD (El que Dervin te borró y estamos resucitando) */}
                <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 lg:pb-0 shrink-0">
                    {['Todas', 'A domicilio', 'Presencial', 'Virtual'].map(atention => (
                        <button 
                            key={atention}
                            onClick={() => setFilterAtention(atention)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterAtention === atention ? 'bg-[#113130] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
                        >
                            {atention}
                        </button>
                    ))}
                </div>
            </div>
                </div>

                {filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-5">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                        <h3 className="text-xl font-black text-[#113130]">No hay citas para mostrar</h3>
                        <p className="text-sm text-slate-500 mt-2 font-medium">No se encontraron resultados con los filtros actuales.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAppointments.map(appt => (
                            <div key={appt.id} className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${appt.status === 'Reservada' ? 'bg-emerald-400' : appt.status === 'Cancelada' ? 'bg-rose-400' : 'bg-amber-400'}`}></div>
                                
                                <div className="pl-2">
                                   <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-black text-lg shadow-sm border border-teal-100">
                                                {appt.patientName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-[#113130] leading-tight truncate max-w-[150px] sm:max-w-[200px]" title={appt.patientName}>{appt.patientName}</h3>
                                            </div>
                                        </div>
                                        
                                        {/* 🌟 CONTENEDOR NUEVO: Apila el Estado y la Modalidad a la derecha */}
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border shadow-sm ${getStatusStyles(appt.status)}`}>
                                                {appt.status}
                                            </span>
                                            
                                            {/* 🌟 LA ETIQUETA DE MODALIDAD RECUPERADA CON SUS ICONOS */}
                                            <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1 shadow-sm ${getAtentionStyles(appt.atention)}`}>
                                                {appt.atention === 'Virtual' && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                                                {appt.atention === 'A domicilio' && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}
                                                {appt.atention === 'Presencial' && <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                                {appt.atention}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p className="text-xs text-slate-600 font-medium leading-relaxed">{appt.reason}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                                            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {appt.date}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[#0F766E] font-black text-sm">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {appt.time}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3 pl-2">
                                    <button 
                                        onClick={() => handleOpenForm(appt)} 
                                        className="flex-1 bg-white border-2 border-slate-100 hover:border-teal-100 hover:bg-teal-50 text-slate-600 hover:text-[#0F766E] py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleCompletarCita(appt.id)}
                                        className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-xl transition-colors flex items-center justify-center"
                                        title="Marcar como Completada"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                    </button>
                                    <button 
                                        onClick={() => setAppointmentToCancel(appt.id)} 
                                        className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-colors" 
                                        title="Eliminar Cita"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {appointmentToCancel && createPortal(
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 w-screen h-screen">
                        <div className="absolute inset-0 bg-[#113130]/70 backdrop-blur-md" onClick={() => setAppointmentToCancel(null)} />
                        <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative z-10 shadow-2xl animate-fade-in border border-rose-100/50 text-center m-4">
                            <div className="mx-auto w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-rose-100">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-[#113130] mb-3">¿Eliminar Cita?</h3>
                            <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">Esta acción borrará la cita de la base de datos permanentemente.</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={() => setAppointmentToCancel(null)} className="w-full py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors">Atrás</button>
                                <button onClick={confirmCancelAppointment} className="w-full py-3.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/30 transition-colors">Sí, Eliminar</button>
                            </div>
                        </div>
                    </div>, document.body
                )}
            </div>
        );
    }

    // ================= VISTA 2: FORMULARIO PREMIUM =================
    if (view === 'form') {
        return (
            <div className="max-w-3xl mx-auto space-y-6 relative animate-fade-in pb-10">
                <style>{cssOcultarNativos}</style>
                <button onClick={() => setView('list')} className="flex items-center gap-2 text-slate-500 hover:text-[#0F766E] text-xs font-black uppercase tracking-widest transition-colors mb-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 hover:shadow-md w-fit">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Cancelar
                </button>
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-sm border border-slate-100">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-[#113130] tracking-tight">{formData.id ? 'Editar Cita' : 'Agendar Cita'}</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">Completa los detalles para el calendario.</p>
                    </div>

                    <form onSubmit={handleSaveAppointment} className="space-y-6" noValidate>
                        
                        {!formData.id && ( 
                            <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-6">
                                <button type="button" onClick={() => { setIsNewPatient(false); setFormErrors({}); }} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${!isNewPatient ? 'bg-white text-[#113130] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    Paciente Registrado
                                </button>
                                <button type="button" onClick={() => { setIsNewPatient(true); setFormErrors({}); }} className={`flex-1 py-3 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${isNewPatient ? 'bg-[#0F766E] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    Paciente Nuevo
                                </button>
                            </div>
                        )}

                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4">
                            {!isNewPatient ? (
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        Seleccionar Paciente <span className="text-rose-500">*</span>
                                    </label>
                                    <BuscadorPacientesPremium 
                                        valor={formData.paciente_id}
                                        pacientes={patientsList}
                                        alCambiar={(val) => setFormData({...formData, paciente_id: val})}
                                        conError={formErrors.paciente_id}
                                    />
                                    {formErrors.paciente_id && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Debes seleccionar un paciente</p>}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre Completo <span className="text-rose-500">*</span></label>
                                        <input 
                                            type="text" 
                                            value={newPatientData.nombre} 
                                            onChange={(e) => setNewPatientData({...newPatientData, nombre: e.target.value})} 
                                            placeholder="Ej. Juan Pérez" 
                                            className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.nuevoNombre ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-white border-slate-200 focus:ring-[#0F766E] border'}`} 
                                        />
                                        {formErrors.nuevoNombre && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Nombre requerido</p>}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Teléfono (Opcional)</label>
                                        <input 
                                            type="tel" 
                                            value={newPatientData.telefono} 
                                            onChange={(e) => setNewPatientData({...newPatientData, telefono: e.target.value})} 
                                            placeholder="Ej. 8888 8888" 
                                            className="w-full rounded-2xl px-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 focus:ring-[#0F766E] border border-slate-200 transition-all bg-white hover:border-[#0F766E]/40" 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 🌟 AQUÍ REEMPLAZAMOS FECHA Y HORA POR LOS COMPONENTES PREMIUM */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Fecha <span className="text-rose-500">*</span>
                                </label>
                                <DatePickerPremium 
                                    valor={formData.date}
                                    alCambiar={(val) => setFormData({...formData, date: val})}
                                    conError={formErrors.date}
                                />
                                {formErrors.date && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Ingresa una fecha</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Hora <span className="text-rose-500">*</span>
                                </label>
                                <TimePickerPremium 
                                    valor={formData.time}
                                    alCambiar={(val) => setFormData({...formData, time: val})}
                                    conError={formErrors.time}
                                />
                                {formErrors.time && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Ingresa una hora</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Motivo de la cita <span className="text-rose-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                value={formData.reason} 
                                onChange={(e) => setFormData({...formData, reason: e.target.value})} 
                                placeholder="Ej. Terapia inicial..." 
                                required
                                className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all ${formErrors.reason ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border hover:border-[#0F766E]/40'}`} 
                            />
                            {formErrors.reason && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Especifica el motivo</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Modalidad <span className="text-rose-500">*</span>
                                </label>
                                <SelectorPremium 
                                    valor={formData.atention}
                                    opciones={[
                                        { valor: 'Presencial', etiqueta: 'Presencial' },
                                        { valor: 'Virtual', etiqueta: 'Virtual' },
                                        { valor: 'A domicilio', etiqueta: 'A domicilio' }
                                    ]}
                                    alCambiar={(val) => setFormData({...formData, atention: val})}
                                    placeholder="Seleccione..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Estado <span className="text-rose-500">*</span>
                                </label>
                                <SelectorPremium 
                                    valor={formData.status}
                                    opciones={[
                                        { valor: 'Pendiente', etiqueta: 'Pendiente (Por Confirmar)' },
                                        { valor: 'Reservada', etiqueta: 'Reservada' },
                                        { valor: 'Cancelada', etiqueta: 'Cancelada' }
                                    ]}
                                    alCambiar={(val) => setFormData({...formData, status: val})}
                                    placeholder="Seleccione..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    Tarifa ($) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 font-black text-sm pointer-events-none">$</div>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={formData.tarifa} 
                                        onChange={(e) => setFormData({...formData, tarifa: e.target.value})} 
                                        placeholder="0.00"
                                        className={`w-full rounded-2xl pl-10 pr-5 py-4 text-sm font-bold text-[#113130] focus:outline-none focus:ring-2 transition-all input-sin-flechas ${formErrors.tarifa ? 'bg-rose-50 border-rose-400 focus:ring-rose-500 border' : 'bg-slate-50 border-slate-200 focus:ring-[#0F766E] border hover:border-[#0F766E]/40'}`} 
                                    />
                                </div>
                                {formErrors.tarifa && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><ErrorIcon /> Ingresa la tarifa</p>}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex gap-4">
                            <button type="submit" className="w-full bg-[#0F766E] hover:bg-[#0D9488] text-white py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-teal-900/20 transition-colors">
                                {formData.id ? 'Guardar Cambios' : (isNewPatient ? 'Crear Paciente y Agendar Cita' : 'Agendar Cita')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return null;
};

export default function CitasIntegradas(props) {
    return (
        <AlertaProvider>
            <Citas {...props} />
        </AlertaProvider>
    );
}