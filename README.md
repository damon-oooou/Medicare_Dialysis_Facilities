# Mortality Dashboard

A full-stack mortality analysis dashboard built with FastAPI, JavaScript, HTML, and Chart.js. The application provides interactive filtering, mortality statistics, trend analysis, and data visualization for dialysis facility mortality data.

---

## Features

- Filter by Year, State, City, and Facility
- Summary statistics (total, average, min, max mortality)
- Top 10 highest and lowest mortality facilities
- Mortality comparison by state
- National average reference line
- Mortality trend analysis by year
- Pagination for full data table
- Outlier highlighting
- Export filtered results to CSV
- Dockerized deployment support

---

## Tech Stack

### Backend
- Python
- FastAPI
- Pandas
- NumPy

### Frontend
- HTML
- JavaScript
- Chart.js

### Deployment
- Docker

---

## Project Structure

```text
├── main.py
├── data_loader.py
├── requirements.txt
├── Dockerfile
├── cleaned_dialysis_mortality.csv
├── index.html
└── app.js



## How to Run

### Option 1 — Run Locally

Install dependencies:

```bash
pip install -r requirements.txt

uvicorn main:app --reload

Open in browser:  http://127.0.0.1:8000


Option 2 — Run with Docker

Pull Docker image:  docker pull damonouuuuu/dialysis-dashboard

Run Docker container: docker run -p 8000:8000 damonouuuuu/dialysis-dashboard

Open in browser:   http://localhost:8000
