// Configurar el selector "Últimos X meses" de los gráficos mensuales de Reportes
function setupReportPeriodFilter() {
    const select = document.getElementById('report-period');
    if (!select) return;
    select.addEventListener('change', function() {
        createMonthlyChart();
        createAmountChart();
    });
}

// Configurar botones de exportación
function setupExportButtons() {
    const pdfBtn = document.getElementById('export-pdf-btn');
    if (pdfBtn) pdfBtn.addEventListener('click', exportToPDF);

    const excelBtn = document.getElementById('export-excel-btn');
    if (excelBtn) excelBtn.addEventListener('click', exportToExcelXLSX);

    const chartBtn = document.getElementById('generate-chart-btn');
    if (chartBtn) {
        chartBtn.addEventListener('click', function() {
            showNotification('Función de generación de gráficos personalizados en desarrollo', 'info');
        });
    }

    const backupBtn = document.getElementById('export-backup-btn');
    if (backupBtn) backupBtn.addEventListener('click', exportBackup);

    const importInput = document.getElementById('import-backup-input');
    if (importInput) {
        importInput.addEventListener('change', function() {
            if (this.files[0]) {
                importBackup(this.files[0]);
                this.value = ''; // permite reimportar el mismo archivo
            }
        });
    }
}

// Exportar a PDF
function exportToPDF() {
    showNotification('Generando reporte PDF...', 'info');
    
    // Crear nuevo documento PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título del documento
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Reporte de Horas Extras", 105, 20, { align: "center" });
    
    // Información de la empresa
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Gestor de Horas Extras", 105, 30, { align: "center" });
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 105, 35, { align: "center" });
    
    // Estadísticas
    const totalAprobadas = overtimeRecords
        .filter(record => record.status === 'aprobada')
        .reduce((sum, record) => sum + record.amount, 0);
    const totalPendientes = overtimeRecords.filter(record => record.status === 'pendiente').length;
    const horasDisfrutadas = overtimeRecords
        .filter(record => record.status === 'disfrutada')
        .reduce((sum, record) => sum + record.hours, 0);

    doc.setFont("helvetica", "bold");
    doc.text("Resumen General", 14, 45);
    doc.setFont("helvetica", "normal");
    doc.text(`Total registros: ${overtimeRecords.length}`, 14, 52);
    doc.text(`Importe total aprobado: €${totalAprobadas.toFixed(2)}`, 14, 58);
    doc.text(`Registros pendientes: ${totalPendientes}`, 14, 64);
    doc.text(`Horas disfrutadas: ${horasDisfrutadas.toFixed(1)}`, 110, 52);
    doc.text(`Total empleados: ${employees.length}`, 14, 70);
    
    // Preparar datos para la tabla
    const tableData = prepareOvertimeDataForPDF();
    
    if (tableData.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.text("No hay registros de horas extras para mostrar", 105, 90, { align: "center" });
    } else {
        // Configurar la tabla
        doc.autoTable({
            head: [['Empleado', 'Departamento', 'Fecha', 'Horas', 'Importe/H', 'Total', 'Motivo', 'Estado']],
            body: tableData,
            startY: 80,
            theme: 'grid',
            headStyles: {
                fillColor: [74, 111, 165],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak'
            },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 25 },
                2: { cellWidth: 20 },
                3: { cellWidth: 18 },
                4: { cellWidth: 15 },
                5: { cellWidth: 15 },
                6: { cellWidth: 34 },
                7: { cellWidth: 20 }
            },
            margin: { top: 80 }
        });
    }
    
    // Agregar número de página
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(`Página ${i} de ${pageCount}`, 195, 287, { align: "right" });
    }
    
    // Guardar el PDF
    const fileName = `reporte-horas-extras-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showNotification('Reporte PDF generado correctamente', 'success');
}

// Preparar datos para PDF
function prepareOvertimeDataForPDF() {
    // Ordenar registros por fecha (más reciente primero)
    const sortedRecords = [...overtimeRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return sortedRecords.map(record => {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('es-ES');
        
        // Obtener departamento del empleado
        const employee = employees.find(emp => emp.id === record.employeeId);
        const department = employee ? employee.department : 'N/A';
        
        // Acortar motivo si es muy largo
        let motivo = record.reason;
        if (motivo.length > 50) {
            motivo = motivo.substring(0, 47) + '...';
        }
        
        return [
            record.employeeName,
            department,
            formattedDate,
            recordHourType(record) === 'normal' && recordMultiplier(record) === 1
                ? record.hours.toString()
                : `${record.hours} (${HOUR_TYPES[recordHourType(record)].label} ${formatMultiplier(recordMultiplier(record))})`,
            '€' + record.rate.toFixed(2),
            formatRecordAmount(record),
            motivo,
            statusLabel(record.status)
        ];
    });
}

// Exportar a Excel (.xlsx) usando SheetJS
function exportToExcelXLSX() {
    showNotification('Generando archivo Excel (.xlsx)...', 'info');
    
    try {
        // Preparar datos para Excel
        const wb = XLSX.utils.book_new();
        
        // Hoja 1: Horas Extras
        const overtimeData = prepareOvertimeDataForExcel();
        if (overtimeData.length > 0) {
            const ws1 = XLSX.utils.json_to_sheet(overtimeData);
            XLSX.utils.book_append_sheet(wb, ws1, "Horas Extras");
        }
        
        // Hoja 2: Resumen por Departamento
        const departmentData = prepareDepartmentDataForExcel();
        if (departmentData.length > 0) {
            const ws2 = XLSX.utils.json_to_sheet(departmentData);
            XLSX.utils.book_append_sheet(wb, ws2, "Resumen por Depto");
        }
        
        // Hoja 3: Resumen por Empleado
        const employeeData = prepareEmployeeDataForExcel();
        if (employeeData.length > 0) {
            const ws3 = XLSX.utils.json_to_sheet(employeeData);
            XLSX.utils.book_append_sheet(wb, ws3, "Resumen por Empleado");
        }
        
        // Hoja 4: Metadatos
        const totalApprovedAmount = overtimeRecords
            .filter(r => r.status === 'aprobada')
            .reduce((sum, r) => sum + r.amount, 0);
        
        const metadata = [{
            "Reporte": "Horas Extras",
            "Fecha de Generación": new Date().toLocaleDateString('es-ES'),
            "Total Registros": overtimeRecords.length,
            "Horas Aprobadas": overtimeRecords
                .filter(r => r.status === 'aprobada')
                .reduce((sum, r) => sum + r.hours, 0).toFixed(2),
            "Horas Disfrutadas": overtimeRecords
                .filter(r => r.status === 'disfrutada')
                .reduce((sum, r) => sum + r.hours, 0).toFixed(2),
            "Importe Total Aprobado": '€' + totalApprovedAmount.toFixed(2),
            "Total Empleados": employees.length
        }];
        const ws4 = XLSX.utils.json_to_sheet(metadata);
        XLSX.utils.book_append_sheet(wb, ws4, "Información");
        
        // Generar nombre de archivo
        const fileName = `reporte-horas-extras-${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // Escribir archivo y descargar
        XLSX.writeFile(wb, fileName);
        
        showNotification('Archivo Excel generado correctamente', 'success');
        
    } catch (error) {
        console.error('Error al generar Excel:', error);
        showNotification('Error al generar el archivo Excel', 'error');
    }
}

