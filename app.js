let currentPage = 1;
let pageSize = 10;

let yearlyChart = null;
let distributionChart = null;

/* ========= INIT ========= */
async function initPage() {
    await loadFilters();
    await loadSummary();
    await loadTable();
}

/* ========= PAGE SWITCH ========= */
function showPage(pageId) {
    document.getElementById("summaryPage").classList.add("hidden");
    document.getElementById("analysisPage").classList.add("hidden");

    document.getElementById(pageId).classList.remove("hidden");
    if (pageId === "analysisPage") {
        loadAnalysis();
    }



}

/* ========= FILTERS ========= */
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
    let state = document.getElementById("state").value;
    let city = document.getElementById("city").value;
    let facility = document.getElementById("facility").value;

    if (year) params.append("year", year);
    if (state) params.append("state", state);
    if (city) params.append("city", city);
    if (facility) params.append("facility", facility);

    return params.toString();
}

function resetFilters() {
    document.getElementById("year").value = "";
    document.getElementById("state").value = "";
    document.getElementById("city").value = "";
    document.getElementById("facility").value = "";

    applyAll();
}

async function applyAll() {
    currentPage = 1;
    await loadSummary();
    await loadTable();
}

/* ========= SUMMARY ========= */
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

/* ========= TABLE ========= */
async function loadTable() {
    let res = await fetch(`/table?page=${currentPage}&pageSize=${pageSize}&` + buildQuery());
    let d = await res.json();

    let html = "<table><tr><th>State</th><th>Facility</th><th>City</th><th>Mortality</th></tr>";

    d.data.forEach(r => {
        html += `<tr>
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

/* ========= ANALYSIS ========= */
async function loadAnalysis() {
    let res = await fetch('/analysis');
    let d = await res.json();

    console.log("analysis loaded");

        /* ========= YEARLY TREND ========= */
    if (yearlyChart) {
        yearlyChart.destroy();
    }

    yearlyChart = new Chart(
        document.getElementById("yearlyChart"),
        {
            type: 'line',
            data: {
                labels: d.yearlyTrend.map(x => x.year),
                datasets: [{
                    label: 'Avg Mortality',
                    data: d.yearlyTrend.map(x => x.mortality),
                    fill: false,
                    tension: 0.1
                }]
            }
        }
    );

    if (!d.distribution || d.distribution.length > 100) {
        console.log("too large or invalid data, skip chart");
        return;
    }

    let bins = d.distribution.map(x => x.bin);
    let counts = d.distribution.map(x => x.count);

    new Chart(document.getElementById("distributionChart"), {
        type: 'bar',
        data: {
            labels: bins,
            datasets: [{
                label: 'Count',
                data: counts
            }]
        }
    });
}

window.onload = function () {
    initPage();
};