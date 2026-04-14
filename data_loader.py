import pandas as pd

def load_data():
    df = pd.read_csv("cleaned_dialysis_mortality.csv")

    df = df.rename(columns={
        "Provider_Name": "facility",
        "state": "state",
        "city": "city",
        "mortality": "mortality",
        "year": "year"
    })

    df = df.dropna(subset=["mortality"])
    df["mortality"] = pd.to_numeric(df["mortality"], errors="coerce")

    return df