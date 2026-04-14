import pandas as pd

df = pd.read_csv("cleaned_dialysis_mortality.csv")

print(df["mortality"].mean())
print(df["mortality"].max())
print(df["mortality"].min())
top10 = df.sort_values("mortality", ascending=False).head(10)
print(top10[["Provider_Name", "mortality"]])
