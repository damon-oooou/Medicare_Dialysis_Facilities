import os
import pandas as pd

def load_data():
    BASE_DIR = os.path.dirname(__file__)

    csv_path = os.path.join(BASE_DIR, "cleaned_dialysis_mortality.csv")
    
    df = pd.read_csv(csv_path)

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