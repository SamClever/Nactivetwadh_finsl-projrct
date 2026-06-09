Build Tanzania locations JSON

This script fetches Regions -> Districts -> Wards from the OpenStreetMap Overpass API
and writes a consolidated JSON suitable for the frontend at `FRONTEND/my-react-app/public/tanzania-locations.json`.

Setup

1. Create and activate a Python virtualenv (recommended):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

Run

```powershell
python build_tz_locations.py --out ../FRONTEND/my-react-app/public/tanzania-locations.json
```

Notes

- The script uses the Overpass API and may take several minutes.
- If you hit rate limits, increase `--pause` (seconds) between requests: `--pause 2.0`.
- The generated file will contain a structure: { "regions": [ { id, name, districts: [ { id, name, wards: [ {id,name} ] } ] } ] }.
