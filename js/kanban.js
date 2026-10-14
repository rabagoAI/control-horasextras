// Panel Kanban: los registros de horas extras organizados por estado
const KANBAN_ICONS = {
    pendiente: 'fa-hourglass-half',
    aprobada: 'fa-check-circle',
    pagada: 'fa-euro-sign',
    disfrutada: 'fa-umbrella-beach',
    rechazada: 'fa-times-circle',
};

let kanbanFilterEmployeeId = '';
let kanbanFilterMonths = 3;

// Las pendientes requieren acción, así que no se ocultan por antigüedad
function getKanbanRecords() {
    let from = null;
    if (kanbanFilterMonths > 0) {
        const d = new Date();
        d.setMonth(d.getMonth() - kanbanFilterMonths);
        from = d.toISOString().slice(0, 10);
    }
    return overtimeRecords.filter(r =>
        (!kanbanFilterEmployeeId || r.employeeId === parseInt(kanbanFilterEmployeeId)) &&
        (r.status === 'pendiente' || !from || r.date >= from)
    );
}

function populateKanbanEmployeeFilter() {
    const select = document.getElementById('kanban-employee-filter');
    const current = select.value;
    select.innerHTML = '<option value="">Todos los empleados</option>';
    employees.forEach(emp => select.add(new Option(emp.name, emp.id)));
    select.value = current;
    if (select.value !== current) kanbanFilterEmployeeId = '';
}

function loadKanbanBoard() {
    populateKanbanEmployeeFilter();
    const board = document.getElementById('kanban-board');
    board.innerHTML = '';
    const records = getKanbanRecords().sort((a, b) => b.date.localeCompare(a.date));

    Object.entries(OVERTIME_STATUSES).forEach(([status, { label }]) => {
        const inColumn = records.filter(r => r.status === status);
        const hours = inColumn.reduce((sum, r) => sum + r.hours, 0);

        const column = document.createElement('div');
        column.className = `kanban-column kanban-column-${status}`;
        column.dataset.status = status;
        column.innerHTML = `
            <div class="kanban-header">
                <h3><i class="fas ${KANBAN_ICONS[status]}"></i> ${escapeHtml(label)}</h3>
                <span class="kanban-count">${inColumn.length}</span>
            </div>
            <div class="kanban-column-meta">${formatHours(hours)}</div>
            <div class="kanban-cards"></div>`;

        const cards = column.querySelector('.kanban-cards');
        if (inColumn.length === 0) {
            cards.innerHTML = '<p class="kanban-empty">Sin registros</p>';
        } else {
            inColumn.forEach(record => cards.appendChild(createKanbanCard(record)));
        }

        setupKanbanDropZone(column);
        board.appendChild(column);
    });
}

function createKanbanCard(record) {
    const card = document.createElement('div');
    card.className = `kanban-card kanban-card-${record.status}`;
    card.draggable = true;
    card.tabIndex = 0;
    card.dataset.id = record.id;
    card.setAttribute('aria-label', `${record.employeeName}, ${record.hours} horas, ${statusLabel(record.status)}. Pulsa Intro para editar.`);

    const date = new Date(record.date + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    card.innerHTML = `
        <div class="kanban-card-top">
            <h4 title="${escapeHtml(record.employeeName)}">${escapeHtml(record.employeeName)}</h4>
            <strong>${formatRecordAmount(record)}</strong>
        </div>
        <div class="kanban-card-meta">
            <time>${date}</time> · ${formatHours(record.hours)}${hourTypeTagHtml(record)}
        </div>
        <p>${escapeHtml(record.reason)}</p>`;

    card.addEventListener('dragstart', function(e) {
        draggedRecordId = record.id;
        // Firefox no inicia el arrastre sin datos asociados
        e.dataTransfer.setData('text/plain', String(record.id));
        e.dataTransfer.effectAllowed = 'move';
        this.classList.add('dragging');
    });
    card.addEventListener('dragend', function() {
        this.classList.remove('dragging');
        draggedRecordId = null;
    });
    card.addEventListener('click', () => editOvertime(record.id));
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter') editOvertime(record.id);
    });

    return card;
}

function setupKanbanDropZone(column) {
    column.addEventListener('dragover', function(e) {
        if (draggedRecordId === null) return;
        e.preventDefault();
        this.classList.add('dragover');
    });
    column.addEventListener('dragleave', function(e) {
        if (!this.contains(e.relatedTarget)) this.classList.remove('dragover');
    });
    column.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('dragover');
        const record = overtimeRecords.find(r => r.id === draggedRecordId);
        draggedRecordId = null;
        if (!record || record.status === this.dataset.status) return;
        changeRecordsStatus(new Set([record.id]), this.dataset.status, { confirm: false });
    });
}

function setupKanban() {
    document.getElementById('kanban-employee-filter').addEventListener('change', function() {
        kanbanFilterEmployeeId = this.value;
        loadKanbanBoard();
    });
    document.getElementById('kanban-period-filter').addEventListener('change', function() {
        kanbanFilterMonths = parseInt(this.value, 10) || 0;
        loadKanbanBoard();
    });
}