// Preparar datos de horas extras para Excel
function prepareOvertimeDataForExcel() {
    // Ordenar registros por fecha
    const sortedRecords = [...overtimeRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return sortedRecords.map(record => {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('es-ES');
        
        // Obtener departamento del empleado
        const employee = employees.find(emp => emp.id === record.employeeId);
        const department = employee ? employee.department : 'N/A';
        
        return {
            "Empleado": record.employeeName,
            "Departamento": department,
            "Fecha": formattedDate,
            "Horas": record.hours,
            "Tipo de Hora": HOUR_TYPES[recordHourType(record)].label,
            "Recargo": recordMultiplier(record),
            "Importe por Hora": record.rate,
            "Importe Total": recordAmount(record),
            "Motivo": record.reason,
            "Estado": statusLabel(record.status)
        };
    });
}

// Preparar datos de resumen por departamento para Excel
function prepareDepartmentDataForExcel() {
    // Calcular importe por departamento
    const departmentSummary = {};
    
    overtimeRecords.forEach(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        if (employee && isRecognized(record)) {
            if (!departmentSummary[employee.department]) {
                departmentSummary[employee.department] = { hours: 0, amount: 0 };
            }
            departmentSummary[employee.department].hours += record.hours;
            departmentSummary[employee.department].amount += recordAmount(record);
        }
    });
    
    return Object.entries(departmentSummary).map(([department, data]) => ({
        "Departamento": department,
        "Horas Extras Aprobadas": data.hours,
        "Importe Total": data.amount,
        "Porcentaje": Object.values(departmentSummary).reduce((sum, d) => sum + d.amount, 0) > 0 ? 
            ((data.amount / Object.values(departmentSummary).reduce((sum, d) => sum + d.amount, 0)) * 100).toFixed(2) + "%" : "0%"
    }));
}

