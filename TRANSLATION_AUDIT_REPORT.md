# Análisis de Textos No Traducidos - alma-front-end

## 📊 Resumen Ejecutivo

Se analizaron **11 archivos JSX** en la carpeta `src/` del proyecto alma-front-end y se encontraron **42 textos hardcodeados** que NO están siendo traducidos con i18n.

### Textos Encontrados por Categoría:

| Categoría | Cantidad | Estado |
|-----------|----------|--------|
| Pacientes | 17 textos | ❌ No traducidos |
| Citas | 32 textos | ❌ No traducidos |
| Reportes | 48 textos | ❌ No traducidos |
| Interface | 3 textos | ❌ No traducidos |
| Dashboard | 3 textos | ❌ No traducidos |
| Tests Psicométricos | 8 textos | ❌ No traducidos |
| **TOTAL** | **111 textos** | **⚠️ CRÍTICO** |

---

## 🔍 Detalle de Textos No Traducidos

### 1. **PACIENTES** (17 textos)

#### En uso pero NO en traducciones:
- `statusActive` → "Activo"
- `statusPending` → "Pendiente"  
- `statusDischarged` → "Alta"
- `directoryTitle` → "Directorio de Pacientes"
- `directorySubtitle` → "Gestiona expedientes y consultas ({{total}} total)"
- `searchPlaceholder` → "Buscar por nombre o diagnóstico..."
- `newPatientButton` → "Nuevo"
- `emptyTitle` → "No se encontraron pacientes"
- `emptySubtitle` → "Intenta con otros términos de búsqueda o agrega uno nuevo."
- `viewRecord` → "Expediente"
- `editInfo` → "Editar Info"
- `editProfile` → "Editar Perfil"
- `deleteRecord` → "Eliminar"
- `generateReport` → "Generar Reporte"
- `directory` → "Directorio"
- `noPhone` → "Sin teléfono"
- `noEmail` → "Sin correo"

**Archivos afectados:** `Pacientes.jsx`

---

### 2. **CITAS (APPOINTMENTS)** (32 textos)

#### Errores y mensajes de validación:
- `errorCreatingPatient` → "Error al crear el paciente"
- `successSavedAppointment` → "¡Cita guardada exitosamente!"
- `errorSavingAppointment` → "Error al guardar la cita"
- `errorConnectingServer` → "Error al conectar con el servidor"
- `errorDeletingAppointment` → "Error al eliminar la cita"

#### Labels e interfaz:
- `agendaTitle` → "Agenda de Citas"
- `agendaSubtitle` → "Organiza y filtra tus próximas consultas"
- `newAppointment` → "Nueva Cita"
- `searchPlaceholder` → "Buscar por paciente o motivo..."
- `filterAll` → "Todas"
- `filterPending` → "Pendiente"
- `filterConfirmed` → "Confirmada"
- `filterCancelled` → "Cancelada"
- `emptyTitle` → "No hay citas para mostrar"
- `emptyHelp` → "No se encontraron resultados con los filtros actuales."
- `cancel` → "Cancelar"
- `edit` → "Editar"
- `delete` → "Eliminar"
- `yesDelete` → "Sí, Eliminar"
- `scheduleTitle` → "Agendar Cita"
- `editTitle` → "Editar Cita"
- `patientRegistered` → "Paciente Registrado"
- `newPatient` → "Paciente Nuevo"
- `selectPatient` → "Seleccionar Paciente"
- `selectPatientPlaceholder` → "Elige del directorio..."
- `selectPatientError` → "Debes seleccionar un paciente"
- `newPatientName` → "Nombre Completo"
- `newPatientPhone` → "Teléfono (Opcional)"
- `deletedPatient` → "Paciente Eliminado/Desconocido"
- `date` → "Fecha"
- `time` → "Hora"
- `reason` → "Motivo de la cita"
- `urgency` → "Urgencia"
- `status` → "Estado"
- `saveChanges` → "Guardar Cambios"
- `createAndSchedule` → "Crear Paciente y Agendar Cita"
- `schedule` → "Agendar Cita"

**Archivos afectados:** `Citas.jsx`

---

### 3. **REPORTES** (48 textos)

#### Errores de validación:
- `errors.finalDiagnosisRequired` → "Establece un diagnóstico clínico final"
- `errors.recommendationsRequired` → "Ingresa las recomendaciones"
- `errors.otherNextStepRequired` → "Debes describir la acción a seguir"

