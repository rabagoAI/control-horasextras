// Datos iniciales de la aplicación - VACÍOS
let employees = [];
let overtimeRecords = [];
let kanbanTasks = [];
// Variables globales
let currentOvertimeId = 1;
let currentEmployeeId = 1;
let currentKanbanId = 1;
let draggedRecordId = null;
let overtimeFilterEmployeeId = '';
let overtimeFilterStatus = '';
let overtimeFilterDateFrom = '';
let overtimeFilterDateTo = '';
let employeeSearchTerm = '';
const PAGE_SIZE = 10;
let overtimeCurrentPage = 1;
let employeesCurrentPage = 1;

// countsHours: suma en los totales de horas reconocidas. hasAmount: false = se compensa en tiempo, no en €.
// countsTowardLimit: computa para el tope legal anual (art. 35.2 ET: las compensadas con descanso no computan).
const OVERTIME_STATUSES = {
    pendiente:  { label: 'Pendiente',  countsHours: false, hasAmount: true,  countsTowardLimit: false },
    aprobada:   { label: 'Aprobada',   countsHours: true,  hasAmount: true,  countsTowardLimit: true  },
    pagada:     { label: 'Pagada',     countsHours: true,  hasAmount: true,  countsTowardLimit: true  },
    disfrutada: { label: 'Disfrutada', countsHours: true,  hasAmount: false, countsTowardLimit: false },
    rechazada:  { label: 'Rechazada',  countsHours: false, hasAmount: true,  countsTowardLimit: false },
};

const HOUR_TYPES = {
    normal:   { label: 'Normal',   defaultMultiplier: 1 },
    nocturna: { label: 'Nocturna', defaultMultiplier: 1.25 },
    festivo:  { label: 'Festivo',  defaultMultiplier: 1.75 },
};

// Recargos configurados por el usuario; los que falten usan el valor por defecto
let hourTypeMultipliers = {};

function getHourTypeMultiplier(type) {
    return hourTypeMultipliers[type] ?? HOUR_TYPES[type]?.defaultMultiplier ?? 1;
}

// Registros anteriores a los tipos de hora: normales con recargo ×1
function recordHourType(record) {
    return HOUR_TYPES[record.hourType] ? record.hourType : 'normal';
}

function recordMultiplier(record) {
    return typeof record.multiplier === 'number' ? record.multiplier : 1;
}

function formatMultiplier(multiplier) {
    return `×${multiplier.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function hourTypeTagHtml(record) {
    const type = recordHourType(record);
    if (type === 'normal' && recordMultiplier(record) === 1) return '';
    return `<span class="hour-type-tag hour-type-${type}">${escapeHtml(HOUR_TYPES[type].label)} ${formatMultiplier(recordMultiplier(record))}</span>`;
}

const ANNUAL_OVERTIME_LIMIT = 80;
const ANNUAL_OVERTIME_WARNING = 60;

function getAnnualLimitHours(employeeId, year, excludeRecordId = null) {
    return overtimeRecords
        .filter(r => r.employeeId === employeeId && r.id !== excludeRecordId && r.date.startsWith(`${year}-`)
            && OVERTIME_STATUSES[r.status]?.countsTowardLimit)
        .reduce((sum, r) => sum + r.hours, 0);
}

function annualLimitLevel(hours) {
    if (hours > ANNUAL_OVERTIME_LIMIT) return 'over';
    if (hours >= ANNUAL_OVERTIME_WARNING) return 'near';
    return 'ok';
}

function statusLabel(status) {
    return OVERTIME_STATUSES[status]?.label || status;
}

function statusBadgeHtml(status) {
    const cls = OVERTIME_STATUSES[status] ? `status-${status}` : '';
    return `<span class="status-badge ${cls}">${escapeHtml(statusLabel(status))}</span>`;
}

function isRecognized(record) {
    return OVERTIME_STATUSES[record.status]?.countsHours === true;
}

function recordAmount(record) {
    return OVERTIME_STATUSES[record.status]?.hasAmount === false ? 0 : record.amount;
}

function formatRecordAmount(record) {
    return OVERTIME_STATUSES[record.status]?.hasAmount === false ? '—' : `€${record.amount.toFixed(2)}`;
}

// Departamentos disponibles; debe coincidir con las opciones de #employee-department
const ALL_DEPARTMENTS = ['Ventas', 'Marketing', 'TI', 'RRHH', 'Finanzas', 'Operaciones'];
