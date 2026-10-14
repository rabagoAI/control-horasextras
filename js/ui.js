// ── Modal de confirmación ────────────────────────────────────────────────────
function showConfirmModal({ title = '¿Estás seguro?', message = '', warning = '', confirmText = 'Eliminar', danger = true, onConfirm, onCancel = null }) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;

    const warningEl = document.getElementById('confirm-warning');
    warningEl.textContent = warning;
    warningEl.style.display = warning ? 'block' : 'none';

    const okBtn = document.getElementById('confirm-ok-btn');
    okBtn.textContent = confirmText;
    okBtn.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;

    const wrapper = document.getElementById('confirm-icon-wrapper');
    const icon = document.getElementById('confirm-icon');
    if (danger) {
        wrapper.className = 'confirm-icon-wrapper';
        icon.className = 'fas fa-trash-alt';
    } else {
        wrapper.className = 'confirm-icon-wrapper confirm-warning-icon';
        icon.className = 'fas fa-exclamation-triangle';
    }

    const modal = document.getElementById('confirm-modal');
    modal.classList.add('active');

    const cleanup = () => {
        okBtn.removeEventListener('click', handleOk);
        cancelBtn.removeEventListener('click', handleCancel);
        modal.removeEventListener('click', handleBackdrop);
    };

    const handleOk = () => { modal.classList.remove('active'); cleanup(); onConfirm(); };
    const handleCancel = () => { modal.classList.remove('active'); cleanup(); if (onCancel) onCancel(); };
    const handleBackdrop = (e) => { if (e.target === modal) handleCancel(); };

    const cancelBtn = document.getElementById('confirm-cancel-btn');
    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
    modal.addEventListener('click', handleBackdrop);
}

// ── Paginación ───────────────────────────────────────────────────────────────
function renderPagination(containerId, currentPage, totalPages, totalItems, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = totalItems > 0
            ? `<span class="pagination-info">${totalItems} registro${totalItems !== 1 ? 's' : ''}</span>`
            : '';
        return;
    }

    const from = (currentPage - 1) * PAGE_SIZE + 1;
    const to = Math.min(currentPage * PAGE_SIZE, totalItems);

    container.innerHTML = `
        <span class="pagination-info">${from}–${to} de ${totalItems} registros</span>
        <div class="pagination-pages">
            <button class="pagination-btn" id="${containerId}-prev" ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Anterior
            </button>
            <button class="pagination-btn active">${currentPage} / ${totalPages}</button>
            <button class="pagination-btn" id="${containerId}-next" ${currentPage === totalPages ? 'disabled' : ''}>
                Siguiente <i class="fas fa-chevron-right"></i>
            </button>
        </div>
    `;

    container.querySelector(`#${containerId}-prev`)?.addEventListener('click', () => onPageChange(currentPage - 1));
    container.querySelector(`#${containerId}-next`)?.addEventListener('click', () => onPageChange(currentPage + 1));
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ── Estado vacío ─────────────────────────────────────────────────────────────
function emptyStateHtml(icon, title, desc, btnText = '', btnAction = '') {
    const btn = btnText
        ? `<button class="btn btn-primary" onclick="${btnAction}"><i class="fas fa-plus"></i> ${btnText}</button>`
        : '';
    return `
        <div class="empty-state">
            <div class="empty-state-icon"><i class="fas fa-${icon}"></i></div>
            <p class="empty-state-title">${title}</p>
            <p class="empty-state-desc">${desc}</p>
            ${btn}
        </div>`;
}

// Mostrar error de validación inline bajo un campo del formulario
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    const formGroup = field.closest('.form-group');
    if (!formGroup) return;
    formGroup.classList.add('has-error');
    let errorSpan = formGroup.querySelector('.field-error');
    if (!errorSpan) {
        errorSpan = document.createElement('span');
        errorSpan.className = 'field-error';
        field.after(errorSpan);
    }
    errorSpan.textContent = message;
    errorSpan.style.display = 'block';
    field.focus();
}

// Limpiar todos los errores de validación de un formulario
function clearFieldErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.field-error').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });
    form.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
}

// Configurar eventos de modales
function setupModals() {
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.modal-close');
    
    // Botón para agregar horas extras
    document.getElementById('add-overtime-btn').addEventListener('click', function() {
        openOvertimeModal();
    });
    
    // Botón para agregar empleado
    document.getElementById('add-employee-btn').addEventListener('click', function() {
        openEmployeeModal();
    });
    
    // Cerrar modales al hacer clic en el botón de cerrar o fuera del modal
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
        });
    });
    
    // Cerrar modal al hacer clic fuera del contenido
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    // Cargar lista de empleados en el select de horas extras
    loadEmployeeSelect();

    // Autorellenar tarifa al elegir empleado en el formulario de horas
    document.getElementById('employee-select').addEventListener('change', function() {
        if (this.value) {
            const emp = employees.find(e => e.id === parseInt(this.value));
            if (emp) document.getElementById('overtime-rate').value = emp.hourlyRate;
        }
        updateOvertimeAmountPreview();
    });
    ['overtime-hours', 'overtime-rate', 'overtime-hour-type'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateOvertimeAmountPreview);
        document.getElementById(id).addEventListener('change', updateOvertimeAmountPreview);
    });
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${escapeHtml(message)}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Estilos para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 400px;
    `;
    
    // Agregar estilos para el botón de cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: auto;
    `;
    
    // Agregar animación de entrada
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Configurar evento para cerrar
    closeBtn.addEventListener('click', function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}
