// Cargar datos guardados del localStorage
function loadSavedData() {
    // Intentar cargar empleados
    const savedEmployees = localStorage.getItem('overtimeEmployees');
    if (savedEmployees) {
        try {
            employees = JSON.parse(savedEmployees);
            // Actualizar el ID actual basado en el último empleado
            if (employees.length > 0) {
                currentEmployeeId = Math.max(...employees.map(e => e.id)) + 1;
            }
        } catch (e) {
            console.error('Error al cargar empleados:', e);
            employees = [];
        }
    }
    
    // Intentar cargar registros de horas extras
    const savedOvertime = localStorage.getItem('overtimeRecords');
    if (savedOvertime) {
        try {
            overtimeRecords = JSON.parse(savedOvertime);
            // Actualizar el ID actual basado en el último registro
            if (overtimeRecords.length > 0) {
                currentOvertimeId = Math.max(...overtimeRecords.map(r => r.id)) + 1;
            }
        } catch (e) {
            console.error('Error al cargar registros de horas extras:', e);
            overtimeRecords = [];
        }
    }
    
    // Intentar cargar tareas Kanban
    const savedKanban = localStorage.getItem('kanbanTasks');
    if (savedKanban) {
        try {
            kanbanTasks = JSON.parse(savedKanban);
            // Actualizar el ID actual basado en la última tarea
            if (kanbanTasks.length > 0) {
                currentKanbanId = Math.max(...kanbanTasks.map(t => t.id)) + 1;
            }
        } catch (e) {
            console.error('Error al cargar tareas Kanban:', e);
            kanbanTasks = [];
        }
    }

    // Los totales guardados pueden venir de reglas de estado anteriores
    employees.forEach(emp => recalculateEmployeeStats(emp.id));
}

// Guardar datos en localStorage
function saveData() {
    localStorage.setItem('overtimeEmployees', JSON.stringify(employees));
    localStorage.setItem('overtimeRecords', JSON.stringify(overtimeRecords));
    localStorage.setItem('kanbanTasks', JSON.stringify(kanbanTasks));
    localStorage.setItem('dataChangedAt', new Date().toISOString());
    updateBackupReminder();
}

// ── Recordatorio de copia de seguridad ──────────────────────────────────────
const BACKUP_REMINDER_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

function readTimestamp(key) {
    const value = Date.parse(localStorage.getItem(key));
    return isNaN(value) ? null : value;
}

function markBackupDone() {
    localStorage.setItem('lastBackupAt', new Date().toISOString());
    localStorage.removeItem('backupReminderSnoozedUntil');
    updateBackupReminder();
}

function snoozeBackupReminder() {
    localStorage.setItem('backupReminderSnoozedUntil', new Date(Date.now() + DAY_MS).toISOString());
    updateBackupReminder();
}

function updateBackupReminder() {
    const lastBackup = readTimestamp('lastBackupAt');
    // Datos de antes de existir esta marca: se tratan como no respaldados
    const changedAt = readTimestamp('dataChangedAt') ?? Date.now();
    const snoozedUntil = readTimestamp('backupReminderSnoozedUntil');
    const hasData = employees.length > 0 || overtimeRecords.length > 0 || kanbanTasks.length > 0;
    const daysSinceBackup = lastBackup ? Math.floor((Date.now() - lastBackup) / DAY_MS) : null;

    const show = hasData
        && (lastBackup === null || changedAt > lastBackup)
        && (daysSinceBackup === null || daysSinceBackup >= BACKUP_REMINDER_DAYS)
        && !(snoozedUntil && snoozedUntil > Date.now());

    const lastBackupText = lastBackup
        ? new Date(lastBackup).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'nunca';

    const banner = document.getElementById('backup-reminder');
    if (banner) {
        banner.hidden = !show;
        document.getElementById('backup-reminder-text').textContent = lastBackup
            ? `Tu última copia de seguridad es de hace ${daysSinceBackup} días y hay cambios sin respaldar.`
            : 'Todavía no has hecho ninguna copia de seguridad.';
    }

    const info = document.getElementById('last-backup-info');
    if (info) info.textContent = `Última copia descargada: ${lastBackupText}`;
}

// Exportar todos los datos como JSON
function exportBackup() {
    const backup = {
        version: 1,
        exportDate: new Date().toISOString(),
        employees: employees,
        overtimeRecords: overtimeRecords,
        kanbanTasks: kanbanTasks
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-horas-extras-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    markBackupDone();
    showNotification('Backup exportado correctamente', 'success');
}

function doImportBackup(backup) {
    employees = backup.employees;
    overtimeRecords = backup.overtimeRecords;
    kanbanTasks = backup.kanbanTasks || [];

    currentEmployeeId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    currentOvertimeId = overtimeRecords.length > 0 ? Math.max(...overtimeRecords.map(r => r.id)) + 1 : 1;
    currentKanbanId = kanbanTasks.length > 0 ? Math.max(...kanbanTasks.map(t => t.id)) + 1 : 1;

    overtimeFilterEmployeeId = '';
    overtimeFilterStatus = '';
    overtimeFilterDateFrom = '';
    overtimeFilterDateTo = '';
    overtimeCurrentPage = 1;
    employeesCurrentPage = 1;

    saveData();
    // Los datos coinciden con el archivo importado, que ya es una copia
    markBackupDone();
    loadDashboardData();
    loadEmployeesTable();
    loadEmployeeSelect();
    loadOvertimeTable();
    loadKanbanBoard();
    loadCharts();

    showNotification(`Backup importado: ${employees.length} empleados, ${overtimeRecords.length} registros`, 'success');
}

// Importar datos desde un archivo JSON de backup
function importBackup(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);

            if (!Array.isArray(backup.employees) || !Array.isArray(backup.overtimeRecords)) {
                showNotification('El archivo no tiene el formato correcto', 'error');
                return;
            }

            const exportDateStr = backup.exportDate
                ? new Date(backup.exportDate).toLocaleDateString('es-ES')
                : 'desconocida';

            showConfirmModal({
                title: 'Importar backup',
                message: `Se reemplazarán TODOS los datos actuales con los del backup del ${exportDateStr}.`,
                warning: `Contenido: ${backup.employees.length} empleados · ${backup.overtimeRecords.length} registros de horas · ${(backup.kanbanTasks || []).length} tareas Kanban`,
                confirmText: 'Importar',
                danger: false,
                onConfirm: () => doImportBackup(backup)
            });
        } catch (err) {
            showNotification('Error al leer el archivo de backup', 'error');
        }
    };
    reader.readAsText(file);
}
