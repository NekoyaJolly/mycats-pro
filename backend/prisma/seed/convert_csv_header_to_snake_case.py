import csv
import re

# 変換対象CSV
INPUT = "/Users/nekoya/mycats/backend/prisma/seed/testdatepedigrees100.csv"
OUTPUT = "/Users/nekoya/mycats/backend/prisma/seed/testdatepedigrees100_snake.csv"

# CamelCase→snake_case変換関数
# 例: CatName → cat_name
#     PedigreeID → pedigree_id
#     FFJCU → ff_jcu

def camel_to_snake(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    s2 = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1)
    return s2.lower()

with open(INPUT, encoding="utf-8") as fin, open(OUTPUT, "w", encoding="utf-8", newline="") as fout:
    reader = csv.reader(fin)
    writer = csv.writer(fout)
    header = next(reader)
    snake_header = [camel_to_snake(h.strip()) for h in header]
    writer.writerow(snake_header)
    for row in reader:
        writer.writerow(row)

print(f"変換完了: {OUTPUT}")
