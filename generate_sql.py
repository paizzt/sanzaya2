import pandas as pd
import math
import re

# Read the excel file
df = pd.read_excel('PT Anugerah Pharmindo Lestari non distributor.xlsx', header=None)

# Provider Name
provider_name = "PT Anugerah Pharmindo Lestari non distributor"

sql_statements = []

# Insert Provider
sql_statements.append(f"INSERT INTO providers (name, type, created_at, updated_at) VALUES ('{provider_name}', 'Lainnya', NOW(), NOW());")
sql_statements.append("SET @provider_id = LAST_INSERT_ID();")

# Loop through rows (skip the first few rows until we find the actual data header)
start_index = 0
for index, row in df.iterrows():
    if str(row[0]).strip() == "SKU NUMBER":
        start_index = index + 1
        break
        
for index, row in df.iloc[start_index:].iterrows():
    code = row[0]
    name = row[1]
    hna = row[2]
    price = row[3]
    
    # Check if row is valid (has code and name, and price is numeric)
    if pd.isna(code) or pd.isna(name) or pd.isna(price) or pd.isna(hna):
        continue
        
    # Escape quotes
    code = str(code).replace("'", "''")
    name = str(name).replace("'", "''")
    
    # Ensure numbers
    try:
        hna = round(float(hna), 2)
        price = round(float(price), 2)
    except:
        continue
        
    sql = f"INSERT INTO provider_products (provider_id, code, name, hna, price, is_active, created_at, updated_at) VALUES (@provider_id, '{code}', '{name}', {hna}, {price}, 1, NOW(), NOW());"
    sql_statements.append(sql)

with open('insert_apl_products.sql', 'w', encoding='utf-8') as f:
    f.write("\n".join(sql_statements))

print(f"Generated {len(sql_statements)} statements.")
