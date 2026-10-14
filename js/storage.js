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
