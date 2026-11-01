import "dotenv/config";
import { createServer } from "node:http";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Не задана переменная окружения DATABASE_URL");
}

const port = Number(process.env.API_PORT ?? 3001);
const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 5000,
  max: 10,
});

const MAX_LIGHTS_PER_VIEW = 5000;

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function parseBounds(url) {
  if (
    !["west", "south", "east", "north"].every((name) =>
      url.searchParams.has(name),
    )
  ) {
    return null;
  }

  const values = ["west", "south", "east", "north"].map((name) =>
    Number(url.searchParams.get(name)),
  );
  const [west, south, east, north] = values;

  if (
    values.some((value) => !Number.isFinite(value)) ||
    west < -180 ||
    east > 180 ||
    south < -90 ||
    north > 90 ||
    west >= east ||
    south >= north ||
    east - west > 5 ||
    north - south > 5
  ) {
    return null;
  }

  return { west, south, east, north };
}

async function handleRequest(request, response) {
  const url = new URL(request.url ?? "/", "http://localhost");

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method !== "GET" || url.pathname !== "/api/osm-traffic-lights") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  const bounds = parseBounds(url);
  if (!bounds) {
    sendJson(response, 400, { error: "Invalid map bounds" });
    return;
  }

  try {
    const { rows } = await pool.query(
      `SELECT id::text AS id,
              ST_Y(geom) AS lat,
              ST_X(geom) AS lng,
              red_duration_seconds AS "redSeconds",
              green_duration_seconds AS "greenSeconds",
              active_from_seconds AS "activeFromSeconds",
              active_until_seconds AS "activeUntilSeconds",
              phase_offset_seconds AS "phaseOffsetSeconds"
       FROM nav_nodes
       WHERE tags ->> 'highway' = 'traffic_signals'
         AND geom && ST_MakeEnvelope($1, $2, $3, $4, 4326)
       ORDER BY id
       LIMIT $5`,
      [
        bounds.west,
        bounds.south,
        bounds.east,
        bounds.north,
        MAX_LIGHTS_PER_VIEW + 1,
      ],
    );

    if (rows.length > MAX_LIGHTS_PER_VIEW) {
      sendJson(response, 413, {
        error: "Too many traffic lights in this area; zoom in",
      });
      return;
    }

    sendJson(response, 200, rows);
  } catch (error) {
    console.error("Не удалось загрузить OSM-светофоры из PostgreSQL", error);
    sendJson(response, 500, { error: "Failed to load traffic lights" });
  }
}

const server = createServer((request, response) => {
  void handleRequest(request, response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Traffic light API listening on port ${port}`);
});

pool.on("error", (error) => {
  console.error("Ошибка пула соединений PostgreSQL", error);
});

function shutdown() {
  server.close(() => {
    void pool.end().finally(() => process.exit(0));
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