// Preparar datos de resumen por empleado para Excel
function prepareEmployeeDataForExcel() {
    // Calcular importe por empleado
    const employeeSummary = {};
    
    overtimeRecords.forEach(record => {
        if (isRecognized(record)) {
            if (!employeeSummary[record.employeeName]) {
                employeeSummary[record.employeeName] = { hours: 0, amount: 0 };
            }
            employeeSummary[record.employeeName].hours += record.hours;
            employeeSummary[record.employeeName].amount += recordAmount(record);
        }
    });

    return Object.entries(employeeSummary)
        .map(([employee, data]) => ({
            "Empleado": employee,
            "Horas Extras Aprobadas": data.hours,
            "Importe Total": data.amount
        }))
        .sort((a, b) => b["Importe Total"] - a["Importe Total"]);
}

// Cargar gráficos
function loadCharts() {
    // Gráfico de horas extras por departamento
    const departmentChartCanvas = document.getElementById('departmentChart');
    if (departmentChartCanvas) {
        createDepartmentChart();
    }
    
    // Gráfico de horas extras mensuales
    const monthlyChartCanvas = document.getElementById('monthlyChart');
    if (monthlyChartCanvas) {
        createMonthlyChart();
    }
    
    // Gráfico de importe por mes
    const amountChartCanvas = document.getElementById('amountChart');
    if (amountChartCanvas) {
        createAmountChart();
    }
    
    // Gráfico de top empleados
    const topEmployeesChartCanvas = document.getElementById('topEmployeesChart');
    if (topEmployeesChartCanvas) {
        createTopEmployeesChart();
    }
}

let departmentChartInstance = null;

// Crear gráfico de horas por departamento (sincronizado con los filtros de la tabla de Horas Extras)
function createDepartmentChart() {
    const canvas = document.getElementById('departmentChart');
    const emptyState = document.getElementById('departmentChart-empty');
    if (!canvas) return;

    // Horas por departamento dentro de los filtros activos, con el mismo criterio
    // de estado que la tarjeta "Horas Extras" (recognized, salvo que el usuario filtre por un estado concreto)
    const departmentHours = {};
    ALL_DEPARTMENTS.forEach(dep => { departmentHours[dep] = 0; });

    getFilteredOvertimeRecords().forEach(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        if (!employee) return;
        if (overtimeFilterStatus || isRecognized(record)) {
            if (!(employee.department in departmentHours)) departmentHours[employee.department] = 0;
            departmentHours[employee.department] += record.hours;
        }
    });

    const departments = Object.keys(departmentHours);
    const hours = departments.map(dep => departmentHours[dep]);
    const totalHours = hours.reduce((sum, h) => sum + h, 0);

    // Evitar el error de Chart.js "Canvas is already in use" al recrear el gráfico
    if (departmentChartInstance) {
        departmentChartInstance.destroy();
        departmentChartInstance = null;
    }

    if (totalHours === 0) {
        canvas.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    canvas.style.display = '';
    if (emptyState) emptyState.style.display = 'none';

    // Colores vivos para departamentos con horas; gris apagado para los que no tienen (quedan en la leyenda)
    const activeColors = ['#3B82F6', '#F59E0B', '#A855F7', '#EF4444', '#14B8A6', '#10B981'];
    const isDark = document.body.classList.contains('dark-mode');
    const emptyColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';
    const backgroundColor = departments.map((dep, i) =>
        departmentHours[dep] > 0 ? activeColors[i % activeColors.length] : emptyColor
    );

    const ctx = canvas.getContext('2d');
    departmentChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: departments,
            datasets: [{
                data: hours,
                backgroundColor: backgroundColor,
                borderColor: isDark ? '#0C0C0C' : '#FAFAFA',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: isDark ? '#A1A1AA' : '#3F3F46',
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    }
                }
            }
        }
    });
}

// Horas e importe reales (horas reconocidas: aprobada/pagada/disfrutada) de los últimos N meses, incluido el actual
function getMonthlyOvertimeSummary(numMonths) {
    const now = new Date();
    const buckets = [];
    for (let i = numMonths - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        let label = d.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).replace(/\.$/, '');
        label = label.charAt(0).toUpperCase() + label.slice(1);
        buckets.push({ key, label, hours: 0, amount: 0 });
    }
    const byKey = Object.fromEntries(buckets.map(b => [b.key, b]));
    overtimeRecords.forEach(record => {
        if (!isRecognized(record)) return;
        const bucket = byKey[record.date.slice(0, 7)];
        if (bucket) {
            bucket.hours += record.hours;
            bucket.amount += recordAmount(record);
        }
    });
    return buckets;
}

