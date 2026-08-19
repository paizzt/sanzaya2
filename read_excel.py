import pandas as pd
df = pd.read_excel('PT karya pratama distributor.xlsx')
print(df.head(10).to_string())
