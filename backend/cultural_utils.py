import json

def load_cultural_data(path="../models/cultural_data.json"):
    with open(path) as f:
        return json.load(f)

region_coords = {
    "warli": {"lat": 19.6, "lon": 73.0},
    "madhubani": {"lat": 26.4, "lon": 86.1},
    "pichwai": {"lat": 24.9, "lon": 73.8},
    "kalighat": {"lat": 22.5, "lon": 88.3},
    "kangra": {"lat": 32.1, "lon": 76.3},
    "kerala_mural": {"lat": 10.5, "lon": 76.2},
    "mandana_art": {"lat": 27.6, "lon": 75.1},
    "gond": {"lat": 22.0, "lon": 80.5},
}

def generate_writeup(style_name, cultural_data):
    data = cultural_data[style_name]
    clean_name = style_name.replace("_", " ").title()
    return {
        "style": clean_name,
        "state": data["state"],
        "region": data["region"],
        "history": data["history"],
        "symbolism": data["symbolism"],
        "coordinates": region_coords[style_name],
        "summary": f"{clean_name} is a folk art tradition from {data['region']}, {data['state']}. {data['history']}"
    }