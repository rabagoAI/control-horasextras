// Datos iniciales de la aplicación - VACÍOS
let employees = [];
let overtimeRecords = [];
let kanbanTasks = [];
// Variables globales
let currentOvertimeId = 1;
let currentEmployeeId = 1;
let currentKanbanId = 1;
let draggedTask = null;
let overtimeFilterEmployeeId = '';
let overtimeFilterStatus = '';
let overtimeFilterDateFrom = '';
let overtimeFilterDateTo = '';
let employeeSearchTerm = '';
const PAGE_SIZE = 10;
let overtimeCurrentPage = 1;
let employeesCurrentPage = 1;

// countsHours: suma en los totales de horas reconocidas. hasAmount: false = se compensa en tiempo, no en €.
const OVERTIME_STATUSES = {
    pendiente:  { label: 'Pendiente',  countsHours: false, hasAmount: true  },
    aprobada:   { label: 'Aprobada',   countsHours: true,  hasAmount: true  },
    pagada:     { label: 'Pagada',     countsHours: true,  hasAmount: true  },
    disfrutada: { label: 'Disfrutada', countsHours: true,  hasAmount: false },
    rechazada:  { label: 'Rechazada',  countsHours: false, hasAmount: true  },
};

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
