let currentPage = 1;
let pageSize = 10;

let stateChart = null;
let yearlyChart = null;

async function initPage() {
    await loadFilters();
    await loadSummary();
    await loadTable();
}

function showPage(pageId) {
    document.getElementById("summaryPage").classList.add("hidden");
    document.getElementById("analysisPage").classList.add("hidden");

    document.getElementById(pageId).classList.remove("hidden");

    if (pageId === "analysisPage") {
        loadAnalysis();
    }
}

async function loadFilters() {
    let res = await fetch('/filters');
    let d = await res.json();

    fillSelect("year", d.years);
    fillSelect("state", d.states);
}

function fillSelect(id, data) {
    let select = document.getElementById(id);
    select.innerHTML = `<option value="">All</option>`;

    data.forEach(v => {
        select.innerHTML += `<option value="${v}">${v}</option>`;
    });
}

function buildQuery() {
    let params = new URLSearchParams();

    let year = document.getElementById("year").value;
    let city = document.getElementById("city").value;
    let facility = document.getElementById("facility").value;

    let states = [
        ...document.getElementById("state").selectedOptions
    ].map(o => o.value);

    if (year) params.append("year", year);

    states.forEach(s => {
        if (s) {
            params.append("state", s);
        }
    });

    if (city) params.append("city", city);
    if (facility) params.append("facility", facility);

    return params.toString();
}

function resetFilters() {
    document.getElementById("year").value = "";
    document.getElementById("city").value = "";
    document.getElementById("facility").value = "";

    let stateSelect = document.getElementById("state");
    for (let option of stateSelect.options) {
        option.selected = false;
    }

    applyAll();
}

async function applyAll() {
    currentPage = 1;
    await loadSummary();
    await loadTable();

    if (!document.getElementById("analysisPage").classList.contains("hidden")) {
        await loadAnalysis();
    }
}

async function loadSummary() {
    let res = await fetch('/summary?' + buildQuery());
    let d = await res.json();

    let html = `
        <div class="card">Total: ${d.total}</div>
        <div class="card">Avg: ${d.avgMortality.toFixed(2)}</div>
        <div class="card">Min: ${d.minMortality}</div>
        <div class="card">Max: ${d.maxMortality}</div>
    `;

    document.getElementById("summaryCards").innerHTML = html;

    renderTopTable("topHighest", d.top10Highest);
    renderTopTable("topLowest", d.top10Lowest);
}

function renderTopTable(containerId, data) {
    let html = "<table><tr><th>Facility</th><th>Mortality</th></tr>";

    data.forEach(r => {
        html += `<tr>
            <td>${r.facility}</td>
            <td>${r.mortality}</td>
        </tr>`;
    });

    html += "</table>";
    document.getElementById(containerId).innerHTML = html;
}

async function loadTable() {
    let res = await fetch(`/table?page=${currentPage}&pageSize=${pageSize}&` + buildQuery());
    let d = await res.json();

    let html = "<table><tr><th>State</th><th>Facility</th><th>City</th><th>Mortality</th></tr>";

    d.data.forEach(r => {
        html += `<tr style="${r.outlier ? 'background:#ffe5e5' : ''}">
            <td>${r.state}</td>
            <td>${r.facility}</td>
            <td>${r.city}</td>
            <td>${r.mortality}</td>
        </tr>`;
    });

    html += "</table>";

    document.getElementById("tableContainer").innerHTML = html;
    document.getElementById("pageInfo").innerText = `Page ${d.page}`;
}

function nextPage() {
    currentPage++;
    loadTable();
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadTable();
    }
}

async function loadAnalysis() {
    let res = await fetch('/analysis?' + buildQuery());
    let d = await res.json();

    if (stateChart) {
        stateChart.destroy();
    }

    stateChart = new Chart(
        document.getElementById("stateChart"),
        {
            type: "bar",
            data: {
                labels: d.byState.map(x => x.state),
                datasets: [
                    {
                        label: "State Avg Mortality",
                        data: d.byState.map(x => x.mortality)
                    },

                    {
                        label: "National Average",
                        type: "line",
                        data: d.byState.map(() => Number(d.nationalAverage)),
                        borderWidth: 3,
                        pointRadius: 0,
                        fill: false,
                        tension: 0
                    }
                ]
            }
        }
    );

    if (yearlyChart) {
        yearlyChart.destroy();
    }

    if (d.yearlyTrend && d.yearlyTrend.length > 0) {
    if (yearlyChart) {
        yearlyChart.destroy();
    }

    yearlyChart = new Chart(
        document.getElementById("yearlyChart"),
        {
            type: "line",
            data: {
                labels: d.yearlyTrend.map(x => String(x.year)),
                datasets: [{
                    label: "Average Mortality by Year",
                    data: d.yearlyTrend.map(x => Number(x.mortality)),
                    borderColor: "blue",
                    backgroundColor: "blue",
                    borderWidth: 3,
                    pointRadius: 4,
                    fill: false,
                    tension: 0
                }]
            },
            options: {
                responsive: true
            }
        }
    );
};
}

function exportCSV() {
    window.open('/export?' + buildQuery());
}

window.onload = function () {
    initPage();
};
