import json
import os
import sys
import uuid
import logging
import re
from typing import List, Dict, Any, Optional
from copy import deepcopy

try:
    from bson import ObjectId  # provided by pymongo
except Exception:  # fallback if bson unavailable
    ObjectId = None

import typer
from dotenv import load_dotenv
from openai import OpenAI
from pymongo import MongoClient
from jsonschema import validate, ValidationError

# --- Logging setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger("recipe_transformer")

def set_verbosity(verbose: bool):
    logger.setLevel(logging.DEBUG if verbose else logging.INFO)

# --- Load environment and schema ---
load_dotenv()
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DATABASE_NAME = os.getenv("DATABASE_NAME", "dindin")
COLLECTION_NAME = os.getenv("RECIPES_COLLECTION", "recipes")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    logger.error("OPENAI_API_KEY is missing.")
    sys.exit(1)

client = OpenAI()
mongo_client = MongoClient(MONGODB_URI)
collection = mongo_client[DATABASE_NAME][COLLECTION_NAME]

try:
    with open("recipe_schema.json", "r") as f:
        SCHEMA = json.load(f)
except FileNotFoundError:
    logger.error("recipe_schema.json not found.")
    sys.exit(1)

# --- Helpers ---
def generate_oid():
    """Return a valid ObjectId container matching the schema ({"$oid": "24hex"})."""
    if ObjectId is not None:
        oid = str(ObjectId())
    else:
        # Fallback: 24-hex derived from uuid4; matches regex even if not monotonic
        oid = uuid.uuid4().hex[:24]
    logger.debug(f"Generated ObjectId: {oid}")
    return {"$oid": oid}

_OID_RE = re.compile(r"^[0-9a-fA-F]{24}$")


def ensure_valid_oid(doc: Dict[str, Any]) -> None:
    """Ensure doc["_id"] exists and matches schema shape. If missing or invalid, replace with a new one."""
    _id = doc.get("_id")
    if not isinstance(_id, dict) or "$oid" not in _id or not isinstance(_id["$oid"], str) or not _OID_RE.match(_id["$oid"] or ""):
        logger.warning("_id missing or invalid; injecting a valid ObjectId.")
        doc["_id"] = generate_oid()


