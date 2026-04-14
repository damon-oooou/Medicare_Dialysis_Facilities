from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from data_loader import load_data
import numpy as np


app = FastAPI()
app.mount("/static", StaticFiles(directory="."), name="static")

df = load_data()

# filter
def apply_filters(df, year=None, state=None, city=None, facility=None):
    result = df

    if year:
        result = result[result["year"] == year]

    if state:
        result = result[result["state"] == state]

    if city:
        result = result[result["city"] == city]

    if facility:
        result = result[result["facility"].str.contains(facility, case=False, na=False)]

    return result


@app.get("/filters")
def filters():
    return {
        "years": sorted(df["year"].dropna().unique().tolist()),
        "states": sorted(df["state"].dropna().unique().tolist()),
        "cities": sorted(df["city"].dropna().unique().tolist())
    }

@app.get("/")
def root():
    return FileResponse("index.html")

# summry
@app.get("/summary")
def summary(
    year: int = None,
    state: str = None,
    city: str = None,
    facility: str = None
):
    filtered = apply_filters(df, year, state, city, facility)

    return {
        "total": len(filtered),
        "avgMortality": filtered["mortality"].mean(),
        "minMortality": filtered["mortality"].min(),
        "maxMortality": filtered["mortality"].max(),
        "top10Highest": filtered.nlargest(10, "mortality").to_dict("records"),
        "top10Lowest": filtered.nsmallest(10, "mortality").to_dict("records"),
    }

@app.get("/table")
def table(
    page: int = 1,
    pageSize: int = 10,
    year: int = None,
    state: str = None,
    city: str = None,
    facility: str = None
):
    filtered = apply_filters(df, year, state, city, facility)

    total = len(filtered)

    start = (page - 1) * pageSize
    end = start + pageSize

    data = filtered.iloc[start:end].to_dict("records")

    return {
        "data": data,
        "page": page,
        "pageSize": pageSize,
        "total": total
    }

import numpy as np

@app.get("/analysis")
def analysis():
    yearly = df.groupby("year")["mortality"].mean().reset_index()

    counts, bins = np.histogram(df["mortality"], bins=20)

    distribution = []
    for i in range(len(counts)):
        distribution.append({
            "bin": f"{round(bins[i],1)}-{round(bins[i+1],1)}",
            "count": int(counts[i])
        })

    return {
        "yearlyTrend": yearly.to_dict("records"),
        "distribution": distribution
    }


