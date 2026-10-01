import pandas as pd

df = pd.read_csv('vendor_balance_01-10-2026.csv')
df.columns = df.columns.str.strip()
print(f"Total Saldo: {df['Saldo'].sum()}")
print(f"Total Jumlah: {df['Jumlah'].sum()}")
