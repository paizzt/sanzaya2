import pandas as pd
import json
import io
import sys

csv_file = 'C:\\xampp\\htdocs\\sanzaya2\\vendor_balance_01-10-2026.csv'
try:
    df = pd.read_csv(csv_file)
except Exception as e:
    print(f"Error reading CSV: {e}")
    sys.exit(1)

# Clean columns
df.columns = df.columns.str.strip()

grouped = df.groupby('Supplier')
sql_statements = ["SET FOREIGN_KEY_CHECKS = 0;"]

# Ensure PT SANZAYA company exists (or just get its ID)
sql_statements.append("SET @company_id = (SELECT id FROM companies WHERE name = 'PT SANZAYA' LIMIT 1);")

# If you want to replace ALL payables for PT SANZAYA:
sql_statements.append("DELETE FROM payables WHERE company_id = @company_id;")

sql_statements.append("-- Insert Providers if they don't exist")
unique_providers = df['Supplier'].dropna().unique()
sql_statements.append("INSERT IGNORE INTO `providers` (`name`, `created_at`, `updated_at`) VALUES")
provider_values = []
for provider in unique_providers:
    provider_clean = str(provider).strip().replace("'", "''")
    provider_values.append(f"('{provider_clean}', NOW(), NOW())")
sql_statements.append(",\n".join(provider_values) + ";\n")

sql_statements.append("-- Insert Payables")
for supplier, group in grouped:
    supplier_clean = str(supplier).strip().replace("'", "''")
    
    # Calculate totals per year based on Saldo
    year_totals = {}
    for index, row in group.iterrows():
        date_str = str(row['Date']).strip()
        # Date is dd/mm/yyyy
        parts = date_str.split('/')
        if len(parts) == 3:
            year = parts[2].strip()
        else:
            year = "Unknown"
            
        saldo = float(row['Saldo']) if pd.notna(row['Saldo']) else 0.0
        if year not in year_totals:
            year_totals[year] = 0.0
        year_totals[year] += saldo
        
    details = []
    total = 0
    for year, amount in year_totals.items():
        details.append({"year": year, "amount": amount})
        total += amount
        
    details_json = json.dumps(details).replace("'", "''")
    sql = f"INSERT INTO payables (company_id, provider_id, details, total, created_at, updated_at) VALUES (@company_id, (SELECT id FROM providers WHERE name = '{supplier_clean}' LIMIT 1), '{details_json}', {total}, NOW(), NOW());"
    sql_statements.append(sql)

sql_statements.append("SET FOREIGN_KEY_CHECKS = 1;")

with open('C:\\xampp\\htdocs\\sanzaya2\\update_hutang_sanzaya_01_10_2026.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_statements))

print("SQL generated successfully to update_hutang_sanzaya_01_10_2026.sql")