#### Textos de lista y búsqueda:
- `emptyTitle` → "No hay reportes generados"
- `emptySubtitle` → "Comienza creando una evaluación para tus pacientes."
- `searchPlaceholder` → "Buscar por paciente, diagnóstico o Folio (Ej. CD-0001)..."
- `noDiagnosis` → "Sin diagnóstico registrado"
- `notSpecified` → "No especificado"
- `unknownPatient` → "Paciente desconocido"

#### Wizard de evaluación (4 pasos):
- `wizardStep` → "Paso {{current}} de {{total}}"
- `step1Title` → "Datos Iniciales"
- `step2Title` → "Evaluación Clínica"
- `step3Title` → "Cierre y Diagnóstico"
- `step4Title` → "Procesando Informe..."
- `step1Description` → "Selecciona la cita pendiente y el motivo..."
- `step2Description` → "Registra las técnicas y pruebas psicométricas..."
- `step3Description` → "Confirma tu diagnóstico final clínico..."

#### Formularios (Labels, placeholders, errores):
- `selectAppointment` → "Cita Pendiente"
- `selectAppointmentPlaceholder` → "Selecciona una cita sin evaluar..."
- `noPendingAppointment` → "No hay citas pendientes sin evaluar. Crea una cita primero."
- `reasonPlaceholder` → "Describe el motivo de consulta del paciente..."
- `interviewNotesPlaceholder` → "Anota aquí tus observaciones durante la entrevista clínica..."
- `testsApplied` → "Técnicas / Pruebas Psicométricas Aplicadas"
- `otherTestPlaceholder` → "Ej. Inventario de Ansiedad de Beck (BAI)..."
- `finalDiagnosis` → "Diagnóstico Final (Profesional)"
- `diagnosisPlaceholder` → "Ej. Trastorno Depresivo Mayor, leve..."
- `recommendations` → "Recomendaciones Terapéuticas"
- `recommendationsPlaceholder` → "Pautas a seguir, tareas o sugerencias clínicas..."
- `nextStep` → "Plan / Siguiente Paso"
- `nextStepPlaceholder` → "Ej. Ingreso a programa de rehabilitación..."

#### Procesamiento con IA:
- `generateWithAI` → "Generar con IA"
- `processingReport` → "ALMA está generando el reporte..."
- `processingSubtext` → "Conectando con Gemini, estructurando diagnóstico y guardando expediente."
- `generatedByAlmaAI` → "Generado por ALMA AI"

#### Secciones del reporte (Vista detalle):
- `reportData` → "Datos Generales"
- `reportPatient` → "Paciente"
- `reportDiagnosis` → "Diagnóstico"
- `reportRecommendations` → "Recomendaciones"
- `reporterAvailableTests` (array de pruebas psicométricas - Ver sección 5)
- `medicalRegistrationPending` → "Reg. Médico: Pendiente"
- `noEvolutionHistory` → "Sin historial evolutivo"

**Archivos afectados:** `Reportes.jsx`

---

### 4. **INTERFACE (Mensajes generales)** (3 textos)

#### Módulos en construcción:
- `experienceModuleUnderConstruction` → "Módulo de Experiencia en construcción..."
- `settingsModuleUnderConstruction` → "Módulo de Ajustes en construcción..."
- `screenNotFound` → "Pantalla no encontrada."

#### Nombres de meses y días (hardcodeados en Interface.jsx, línea 181-182):
```javascript
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"];
```

**Archivos afectados:** `Interface.jsx`

---

### 5. **DASHBOARD** (3 textos)

#### Labels y secciones:
- `satisfactionGlobal` → "Satisfacción Global"
- `evaluationsPostSession` → "Evaluaciones post-sesión"
- `trendPositive` → "Tendencia Positiva"
- `trendStable` → "Tendencia Estable"
- `successfulDischarge` → "Alta Exitosa"

**Archivos afectados:** `Dashboard.jsx`, `Pacientes.jsx` (en la función getTrendInfo)

---

### 6. **TESTS PSICOMÉTRICOS** (8 textos - CRÍTICO)

#### Hardcodeados en Reportes.jsx, línea 77:
```javascript
const availableTests = ["BDI-II (Depresión)", "GAD-7 (Ansiedad)", "MMPI-2", 
                        "Test de Rorschach", "Test de Bender", 
                        "Test de la Figura Humana", "Escala de Estrés Percibido", "Otros"];
```

