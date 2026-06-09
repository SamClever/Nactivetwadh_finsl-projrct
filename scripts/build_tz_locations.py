"""
Build Tanzania Regions -> Districts -> Wards JSON using Overpass API.

Usage:
  python scripts/build_tz_locations.py --out ../FRONTEND/my-react-app/public/tanzania-locations.json

This script queries Overpass for relations with admin_level 4 (regions),
then for each region queries admin_level 6 (districts) within the region area,
and for each district queries admin_level 8 (wards) within the district area.

Notes:
- Requires internet access and relies on Overpass API; if requests fail, try again.
- The script is careful to throttle queries to avoid hitting rate limits.
"""
import argparse
import json
import math
import time
from typing import List

import requests
from tqdm import tqdm

OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]

HEADERS = {"User-Agent": "nactvet-build-tz-locations/1.0 (+https://example.local)"}


def overpass_query(q: str, max_retries: int = 6) -> dict:
    # Try multiple endpoints with retries and exponential backoff on 429 or network errors
    last_exc = None
    for attempt in range(max_retries):
        for url in OVERPASS_URLS:
            try:
                resp = requests.post(url, data={"data": q}, headers=HEADERS, timeout=240)
                if resp.status_code == 429:
                    # rate limited, try next endpoint
                    last_exc = requests.exceptions.HTTPError(f"429 from {url}")
                    continue
                resp.raise_for_status()
                return resp.json()
            except Exception as e:
                last_exc = e
                # small sleep before trying next endpoint
                time.sleep(1 + attempt)
                continue
    # if we exhausted retries, raise the last exception
    if last_exc:
        raise last_exc
    raise RuntimeError("Overpass request failed without specific exception")


def fetch_regions() -> List[dict]:
    q = '[out:json][timeout:180];area["ISO3166-1"="TZ"][admin_level=2]->.country;relation["admin_level"="4"](area.country);out ids tags;'
    js = overpass_query(q)
    regions = []
    for el in js.get("elements", []):
        tags = el.get("tags", {})
        regions.append({"osm_id": el.get("id"), "id": tags.get("ISO3166-2", tags.get("name", str(el.get("id")))), "name": tags.get("name", "")})
    return regions


def fetch_districts_for_region(region_relation_id: int) -> List[dict]:
    area_id = 3600000000 + region_relation_id
    q = f'[out:json][timeout:180];relation["admin_level"="6"](area:{area_id});out ids tags;'
    js = overpass_query(q)
    districts = []
    for el in js.get("elements", []):
        tags = el.get("tags", {})
        districts.append({"osm_id": el.get("id"), "id": tags.get("ref", tags.get("name", str(el.get("id")))), "name": tags.get("name", "")})
    return districts


def fetch_wards_for_district(district_relation_id: int) -> List[dict]:
    area_id = 3600000000 + district_relation_id
    q = f'[out:json][timeout:180];relation["admin_level"="8"](area:{area_id});out ids tags;'
    js = overpass_query(q)
    wards = []
    for el in js.get("elements", []):
        tags = el.get("tags", {})
        wards.append({"osm_id": el.get("id"), "id": tags.get("ref", tags.get("name", str(el.get("id")))), "name": tags.get("name", "")})
    return wards


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", default="../FRONTEND/my-react-app/public/tanzania-locations.json")
    parser.add_argument("--pause", type=float, default=1.0, help="seconds to pause between Overpass requests (default 1s)")
    args = parser.parse_args()

    print("Fetching regions...")
    regions = fetch_regions()
    print(f"Found {len(regions)} regions")

    result = {"regions": []}

    for r in tqdm(regions, desc="Regions"):
        region_osm = r["osm_id"]
        region_id = r["id"] or str(region_osm)
        region_name = r["name"] or region_id
        time.sleep(args.pause)
        districts = fetch_districts_for_region(region_osm)
        districts_out = []
        for d in districts:
            time.sleep(args.pause)
            wards = fetch_wards_for_district(d["osm_id"])
            wards_out = [{"id": w["id"], "name": w["name"]} for w in wards]
            districts_out.append({"id": d["id"], "name": d["name"], "wards": wards_out})
        result["regions"].append({"id": region_id, "name": region_name, "districts": districts_out})

    out_path = args.out
    print(f"Writing {out_path} ...")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print("Done.")


if __name__ == "__main__":
    main()
