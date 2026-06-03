import React, { useState, useRef, useEffect } from 'react';
import './i18n'
import { useTranslation } from 'react-i18next';
import './Interface.css';
import Dashboard from './Dashboard';
import Pacientes from './Pacientes';
import Citas from './Citas';
import Reportes from './Reportes';
import logoEmpresa from './assets/logo.png';
import CampanaAlertas from './CampanaAlertas';
import Experiencia from './Experiencia';
import Ajustes from './Ajustes'; 


// --- ICONOS VECTORIALES CLÍNICOS ---
function IconDashboard() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
    );
}

const IconPatients = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const IconCalendar = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const IconReports = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

const IconExperience = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);

const IconSettings = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37 1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35 1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const IconLogout = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);



export default function Interface({ onLogout }) {
    const { t, i18n } = useTranslation();
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    // Función para cambiar idioma
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        setLangMenuOpen(false); // Cierra el menú tras seleccionar
    };
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
       const [showCalendar, setShowCalendar] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    
    // Fecha pinneada de ejemplo (cita de mañana)
    const appointmentDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);


    const menuItems = [
        { id: 'dashboard', label: t('Dashboard'), icon: <IconDashboard /> },
        { id: 'pacientes', label: t('Pacientes'), icon: <IconPatients /> },
        { id: 'citas', label: t('Citas'), icon: <IconCalendar /> },
        { id: 'reportes', label: t('Reportes'), icon: <IconReports /> },
        { id: 'experiencia', label: t('Experiencia'), icon: <IconExperience /> },
        { id: 'settings', label: t('Ajustes'), icon: <IconSettings /> },
    ];
     const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"];
    
    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };
    
    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };
    
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };
    
    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };
    
    const isAppointmentDay = (day) => {
        return day === appointmentDate.getDate() && 
               currentMonth === appointmentDate.getMonth() && 
               currentYear === appointmentDate.getFullYear();
    };
    
    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];
        
        // Días vacíos al inicio
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8"></div>);
        }
        
        // Días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(
                <div 
                    key={day} 
                    className={`h-8 flex items-center justify-center text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                        isAppointmentDay(day) 
                            ? 'bg-[#14B8A6] text-white ring-2 ring-[#0F766E] ring-offset-1 scale-110' 
                            : 'hover:bg-teal-50 text-[#113130]'
                    }`}
                >
                    {day}
                </div>
            );
        }
        
        return days;
    };
   const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'pacientes':
              return <Pacientes searchQuery={searchQuery} />;
            case 'citas':
                return <Citas />;
            case 'reportes':
                return <Reportes />;
            case 'experiencia':
                 return <Experiencia />;
            case 'settings':
                return <Ajustes />;
            default:
                // El default ahora muestra un texto genérico por si acaso
                return <div className="text-center text-slate-500 font-bold mt-10">Pantalla no encontrada.</div>;
        }
    };
    

    return (
        <div className="min-h-screen font-sans bg-[#F4F8F8] text-[#113130] flex flex-col lg:flex-row antialiased relative">
        
      {/* ================= CABECERA MÓVIL ================= */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-[#0F766E] text-white shadow-md relative py-6">
            {/* Contenedor invisible para empujar el logo al centro exacto */}
            <div className="w-10 h-10 invisible" />
            
            {/* Logo en versión Móvil: Se usa w-48 (ancho grande) y scale-110 para que destaque mucho más */}
            <div className="flex items-center justify-center flex-1">
                <img src={logoEmpresa} alt="HorizonFlow logo" className="w-48 h-auto object-contain transform scale-110" />
            </div>
            
            {/* Botón Hamburguesa Responsivo */}
            <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none z-10"
            >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </div>

        {/* ================= 1. BARRA LATERAL (PC Y MÓVIL DESLIZABLE) ================= */}
     <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F766E] text-white flex flex-col justify-between transform lg:transform-none lg:opacity-100 lg:sticky lg:top-0 lg:h-screen transition-all duration-300 ease-out shrink-0 shadow-xl lg:shadow-none ${sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="flex flex-col">
           {/* CONTENEDOR DEL LOGO (MÁXIMO TAMAÑO) */}
            <div className="w-full pt-8 pb-4 px-2 flex flex-col items-center relative">
                {/* Se cambió max-w-[220px] a max-w-[250px] 
                  Se añadió scale-110 para agrandarlo visualmente
                  Se ajustó el margen inferior (pb-4) para equilibrarlo
                */}
                <img 
                    src={logoEmpresa} 
                    alt="Logo" 
                    className="w-full h-auto max-w-[250px] object-contain transform scale-110" 
                />
                <button 
                    onClick={() => setSidebarOpen(false)} 
                    className="lg:hidden absolute right-4 top-4 text-white/70 hover:text-white z-10"
                >
                    ✕
                </button>
            </div>

               {/* NAV COMPACTO (CORREGIDO: Eliminamos el overflow que rompía las curvas) */}
            <nav className="flex-1 pl-4 space-y-1 mt-2">
                {menuItems.map((item) => {
                    const activo = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-5 py-3 text-xs font-bold uppercase tracking-wider nav-button transition-transform duration-300 ${activo ? 'active-nav-curve text-[#0F766E] font-black' : 'text-teal-100/75 hover:text-white hover:translate-x-1.5'}`}
                        >
                            <span className={`transition-colors duration-200 ${activo ? 'text-[#0F766E]' : 'text-teal-200'}`}>{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
            </div>

            {/* Botón de Log Out */}
            <div className="p-6">
                <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-teal-100/70 hover:text-white hover:bg-white/5 transition-all"
                >
                    <IconLogout />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>

        {/* Fondo protector oscuro difuminado para interacción móvil */}
        {sidebarOpen && (
            <div 
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-40 bg-[#113130]/40 backdrop-blur-xs lg:hidden"
            ></div>
        )}
        
        {/* ================= CONTENEDOR CENTRAL (PANEL DE CONTENIDO) ================= */}
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden bg-[#F4F8F8]">
            
            {/* Cabecera Superior (Header) - Mantiene su adaptabilidad móvil impecable */}
            <header className="px-6 lg:px-8 py-5 bg-transparent flex flex-col md:flex-row items-center justify-between gap-4 border-b border-teal-100/30">
                
                {/* Buscador */}
                <div className="relative w-full md:max-w-md">
                    <input
                        type="text"
                        placeholder="Buscar paciente, informe, cita..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-full text-xs bg-white text-[#113130] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 transition-all shadow-sm border border-teal-100/40"
                    />
                    <span className="absolute left-4 top-3.5 text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                </div>

{/* Perfil del Usuario e Idiomas Responsivo */}
                <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full md:w-auto mt-2 md:mt-0">
                    
                    {/* CONTENEDOR DE ICONOS Y ALARMAS */}
                    <div className="flex items-center gap-2 sm:gap-4 z-50 relative">
                        {/* Botón de Idioma */}
<div className="relative z-50">
    <div 
        onClick={() => setLangMenuOpen(!langMenuOpen)}
        className="text-xs font-bold px-3 py-1.5 bg-white rounded-xl shadow-xs border border-teal-100/40 flex items-center gap-1.5 cursor-pointer hover:bg-teal-50/50 transition-colors"
    >
        {/* Muestra el idioma actual en mayúsculas (ej: ES, EN, POR) */}
        <span>{(i18n.language || 'es').toUpperCase()}</span>
        <span className="text-[8px] text-teal-600">▼</span>
    </div>

    {/* Dropdown de opciones */}
    {langMenuOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[70px] bg-white border border-teal-100/60 rounded-xl shadow-lg overflow-hidden animate-fade-in">
            <button 
                onClick={() => changeLanguage('es')} 
                className="block w-full text-center px-3 py-2 text-xs font-bold text-[#113130] hover:bg-teal-50 hover:text-[#0F766E] transition-colors"
            >
                ES
            </button>
            <button 
                onClick={() => changeLanguage('en')} 
                className="block w-full text-center px-3 py-2 text-xs font-bold text-[#113130] hover:bg-teal-50 hover:text-[#0F766E] transition-colors"
            >
                EN
            </button>
            <button 
                onClick={() => changeLanguage('pt')} 
                className="block w-full text-center px-3 py-2 text-xs font-bold text-[#113130] hover:bg-teal-50 hover:text-[#0F766E] transition-colors"
            >
                POR
            </button>
        </div>
    )}
</div>
                        
                                               {/* Botón de Calendario (Reemplazó al botón de Mensajes) */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="p-2.5 bg-white rounded-xl shadow-xs border border-teal-100/40 hover:bg-teal-50/50 transition-colors relative"
                            >
                                <svg className="w-4 h-4 text-[#113130]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#14B8A6] rounded-full"></span>
                            </button>
                            
                            {/* Popup del Calendario */}
                            {showCalendar && (
                                <div className="absolute top-full right-0 mt-3 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-teal-100/30 p-5 z-[100] animate-fade-in">
                                    {/* Encabezado del Calendario */}
                                    <div className="flex items-center justify-between mb-4">
                                        <button 
                                            onClick={handlePrevMonth}
                                            className="p-1.5 hover:bg-teal-50 rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-[#113130]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        
                                        <div className="text-center">
                                            <h3 className="text-sm font-bold text-[#113130]">{monthNames[currentMonth]}</h3>
                                            <p className="text-xs text-slate-500">{currentYear}</p>
                                        </div>
                                        
                                        <button 
                                            onClick={handleNextMonth}
                                            className="p-1.5 hover:bg-teal-50 rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4 text-[#113130]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                    
                                    {/* Días de la semana */}
                                    <div className="grid grid-cols-7 gap-1.5 mb-3">
                                        {dayNames.map(day => (
                                            <div key={day} className="h-7 flex items-center justify-center text-xs font-bold text-[#0F766E]">
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Días del mes */}
                                    <div className="grid grid-cols-7 gap-1.5 mb-4">
                                        {renderCalendar()}
                                    </div>
                                    
                                    {/* Información de la cita */}
                                    {isAppointmentDay(appointmentDate.getDate()) && (
                                        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-3 border border-[#14B8A6]/20">
                                            <p className="text-xs font-bold text-[#113130] mb-1">📅 Cita Programada</p>
                                            <p className="text-xs text-slate-600">
                                                Paciente: <span className="font-bold text-[#0F766E]">Juan Pérez</span>
                                            </p>
                                            <p className="text-xs text-slate-600">
                                                Hora: <span className="font-bold text-[#0F766E]">10:30 AM</span>
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Botón cerrar */}
                                    <button 
                                        onClick={() => setShowCalendar(false)}
                                        className="w-full mt-4 py-2 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {/* 🌟 AQUÍ VA TU COMPONENTE ESTRELLA 🌟 */}
                        <CampanaAlertas />
                        
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-teal-200/50"></div>

                    {/* Perfil del Usuario */}
                    <div className="flex items-center gap-3 bg-white px-3.5 py-1.5 rounded-full shadow-xs border border-teal-100/40">
                        <div className="w-7 h-7 rounded-full bg-[#0D9488] text-white flex items-center justify-center font-black text-xs">
                            A
                        </div>
                        <div className="text-left overflow-hidden">
                            <h4 className="text-xs font-extrabold text-[#113130] truncate max-w-[120px] sm:max-w-none">@ALMASystem</h4>
                            <p className="text-[9px] text-[#0D9488] font-bold uppercase tracking-wider">Administrador</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Área de Contenido Dinámico */}
            <div className="flex-1 p-6 lg:p-8 animate-fade-in">
                {renderContent()}
                {/* Aquí se renderizará el contenido según tus vistas dinámicas */}
            </div>
        </div>

        {/* ================= MODAL DE LOGOUT SEGURO ================= */}
        {showLogoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div 
                    className="absolute inset-0 bg-[#113130]/50 backdrop-blur-xs transition-opacity duration-300"
                    onClick={() => setShowLogoutModal(false)}
                />
                <div className="relative bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-teal-100/30 text-center space-y-4 animate-fade-in">
                    <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center text-lg font-bold">
                        ⚠️
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-[#113130]">¿Cerrar sesión de forma segura?</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Confirmarás el término de la sesión clínica activa para la cuenta <span className="font-bold text-[#0D9488]">@ALMASystem@gmail.com</span>.
                        </p>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="flex-1 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => {
                                setShowLogoutModal(false);
                                onLogout();
                            }}
                            className="flex-1 py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-500/20 transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        )}
        {/* ========================================================= */}
        {/* CHATBOT GLOBAL (NIVEL INTERFAZ)                             */}
        {/* ========================================================= */}
        
        {/* 1. Botón Flotante */}
        <button 
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-[#0F766E] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#0D9488] transition-transform hover:scale-105 z-[60] focus:outline-none"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>

        {/* 2. Fondo oscuro */}
        {isChatOpen && (
            <div 
                className="fixed inset-0 bg-[#113130]/30 backdrop-blur-sm z-[70] transition-opacity"
                onClick={() => setIsChatOpen(false)}
            ></div>
        )}

        {/* 3. Barra Lateral del Chatbot */}
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white shadow-2xl z-[80] transform transition-transform duration-300 ease-in-out flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0F766E]/10 flex items-center justify-center text-[#0F766E] shadow-sm border border-teal-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                        <h3 className="font-black text-[#113130] text-sm">Soporte ALMA</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Asistente en línea</p>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="flex-1 p-5 bg-white flex flex-col gap-4 overflow-y-auto">
                <div className="flex gap-2">
                    <div className="bg-slate-50 p-3.5 rounded-2xl rounded-tl-sm border border-slate-100 text-xs text-slate-600 font-medium leading-relaxed max-w-[85%] shadow-sm">
                        Hola Dr., soy tu asistente de soporte. ¿En qué te puedo ayudar hoy con la plataforma?
                    </div>
                </div>
                <div className="flex gap-2 justify-end">
                    <div className="bg-[#0F766E] p-3.5 rounded-2xl rounded-tr-sm text-xs text-white shadow-md font-medium leading-relaxed max-w-[85%]">
                        ¿Cómo exporto el reporte mensual?
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="bg-slate-50 p-3.5 rounded-2xl rounded-tl-sm border border-slate-100 text-xs text-slate-600 font-medium leading-relaxed max-w-[85%] shadow-sm">
                        ¡Claro! Ve a la pestaña de "Reportes" en tu menú principal, selecciona el mes que deseas y haz clic en el botón verde de "Exportar a PDF" arriba a la derecha. ¿Te ayudo con algo más?
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Escribe tu pregunta..." 
                        className="w-full text-xs font-medium pl-4 pr-12 py-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all shadow-sm" 
                    />
                    <button className="absolute right-2 top-2 p-1.5 bg-[#0F766E] text-white rounded-lg hover:bg-[#0D9488] transition-colors">
                        <svg className="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
            </div>
        </div>

        </div>
    );
}