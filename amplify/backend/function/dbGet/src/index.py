"""
dbGet Lambda — CRUD handler for FarmData, NodeData, DummyMeasurements,
and the legacy beaconHillDB time-series table.

Routes are determined by the API Gateway proxy path and HTTP method.
All DynamoDB table names are configurable via environment variables so
the same code works across Amplify environments.
"""

import json
import os
from decimal import Decimal

import boto3
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource("dynamodb")

FARM_TABLE = os.environ.get("FARM_TABLE", "FarmData")
NODE_TABLE = os.environ.get("NODE_TABLE", "NodeData")
DUMMY_TABLE = os.environ.get("DUMMY_TABLE", "DummyMeasurements")
BEACON_TABLE = os.environ.get("BEACON_TABLE", "beaconHillDB-dev")

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

class DecimalEncoder(json.JSONEncoder):
    """Serialize Decimal values returned by DynamoDB to int/float."""

    def default(self, o):
        if isinstance(o, Decimal):
            return int(o) if o == int(o) else float(o)
        return super().default(o)


def _response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body, cls=DecimalEncoder),
    }


def _parse_body(event):
    raw = event.get("body")
    if raw is None:
        return {}
    if isinstance(raw, str):
        return json.loads(raw)
    return raw


def _coerce_numbers(item, number_keys):
    """Convert string values to Decimal for known numeric attributes."""
    for key in number_keys:
        if key in item and item[key] is not None:
            try:
                item[key] = Decimal(str(item[key]))
            except Exception:
                pass
    return item


# ---------------------------------------------------------------------------
# /farmItems
# ---------------------------------------------------------------------------

FARM_NUMBER_KEYS = ("lat", "lon", "numberOfNodes")


def handle_farm_items(method, event):
    table = dynamodb.Table(FARM_TABLE)

    if method == "GET":
        result = table.scan()
        return _response(200, result.get("Items", []))

    body = _parse_body(event)

    if method == "POST":
        _coerce_numbers(body, FARM_NUMBER_KEYS)
        table.put_item(Item=body)
        return _response(201, body)

    if method == "PUT":
        _coerce_numbers(body, FARM_NUMBER_KEYS)
        table.put_item(Item=body)
        return _response(200, body)

    if method == "DELETE":
        farm_id = body.get("farmId")
        if not farm_id:
            return _response(400, {"error": "farmId is required"})
        # Cascade-delete all nodes belonging to this farm.
        _delete_nodes_for_farm(farm_id)
        table.delete_item(Key={"farmId": farm_id})
        return _response(200, {"deleted": farm_id})

    return _response(405, {"error": f"Method {method} not allowed"})


# ---------------------------------------------------------------------------
# /nodeItems
# ---------------------------------------------------------------------------

NODE_NUMBER_KEYS = ("lat", "lon")


def handle_node_items(method, event):
    table = dynamodb.Table(NODE_TABLE)

    if method == "GET":
        result = table.scan()
        return _response(200, result.get("Items", []))

    body = _parse_body(event)

    if method == "POST":
        _coerce_numbers(body, NODE_NUMBER_KEYS)
        table.put_item(Item=body)
        return _response(201, body)

    if method == "PUT":
        _coerce_numbers(body, NODE_NUMBER_KEYS)
        table.put_item(Item=body)
        return _response(200, body)

    if method == "DELETE":
        node_id = body.get("nodeId")
        if not node_id:
            return _response(400, {"error": "nodeId is required"})
        table.delete_item(Key={"nodeId": node_id})
        return _response(200, {"deleted": node_id})

    return _response(405, {"error": f"Method {method} not allowed"})


def _delete_nodes_for_farm(farm_id):
    """Remove all NodeData entries whose farmId matches (cascade delete)."""
    table = dynamodb.Table(NODE_TABLE)
    result = table.scan(FilterExpression=Attr("farmId").eq(farm_id))
    with table.batch_writer() as batch:
        for item in result.get("Items", []):
            batch.delete_item(Key={"nodeId": item["nodeId"]})


# ---------------------------------------------------------------------------
# /dummyItems  (read-only, for measurement dashboard)
# ---------------------------------------------------------------------------

def handle_dummy_items(method, event):
    if method != "GET":
        return _response(405, {"error": f"Method {method} not allowed"})
    table = dynamodb.Table(DUMMY_TABLE)
    result = table.scan()
    return _response(200, result.get("Items", []))


# ---------------------------------------------------------------------------
# /items  (legacy time-series endpoint)
# ---------------------------------------------------------------------------

def handle_items(method, event):
    if method != "GET":
        return _response(405, {"error": f"Method {method} not allowed"})
    table = dynamodb.Table(BEACON_TABLE)
    result = table.scan()
    return _response(200, result.get("Items", []))


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

ROUTE_MAP = {
    "/farmItems": handle_farm_items,
    "/nodeItems": handle_node_items,
    "/dummyItems": handle_dummy_items,
    "/items": handle_items,
}


def handler(event, context):
    method = event.get("httpMethod", "")

    if method == "OPTIONS":
        return _response(200, {})

    path = event.get("path", "")
    route_handler = ROUTE_MAP.get(path)
    if route_handler is None:
        return _response(404, {"error": f"Unknown path: {path}"})

    try:
        return route_handler(method, event)
    except Exception as exc:
        print(f"ERROR handling {method} {path}: {exc}")
        return _response(500, {"error": str(exc)})