// Número de meses seleccionado en el desplegable "Últimos X meses" de Reportes
function getReportPeriodMonths() {
    const select = document.getElementById('report-period');
    return select ? parseInt(select.value, 10) || 3 : 3;
}

// Crear gráfico de horas mensuales
let monthlyChartInstance = null;

function createMonthlyChart() {
    const ctx = document.getElementById('monthlyChart').getContext('2d');

    const summary = getMonthlyOvertimeSummary(getReportPeriodMonths());
    const months = summary.map(b => b.label);
    const hours = summary.map(b => b.hours);

    if (monthlyChartInstance) { monthlyChartInstance.destroy(); monthlyChartInstance = null; }
    monthlyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Horas Extras',
                data: hours,
                borderColor: document.body.classList.contains('dark-mode') ? 'rgba(237, 237, 237, 0.85)' : 'rgba(74, 111, 165, 1)',
                backgroundColor: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.07)' : 'rgba(74, 111, 165, 0.1)',
                pointBackgroundColor: document.body.classList.contains('dark-mode') ? '#EDEDED' : 'rgba(74, 111, 165, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false,
                    text: 'Evolución de Horas Extras',
                    color: document.body.classList.contains('dark-mode') ? '#A1A1AA' : '#3F3F46',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#A1A1AA' : '#3F3F46'
                    }
                },
                x: {
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#A1A1AA' : '#3F3F46'
                    }
                }
            }
        }
    });
}

// Crear gráfico de importe por mes
let amountChartInstance = null;

function createAmountChart() {
    const ctx = document.getElementById('amountChart').getContext('2d');

    const summary = getMonthlyOvertimeSummary(getReportPeriodMonths());
    const months = summary.map(b => b.label);
    const amounts = summary.map(b => b.amount);

    if (amountChartInstance) { amountChartInstance.destroy(); amountChartInstance = null; }
    amountChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Importe (€)',
                data: amounts,
                backgroundColor: 'rgba(16, 185, 129, 0.75)', borderRadius: 4,
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false,
                    text: 'Importe Total por Mes',
                    color: document.body.classList.contains('dark-mode') ? '#A1A1AA' : '#3F3F46',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#A1A1AA' : '#3F3F46',
                        callback: function(value) {
                            return '€' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#A1A1AA' : '#3F3F46'
                    }
                }
            }
        }
    });
}

// Crear gráfico de top empleados por importe
let topEmployeesChartInstance = null;

function createTopEmployeesChart() {
    const ctx = document.getElementById('topEmployeesChart').getContext('2d');
    
    // Obtener top 5 empleados con más importe
    const employeeSummary = {};
    
    overtimeRecords.forEach(record => {
        if (isRecognized(record)) {
            if (!employeeSummary[record.employeeName]) {
                employeeSummary[record.employeeName] = { hours: 0, amount: 0 };
            }
            employeeSummary[record.employeeName].hours += record.hours;
            employeeSummary[record.employeeName].amount += recordAmount(record);
        }
    });

    if (Object.keys(employeeSummary).length === 0) {
        // Mostrar gráfico vacío con mensaje
        const container = document.getElementById('topEmployeesChart').parentElement;
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-light); font-style: italic;">
                <i class="fas fa-chart-bar" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                No hay datos suficientes para mostrar el ranking de empleados.
                <br>Registre horas extras aprobadas para ver el top 5.
            </div>
        `;
        return;
    }
    
    // Convertir a array y ordenar por importe
    const employeeArray = Object.entries(employeeSummary)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    
    const employeeNames = employeeArray.map(emp => emp.name);
    const employeeAmounts = employeeArray.map(emp => emp.amount);

    if (topEmployeesChartInstance) { topEmployeesChartInstance.destroy(); topEmployeesChartInstance = null; }
    topEmployeesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: employeeNames,
            datasets: [{
                label: 'Importe Total (€)',
                data: employeeAmounts,
                backgroundColor: 'rgba(59, 130, 246, 0.75)', borderRadius: 4,
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false,
                    text: 'Top 5 Empleados por Importe Total',
                    color: document.body.classList.contains('dark-mode') ? '#A1A1AA' : '#3F3F46',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#A1A1AA' : '#3F3F46',
                        callback: function(value) {
                            return '€' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: document.body.classList.contains('dark-mode') ? '#A1A1AA' : '#3F3F46',
                        maxRotation: 45
                    }
                }
            }
        }
    });
}
