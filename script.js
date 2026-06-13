const data = {
    2023: {
        kpi: {
            students: { value: 26234, unit: "чел.", label: "Численность\nстудентов" },
            success: { value: 13, unit: "%", label: "Успеваемость\n(доля защитивших аспирантов)" },
            staff: { value: 60, unit: "%", label: "Кадры\n(доля с учеными степенями)" },
            pubs: { value: 1079, unit: "шт.", label: "Публикации\nScopus" }
        },
        institutes: [
            "Институт инженерной физики и радиоэлектроники",
            "Институт цветных металлов",
            "Политехнический институт",
            "Институт нефти и газа",
            "Гуманитарный институт"
        ],
        pubsValues: [174, 172, 107, 97, 95],
        doughnut: { labels: ["Кандидаты — 49%", "Без степени — 40%", "Доктора — 11%"], values: [49,40,11], colors: ["#66748B","#3B82F6","#224B8F"] },
        line: { labels: ["2020","2021","2022","2023"], values: [null, 890, 1010, 1079] }
    },
    2025: {
        kpi: {
            students: { value: 27771, unit: "чел.", label: "Численность\nстудентов" },
            success: { value: 19, unit: "%", label: "Успеваемость\n(доля защитивших аспирантов)" },
            staff: { value: 59, unit: "%", label: "Кадры\n(доля с учеными степенями)" },
            pubs: { value: 917, unit: "шт.", label: "Публикации\nScopus" }
        },
        institutes: [
            "Институт цветных металлов",
            "Институт инженерной физики и радиоэлектроники",
            "Гуманитарный институт",
            "Институт космических и информационных технологий",
            "Институт нефти и газа"
        ],
        pubsValues: [175, 162, 116, 105, 94],
        doughnut: { labels: ["Кандидаты — 48%", "Без степени — 41%", "Доктора — 11%"], values: [48,41,11], colors: ["#66748B","#3B82F6","#224B8F"] },
        line: { labels: ["2022","2023","2024","2025"], values: [1010, 1079, null, 917] }
    }
};

function calcDelta(base2023, val2025, unit) {
    let diff = val2025 - base2023;
    if (diff === 0) return null;
    let sign = diff > 0 ? '+' : '';
    let txt = sign + diff;
    if (unit === 'чел.') txt += ' чел.';
    else if (unit === '%') txt += '%';
    else txt = sign + diff + ' ' + unit;
    return { text: txt, positive: diff > 0 };
}

function renderKPI(year) {
    let kd = data[year].kpi;
    let base = data[2023].kpi;
    let grid = document.getElementById('kpiGrid');
    grid.innerHTML = '';
    for (let key of ['students', 'success', 'staff', 'pubs']) {
        let it = kd[key];
        let deltaHtml = '';
        if (year === '2025') {
            let d = calcDelta(base[key].value, it.value, it.unit);
            deltaHtml = d ? `<div class="kpi-delta ${d.positive ? 'positive' : 'negative'}">${d.text} за два года</div>` : `<div class="kpi-delta">0 за два года</div>`;
        } else {
            deltaHtml = `<div class="kpi-delta">— за год</div>`;
        }
        let card = document.createElement('div');
        card.className = 'kpi-card';
        card.innerHTML = `<h4>${it.label.replace(/\n/g, '<br>')}</h4><div class="kpi-value">${it.value.toLocaleString()} <span class="kpi-unit">${it.unit}</span></div>${deltaHtml}`;
        grid.appendChild(card);
    }
}