# --- Extended JSON to storage conversion ---
def to_storage(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a schema-valid document (Extended JSON) into a storage-ready document for MongoDB.
    - Converts {"_id": {"$oid": "…"}} to ObjectId("…")
    - Normalizes import_metadata.confidence_score if provided as {"$numberDouble": "…"}
    """
    out = deepcopy(doc)

    # _id: {"$oid": "24hex"} -> ObjectId("24hex")
    _id = out.get("_id")
    if isinstance(_id, dict) and "$oid" in _id and isinstance(_id["$oid"], str):
        try:
            if ObjectId is not None:
                out["_id"] = ObjectId(_id["$oid"])
            else:
                # Fallback: keep plain 24hex if bson not available
                out["_id"] = _id["$oid"]
            logger.debug("Converted Extended JSON _id to storage-ready value.")
        except Exception as e:
            logger.warning(f"Invalid $oid provided; generating new ObjectId. Reason: {e}")
            out["_id"] = ObjectId() if ObjectId is not None else uuid.uuid4().hex[:24]

    # import_metadata.confidence_score may arrive as Extended JSON Double
    im = out.get("import_metadata")
    if isinstance(im, dict):
        cs = im.get("confidence_score")
        if isinstance(cs, dict) and "$numberDouble" in cs:
            raw = cs["$numberDouble"]
            try:
                if raw == "NaN":
                    im["confidence_score"] = float("nan")
                elif raw == "Infinity":
                    im["confidence_score"] = float("inf")
                elif raw == "-Infinity":
                    im["confidence_score"] = float("-inf")
                else:
                    im["confidence_score"] = float(raw)
                logger.debug("Normalized import_metadata.confidence_score from $numberDouble.")
            except Exception:
                logger.debug("Leaving confidence_score as-is; could not parse $numberDouble.")

    return out

def normalize_input(data: Any) -> List[Dict[str, Any]]:
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get("recipes"), list):
        return data["recipes"]
    raise ValueError("Input must be a JSON array or object with 'recipes' array.")

def call_openai_transform(scraped: Dict[str, Any], model: str) -> Dict[str, Any]:
    schema_props = json.dumps(SCHEMA["properties"], indent=2)
    prompt = (
        "You are a data transformer converting scraped recipe content into a strict JSON schema for a restaurant app.\n"
        "Rules:\n"
        "- Fill missing fields plausibly.\n"
        "- Keep numbers as integers when required.\n"
        "- Dates in ISO8601 (UTC).\n"
        "- Do NOT fetch or validate external URLs; just use the provided ones.\n"
        "- Output exactly one JSON object matching the schema (no extra text).\n\n"
        f"Here is the scraped recipe JSON:\n{json.dumps(scraped, indent=2)}\n\n"
        f"Below is the target schema's top-level properties:\n{schema_props}"
    )
    resp = client.chat.completions.create(
        model=model,
        temperature=0.2,
        messages=[
            {"role": "system", "content": "You format data to match strict JSON schemas perfectly."},
            {"role": "user", "content": prompt}
        ]
    )
    content = resp.choices[0].message.content
    if content and content.strip().startswith("```"):
        content = content.strip().strip("`")
    return json.loads(content)

# --- Main CLI ---
def main(
    input_file: str = typer.Option("raw_scraped_recipes.json", help="Path to scraped input JSON file"),
    limit: Optional[int] = typer.Option(None, help="Process only first N recipes"),
    dry_run: bool = typer.Option(False, help="Validate only; do not insert into MongoDB"),
    output_file: Optional[str] = typer.Option(None, help="Save validated results to this file"),
    model: str = typer.Option("gpt-4o-mini", help="OpenAI chat model"),
    verbose: bool = typer.Option(False, "--verbose/--no-verbose", help="Enable DEBUG logging"),
):
    set_verbosity(verbose)
    logger.info("Starting transform …")

    if not os.path.exists(input_file):
        logger.error(f"Input file not found: {input_file}")
        raise typer.Exit(code=1)

    try:
        with open(input_file, "r") as f:
            raw = json.load(f)
        recipes = normalize_input(raw)
    except Exception as e:
        logger.error(f"Failed to read/parse input: {e}")
        raise typer.Exit(code=1)

    if limit:
        recipes = recipes[:limit]

    valid_out = []
    for idx, r in enumerate(recipes, 1):
        title = r.get("title") or r.get("name") or "Untitled"
        logger.info(f"[{idx}/{len(recipes)}] {title}")
        try:
            transformed = call_openai_transform(r, model=model)
            # Ensure a valid Mongo-style _id present for schema validation
            ensure_valid_oid(transformed)
            transformed.setdefault("__v", 0)
            transformed.setdefault("isActive", True)
            try:
                validate(instance=transformed, schema=SCHEMA)
                logger.info("Schema validation passed.")
            except ValidationError as ve:
                logger.error(f"Schema validation failed: {ve.message}")
                continue
            valid_out.append(transformed)
            if not dry_run:
                try:
                    storage_doc = to_storage(transformed)
                    collection.insert_one(storage_doc)
                    logger.info("Inserted into MongoDB (storage-converted).")
                except Exception as e:
                    logger.error(f"MongoDB insert failed: {e}")
        except Exception as e:
            logger.error(f"Error transforming recipe: {e}")

    if output_file:
        try:
            with open(output_file, "w") as f:
                json.dump(valid_out, f, indent=2)
            logger.info(f"Saved {len(valid_out)} validated recipe(s) to {output_file}")
        except Exception as e:
            logger.error(f"Failed to save output: {e}")

if len(sys.argv) > 1 and sys.argv[1].lower() == "transform":
    sys.argv.pop(1)

if __name__ == "__main__":
    try:
        typer.run(main)
    except Exception as e:
        logger.error(f"CLI terminated with an unhandled exception: {e}")
        raise
