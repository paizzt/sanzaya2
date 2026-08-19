import pandas as pd
import json
import re

# Parse Excel
df = pd.read_excel('PT karya pratama distributor.xlsx', skiprows=2)
df = df.dropna(subset=['Nama Produk', 'Harga Pembulatan'])

kp_products = []
for index, row in df.iterrows():
    nama = str(row['Nama Produk']).strip()
    if nama == 'nan' or not nama: continue
    
    tipe = str(row['Tipe']).strip() if pd.notna(row['Tipe']) else ''
    merk = str(row['MERK']).strip() if pd.notna(row['MERK']) else ''
    harga = str(row['Harga Pembulatan']).replace(',', '').replace('.0', '').strip()
    link = str(row['LINK V6']).strip() if pd.notna(row['LINK V6']) else ''
    tkdn = str(row['TKDN']).strip() if pd.notna(row['TKDN']) else '0'
    
    name_full = f"{nama} {merk}".strip()
    
    kp_products.append({
        'name': name_full,
        'code': tipe,
        'price': harga if harga.isdigit() else '0',
        'link': link if link != '.' else '',
        'tkdn': tkdn if tkdn else '0',
        'merk': merk
    })

with open('karya_pratama.json', 'w') as f:
    json.dump(kp_products, f)

# Parse PDF text
pdf_text = """
1 DA-100c Methamphetamine Card 1,058,750 42,350 2,007,500 40,150 
2 DA-100s Methamphetamine Strip 687,500 27,500 1,320,000 26,400 
3 DA-101c Cocaine Card 1,058,750 42,350 2,007,500 40,150 
4 DA-101s Cocaine Strip 687,500 27,500 1,320,000 26,400 
5 DA-102c THC Card 1,058,750 42,350 2,007,500 40,150 
6 DA-102s THC Strip 687,500 27,500 1,320,000 26,400 
7 DA-103c Morphine Card 1,058,750 42,350 2,007,500 40,150 
8 DA-103s Morphine Strip 687,500 27,500 1,320,000 26,400 
9 DA-104c Amphetamine Card 1,058,750 42,350 2,007,500 40,150 
10 DA-104s Amphetamine Strip 687,500 27,500 1,320,000 26,400 
11 DA-105c Barbiturate Card 1,058,750 42,350 2,007,500 40,150 
12 DA-106c Benzodiazepine Card 1,058,750 42,350 2,007,500 40,150 
13 DA-106s Benzodiazepine Strip 687,500 27,500 1,320,000 26,400 
14 DA-110c Cotinine Card 1,058,750 42,350 2,007,500 40,150 
15 DA-107c MDMA Card 1,058,750 42,350 2,007,500 40,150 
16 DA-109s Alcohol (Urine) Test Strip 1,512,500 60,500 2,887,500 57,750 
17 DA-301p Amp, Morp, THC (3 in 1) Panel 3,300,000 132,000 6,022,500 120,450 
18 DA-501p Amp, Morp, THC, Meth, Benz (5 in 1) Panel 5,500,000 220,000 10,037,500 200,750 
19 DA-601p Amp, Morp, THC, Meth, Benz, Coc (6 in 1) Panel 6,600,000 264,000 12,045,000 240,900 
20 DA-701p Amp, Morp, THC, Meth, Benz, Coc,SOMA (7 in 1) Panel 7,700,000 308,000 14,052,500 281,050
21 DA-C901 Multi Drug (6 in 1) Cup CUP 7,411,250 296,450 14,822,500 296,450 
22 DA-C801 Multi Drug (6 in 1) + pH & Creatinine EZ Key 357,500 8,937,500 17,875,000 357,500 
23 IR-102c HBsAg Antigen Card 1,003,750 40,150 2,007,500 40,150 
24 IR-104c Syphilis Antibody Card 1,375,000 55,000 2,695,000 53,900 
25 IR-105c H. Pylori Antibody Card 2,695,000 107,800 5,390,000 107,800 
26 IR-113c Dengue IgG/IgM Card 3,767,500 150,700 7,535,000 150,700 
27 IR-114c Dengue NS-1 Antigen Card 4,207,500 168,300 8,415,000 168,300 
28 IR-120c Malaria Antigen Card 2,337,500 93,500 4,675,000 93,500 
29 IR-121c Typhoid Antibody Card 2,983,750 119,350 5,967,500 119,350 
30 CE-100c Troponin I Card 4,262,500 170,500 8,525,000 170,500 
31 FH-100c HCG Card 783,750 31,350 1,567,500 31,350 
32 FH-100s HCG Strip 453,750 18,150 907,500 18,150 
33 OT-102c Fecal Occult Blood Card 1,436,875 57,475 2,873,750 57,475 
34 OT-103c FOB + Transferrin Card 1,966,250 78,650 3,932,500 78,650 
35 IR-100c EZiTELL HIV 1.2 Rapid Test Card 1,650,000 66,000 
36 DOA-164 EZITELL Multi Drug 6 Panel Panel 6,600,000 264,000 
37 IRJB-301p Multi Drug 6 in 1 Panel 6,600,000 264,000 
38 IRJB-101c HIV Antibody (JB MED) Card 1,650,000 66,000 
39 IRJB-100c HBsAg Antigen (JB MED) Card 1,003,750 40,150 
40 IRO-100c HIV Antibody (ONCOPROBE) Card 1,650,000 66,000 
41 IRO-101c HCV Antibody (ONCOPROBE) Card 1,512,500 60,500 
"""
oncoprobe_products = []
lines = pdf_text.strip().split('\n')
for line in lines:
    line = line.strip()
    if not line: continue
    
    parts = line.split()
    code = parts[1]
    name_parts = []
    
    kemasan = ""
    price1 = "0"
    price2 = "0"
    
    prices = re.findall(r'\b\d{1,3}(?:,\d{3})+\b', line)
    if not prices: continue
    
    if len(prices) >= 2:
        price1 = prices[0].replace(',', '')
        if len(prices) >= 3:
            price2 = prices[2].replace(',', '')
    
    text_before_prices = line[:line.find(prices[0])].strip()
    bp = text_before_prices.split()
    code = bp[1]
    
    kemasan_candidates = ['Card', 'Strip', 'Panel', 'CUP', 'EZ Key']
    kemasan_found = ''
    for kc in kemasan_candidates:
        if text_before_prices.endswith(kc):
            kemasan_found = kc
            text_before_prices = text_before_prices[:-len(kc)].strip()
            break
            
    name = " ".join(text_before_prices.split()[2:])
    
    oncoprobe_products.append({
        'name': name,
        'code': code,
        'unit': kemasan_found,
        'price_25': price1,
        'price_50': price2
    })

with open('oncoprobe.json', 'w') as f:
    json.dump(oncoprobe_products, f)

print("JSON files generated!")
