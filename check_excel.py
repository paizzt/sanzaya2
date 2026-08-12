import pandas as pd

def check_excel(file_path):
    print(f"\n--- Checking {file_path} ---")
    try:
        df = pd.read_excel(file_path, header=None, nrows=15)
        df = df.fillna('')
        print(df.to_string(index=False, justify='left'))
    except Exception as e:
        print("Error:", e)

check_excel('PRICE LIST = PT. INDOCORE PERKASA (NON DISTRIBUTOR).xlsx')
check_excel('price list SNA MEDIKA (Non distributor).xls')