function renderBarChart(year) {
    const institutes = data[year].institutes;
    const values = data[year].pubsValues;
    const maxVal = Math.max(...values, 180);
    const container = document.getElementById('barChartContainer');
    container.innerHTML = '';

    for (let i = 0; i < institutes.length; i++) {
        const row = document.createElement('div');
        row.className = 'bar-row';
        const labelDiv = document.createElement('div');
        labelDiv.className = 'bar-label';
        labelDiv.textContent = institutes[i];
        const graphDiv = document.createElement('div');
        graphDiv.className = 'bar-graph';
        const fillDiv = document.createElement('div');
        fillDiv.className = 'bar-fill';
        const widthPercent = (values[i] / maxVal) * 100;
        fillDiv.style.width = `${widthPercent}%`;
        graphDiv.appendChild(fillDiv);
        const valueDiv = document.createElement('div');
        valueDiv.className = 'bar-value';
        valueDiv.textContent = values[i];
        row.appendChild(labelDiv);
        row.appendChild(graphDiv);
        row.appendChild(valueDiv);
        container.appendChild(row);
    }

    const scaleRow = document.createElement('div');
    scaleRow.className = 'bar-scale-row';
    const emptyLeft = document.createElement('div');
    emptyLeft.className = 'bar-scale-empty';
    const scaleWrapper = document.createElement('div');
    scaleWrapper.className = 'bar-scale-wrapper';
    const emptyRight = document.createElement('div');
    emptyRight.className = 'bar-scale-empty';
    scaleRow.appendChild(emptyLeft);
    scaleRow.appendChild(scaleWrapper);
    scaleRow.appendChild(emptyRight);
    container.appendChild(scaleRow);

    const scaleDiv = document.createElement('div');
    scaleDiv.className = 'bar-scale';
    const ticks = [0, 45, 90, 135, maxVal];
    for (let tick of ticks) {
        const span = document.createElement('span');
        span.textContent = tick;
        const percent = (tick / maxVal) * 100;
        span.style.left = `${percent}%`;
        scaleDiv.appendChild(span);
    }
    scaleWrapper.appendChild(scaleDiv);

    updateVerticalLines(container, year);
}

function updateVerticalLines(container, year) {
    // Удаляем старые линии
    const oldLines = container.querySelectorAll('.bar-vertical-line');
    oldLines.forEach(line => line.remove());

    const firstRow = container.querySelector('.bar-row');
    if (!firstRow) return;
    const graphCol = firstRow.querySelector('.bar-graph');
    if (!graphCol) return;

    const containerRect = container.getBoundingClientRect();
    const graphRect = graphCol.getBoundingClientRect();
    const left = graphRect.left - containerRect.left;
    const width = graphRect.width;
    const maxVal = Math.max(...data[year].pubsValues, 180);
    const ticks = [0, 45, 90, 135, maxVal];
    ticks.forEach(tick => {
        const percent = tick / maxVal;
        const lineLeft = left + percent * width;
        const line = document.createElement('div');
        line.className = 'bar-vertical-line';
        line.style.left = `${lineLeft}px`;
        container.appendChild(line);
    });
}

