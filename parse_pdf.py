import pdfplumber
import json
import re

pdf_path = "RINCIAN PIUTANG SANZAYA GROUP 2026 - Google Spreadsheet.pdf"

def clean_number(s):
    if not s:
        return 0
    s = s.strip()
    if s == '' or s == '-' or 'Rp -' in s or s == '-Rp - -':
        return 0
    s = s.replace('Rp', '').replace('.', '').replace(' ', '').replace(',', '.').replace('-', '')
    if s == '':
        return 0
    try:
        return float(s)
    except:
        return 0

sql_output = "-- Script Reset & Update Piutang dari PDF\n-- Aman untuk PT lain (MSI, CV Meraki, BUMA)\n\n"
sql_output += "-- RESET DATA UNTUK 3 PT TERSEBUT\n"
sql_output += "DELETE FROM `receivables` WHERE `company_id` IN (1, 2, 4);\n\n"

with pdfplumber.open(pdf_path) as pdf:
    for page in pdf.pages:
        table = page.extract_table()
        if not table:
            continue
        
        for row in table:
            if len(row) < 14:
                continue
            
            no = str(row[0]).strip()
            if not no.isdigit():
                continue
            
            nama = str(row[1]).strip()
            if not nama or nama == "None":
                continue
            
            nama = nama.replace("'", "''")
            
            sanzaya_2024 = clean_number(row[2])
            sanzaya_2025 = clean_number(row[3])
            sanzaya_2026 = clean_number(row[4])
            sanzaya_total = clean_number(row[5])
            
            ruma_2025 = clean_number(row[7])
            ruma_2026 = clean_number(row[8])
            ruma_total = clean_number(row[9])
            
            harkes = clean_number(row[11])
            
            if sanzaya_total == 0 and ruma_total == 0 and harkes == 0:
                continue
            
            sql_output += f"INSERT INTO `outlets` (`name`, `created_at`, `updated_at`) SELECT '{nama}', NOW(), NOW() FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM `outlets` WHERE `name` = '{nama}');\n"
            sql_output += f"SET @outlet_id = (SELECT `id` FROM `outlets` WHERE `name` = '{nama}' LIMIT 1);\n\n"
            
            # PT Sanzaya (2)
            if sanzaya_total > 0:
                details = []
                if sanzaya_2024 > 0: details.append({"year": "2024", "amount": str(sanzaya_2024)})
                if sanzaya_2025 > 0: details.append({"year": "2025", "amount": str(sanzaya_2025)})
                if sanzaya_2026 > 0: details.append({"year": "2026", "amount": str(sanzaya_2026)})
                json_str = json.dumps(details).replace("'", "''")
                
                sql_output += f"INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 2, '{json_str}', {sanzaya_total}, NOW(), NOW());\n"
                
            # PT Ruma (1)
            if ruma_total > 0:
                details = []
                if ruma_2025 > 0: details.append({"year": "2025", "amount": str(ruma_2025)})
                if ruma_2026 > 0: details.append({"year": "2026", "amount": str(ruma_2026)})
                json_str = json.dumps(details).replace("'", "''")
                
                sql_output += f"INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 1, '{json_str}', {ruma_total}, NOW(), NOW());\n"
                
            # PT Harkes (4)
            if harkes > 0:
                details = []
                details.append({"year": "2026", "amount": str(harkes)})
                json_str = json.dumps(details).replace("'", "''")
                
                sql_output += f"INSERT INTO `receivables` (`outlet_id`, `company_id`, `details`, `total`, `created_at`, `updated_at`) VALUES (@outlet_id, 4, '{json_str}', {harkes}, NOW(), NOW());\n"
                
            sql_output += "\n"

with open("update_piutang_pdf.sql", "w", encoding="utf-8") as f:
    f.write(sql_output)

print("Done")
