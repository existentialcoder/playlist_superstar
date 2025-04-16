import ast
import json

with open("tamil_movies_db.json", "r", encoding="utf-8") as f:
    raw_text = f.read()

# Find all movie entries (assuming each is a line or separated by some pattern)
movie_entries = []
for line in raw_text.splitlines():
    if line.strip().startswith('"movies":'):
        # Extract the dictionary string
        dict_str = line.split(":", 1)[1].strip().rstrip(",")
        # Remove outer quotes
        if dict_str.startswith('"') and dict_str.endswith('"'):
            dict_str = dict_str[1:-1]
        # Convert Python dict string to actual dict
        try:
            movie_dict = ast.literal_eval(dict_str)
            movie_entries.append(movie_dict)
        except Exception as e:
            print("Error parsing:", dict_str)
            continue

# Write as valid JSON
with open("tamil_movies_db_fixed.json", "w", encoding="utf-8") as f:
    json.dump(movie_entries, f, ensure_ascii=False, indent=2)
