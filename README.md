# Mortality Dashboard

A full-stack mortality analysis dashboard built with FastAPI, JavaScript, HTML, and Chart.js.

## Features

* Filter by Year, State, City, and Facility
* Summary statistics (total, average, min, max mortality)
* Top 10 highest and lowest mortality facilities
* Mortality comparison by state
* National average reference line
* Mortality rate trend by year
* Pagination for full data table
* Outlier highlighting
* Export filtered results to CSV

## How to Run

Install dependencies:

```bash
pip install fastapi uvicorn pandas numpy
```

Start the server:

```bash
uvicorn main:app --reload
```

Open in browser:

```text
http://127.0.0.1:8000
```