**Textos:**
- `tests.bdi2Depression` → "BDI-II (Depresión)"
- `tests.gad7Anxiety` → "GAD-7 (Ansiedad)"
- `tests.mmpi2` → "MMPI-2"
- `tests.rorschachTest` → "Test de Rorschach"
- `tests.benderTest` → "Test de Bender"
- `tests.humanFigureTest` → "Test de la Figura Humana"
- `tests.perceivedStressScale` → "Escala de Estrés Percibido"
- `tests.other` → "Otros"

**Archivos afectados:** `Reportes.jsx`

---

## 📋 Estructura Propuesta para i18n

```json
{
  "patients": {
    "statusActive": "Activo",
    "statusPending": "Pendiente",
    "statusDischarged": "Alta",
    "directoryTitle": "Directorio de Pacientes",
    "directorySubtitle": "Gestiona expedientes y consultas ({{total}} total)",
    // ... (ver MISSING_TRANSLATIONS.json)
  },
  "appointments": {
    "agendaTitle": "Agenda de Citas",
    "agendaSubtitle": "Organiza y filtra tus próximas consultas",
    // ... (ver MISSING_TRANSLATIONS.json)
  },
  "reports": {
    "title": "Evaluaciones y Reportes",
    "subtitle": "Sistematiza tus diagnósticos con el procesamiento de HorizonFlow.",
    // ... (ver MISSING_TRANSLATIONS.json)
  },
  "interface": {
    "monthNames": ["Enero", "Febrero", ...],
    "dayNames": ["Dom", "Lun", ...],
    "experienceModuleUnderConstruction": "Módulo de Experiencia en construcción..."
  },
  "dashboard": {
    "satisfactionGlobal": "Satisfacción Global",
    "evaluationsPostSession": "Evaluaciones post-sesión"
  },
  "tests": {
    "bdi2Depression": "BDI-II (Depresión)",
    "gad7Anxiety": "GAD-7 (Ansiedad)"
    // ... (ver MISSING_TRANSLATIONS.json)
  }
}
```

---

## ✅ Recomendaciones de Implementación

### Prioridad 1 (CRÍTICO - Hacerlo ya):
1. **Traducir los tests psicométricos** - Estos son textos médicos importantes
2. **Agregar traducciones faltantes en appointments** - Usuarios ven errores sin traducir
3. **Completar sección reports** - La mayoría del wizard está sin traducir

### Prioridad 2 (IMPORTANTE - Esta semana):
1. Agregar traducciones de interface (calendarios, módulos)
2. Traducir mensajes de error y validación
3. Revisar que todos los placeholders de formularios estén traducidos

### Prioridad 3 (MEJORA - Próximas 2 semanas):
1. Traducir labels del dashboard
2. Agregar más descripciones detalladas
3. Revisar coherencia de terminología médica en los 3 idiomas

---

## 🔧 Cómo Usar el JSON Generado

1. **Descarga:** `MISSING_TRANSLATIONS.json` en la carpeta raíz del proyecto
2. **Integra** los textos en tus archivos `translation.json` para cada idioma:
   - `src/locales/es/translation.json`
   - `src/locales/en/translation.json`
   - `src/locales/pt/translation.json`
3. **Reemplaza** todos los textos hardcodeados en los archivos JSX por llamadas `t()`

### Ejemplo de migración:
```javascript
// ANTES (hardcodeado):
<h1>Agenda de Citas</h1>

// DESPUÉS (traducido):
<h1>{t('appointments.agendaTitle')}</h1>
```

---

## 📂 Archivos que Necesitan Actualización

1. ✏️ **Pacientes.jsx** - 17 strings
2. ✏️ **Citas.jsx** - 32 strings
3. ✏️ **Reportes.jsx** - 48 strings
4. ✏️ **Interface.jsx** - 3 strings + arrays (monthNames, dayNames)
5. ✏️ **Dashboard.jsx** - 3 strings

---

## 🎯 Checklist de Validación

- [ ] Todos los textos de `patients` están en las 3 traducciones
- [ ] Todos los textos de `appointments` están en las 3 traducciones
- [ ] Todos los textos de `reports` están en las 3 traducciones
- [ ] Los arrays (tests, meses, días) están traducidos
- [ ] Los mensajes de error están en i18n
- [ ] Las validaciones usan `t()` en lugar de strings hardcodeados
- [ ] Los placeholders usan `t()`
- [ ] Testeado en ES, EN, y PT

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Archivos JSX analizados | 11 |
| Archivos con problemas | 5 |
| Textos no traducidos encontrados | 111 |
| Idiomas afectados | 3 (es, en, pt) |
| Nivel de criticidad | 🔴 ALTO |
| Tiempo estimado para arreglar | 2-3 horas |