let doughnutChart;
function initDoughnutChart(year) {
    let ctx = document.getElementById('doughnutChart').getContext('2d');
    let d = data[year].doughnut;
    if (doughnutChart) doughnutChart.destroy();
    doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: d.labels,
            datasets: [{
                data: d.values,
                backgroundColor: d.colors,
                borderWidth: 0,
                cutout: '70%',
                spacing: 3,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ctx.label } }, datalabels: { display: false } }
        },
        plugins: [ChartDataLabels]
    });
    updateDoughnutLegend(year);
    updateDoughnutCenter(year);
}
function updateDoughnutLegend(year) {
    let d = data[year].doughnut;
    let legendDiv = document.getElementById('doughnutLegend');
    legendDiv.innerHTML = '';
    d.labels.forEach((label, idx) => {
        let item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `<div class="legend-color" style="background:${d.colors[idx]};"></div><span>${label}</span>`;
        legendDiv.appendChild(item);
    });
}
function updateDoughnutCenter(year) {
    let percent = (year === '2023') ? '60%' : '59%';
    let centerDiv = document.getElementById('doughnutCenterText');
    centerDiv.innerHTML = `<div class="pps-label">ППС</div><div class="pps-value">${percent}</div><div class="pps-sub">со степенью</div>`;
}
function updateDoughnutChart(year) {
    let d = data[year].doughnut;
    doughnutChart.data.labels = d.labels;
    doughnutChart.data.datasets[0].data = d.values;
    doughnutChart.data.datasets[0].backgroundColor = d.colors;
    doughnutChart.update();
    updateDoughnutLegend(year);
    updateDoughnutCenter(year);
}
let lineChart;
function initLineChart(year) {
    let ctx = document.getElementById('lineChart').getContext('2d');
    let ld = data[year].line;
    let labels = [...ld.labels];
    let values = [...ld.values];
    if (year === '2023' && values[0] === null) values[0] = 890;
    if (lineChart) lineChart.destroy();
    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Публикации Scopus',
                data: values,
                borderColor: '#3B82F6',
                borderWidth: 3,
                pointBackgroundColor: (ctx) => {
                    if (year === '2023' && ctx.dataIndex === 0) return 'transparent';
                    return 'white';
                },
                pointBorderColor: (ctx) => {
                    if (year === '2023' && ctx.dataIndex === 0) return 'transparent';
                    return '#3B82F6';
                },
                pointBorderWidth: 3,
                pointRadius: (ctx) => {
                    if (year === '2023' && ctx.dataIndex === 0) return 0;
                    return 8;
                },
                pointHoverRadius: 10,
                tension: 0.2,
                fill: false,
                spanGaps: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: { callbacks: { label: (ctx) => ctx.raw ? `${ctx.raw} публикаций` : 'нет данных' } },
                datalabels: {
                    align: 'top',
                    offset: 8,
                    formatter: (value, context) => {
                        if (value === null) return '';
                        if (year === '2023' && context.dataIndex === 0 && context.dataset.data[0] === 890) return '';
                        return value;
                    },
                    font: { size: 10, family: 'Open Sans' },
                    color: '#6B7280'
                },
                legend: { display: false }
            },
            scales: {
                y: { min: 800, max: 1100, grid: { color: '#e5e7eb' }, ticks: { stepSize: 100, callback: (v) => v, color: '#6B7280' } },
                x: { ticks: { color: '#6B7280' }, grid: { display: true, color: '#e5e7eb', lineWidth: 1 } }
            }
        },
        plugins: [ChartDataLabels]
    });
}
function updateLineChart(year) {
    let ld = data[year].line;
    let labels = [...ld.labels];
    let values = [...ld.values];
    if (year === '2023' && values[0] === null) values[0] = 890;
    lineChart.data.labels = labels;
    lineChart.data.datasets[0].data = values;
    lineChart.data.datasets[0].pointBackgroundColor = (ctx) => {
        if (year === '2023' && ctx.dataIndex === 0) return 'transparent';
        return 'white';
    };
    lineChart.data.datasets[0].pointBorderColor = (ctx) => {
        if (year === '2023' && ctx.dataIndex === 0) return 'transparent';
        return '#3B82F6';
    };
    lineChart.data.datasets[0].pointRadius = (ctx) => {
        if (year === '2023' && ctx.dataIndex === 0) return 0;
        return 8;
    };
    lineChart.update();
}
function switchYear(year) {
    renderKPI(year);
    renderBarChart(year);
    updateDoughnutChart(year);
    updateLineChart(year);
    document.querySelectorAll('.year-btn').forEach(btn => {
        if (btn.dataset.year === year) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}
document.addEventListener('DOMContentLoaded', () => {
    renderKPI('2023');
    renderBarChart('2023');
    initDoughnutChart('2023');
    initLineChart('2023');
    document.querySelectorAll('.year-btn').forEach(btn => {
        btn.addEventListener('click', () => switchYear(btn.dataset.year));
    });
});
// Следим за изменением размеров контейнера (включая zoom)
const barContainer = document.getElementById('barChartContainer');
if (barContainer) {
    const resizeObserver = new ResizeObserver(() => {
        const activeYearBtn = document.querySelector('.year-btn.active');
        if (activeYearBtn) {
            const year = activeYearBtn.dataset.year;
            updateVerticalLines(barContainer, year);
        }
    });
    resizeObserver.observe(barContainer);
}