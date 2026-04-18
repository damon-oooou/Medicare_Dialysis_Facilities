from fastapi import FastAPI, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from data_loader import load_data
import numpy as np
import io

app = FastAPI()
app.mount("/static", StaticFiles(directory="."), name="static")

df = load_data()


def apply_filters(df, year=None, states=None, city=None, facility=None):
    result = df.copy()

    if year:
        result = result[result["year"] == year]

    if states:
        result = result[result["state"].isin(states)]

    if city:
        result = result[result["city"] == city]

    if facility:
        result = result[
            result["facility"].str.contains(
                facility,
                case=False,
                na=False
            )
        ]

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


@app.get("/summary")
def summary(
    year: int = None,
    state: list[str] = Query(default=[]),
    city: str = None,
    facility: str = None
):
    filtered = apply_filters(
        df,
        year=year,
        states=state,
        city=city,
        facility=facility
    )

    return {
        "total": len(filtered),
        "avgMortality": round(filtered["mortality"].mean(), 2),
        "minMortality": round(filtered["mortality"].min(), 2),
        "maxMortality": round(filtered["mortality"].max(), 2),
        "top10Highest": filtered.nlargest(10, "mortality").to_dict("records"),
        "top10Lowest": filtered.nsmallest(10, "mortality").to_dict("records"),
    }


@app.get("/table")
def table(
    page: int = 1,
    pageSize: int = 10,
    year: int = None,
    state: list[str] = Query(default=[]),
    city: str = None,
    facility: str = None
):
    filtered = apply_filters(
        df,
        year=year,
        states=state,
        city=city,
        facility=facility
    )

    q1 = filtered["mortality"].quantile(0.25)
    q3 = filtered["mortality"].quantile(0.75)
    iqr = q3 - q1

    filtered["outlier"] = (
        (filtered["mortality"] > q3 + 1.5 * iqr) |
        (filtered["mortality"] < q1 - 1.5 * iqr)
    )

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


@app.get("/analysis")
def analysis(
    year: int = None,
    state: list[str] = Query(default=[]),
    city: str = None,
    facility: str = None
):
    filtered = apply_filters(
        df,
        year=year,
        states=state,
        city=city,
        facility=facility
    )

    by_state = (
        filtered
        .groupby("state")["mortality"]
        .mean()
        .reset_index()
    )

    national_avg = round(filtered["mortality"].mean(), 2)

    yearly_trend = (
        filtered
        .groupby("year")["mortality"]
        .mean()
        .reset_index()
    )

    return {
        "byState": by_state.to_dict("records"),
        "yearlyTrend": yearly_trend.to_dict("records"),
        "nationalAverage": national_avg
    }


@app.get("/export")
def export_csv(
    year: int = None,
    state: list[str] = Query(default=[]),
    city: str = None,
    facility: str = None
):
    filtered = apply_filters(
        df,
        year=year,
        states=state,
        city=city,
        facility=facility
    )

    stream = io.StringIO()
    filtered.to_csv(stream, index=False)
    stream.seek(0)

    return StreamingResponse(
        stream,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=filtered_data.csv"
        }
    )
