# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## OSM traffic lights from PostgreSQL

At zoom 16 and higher, the map requests OSM nodes inside the visible map bounds
from `GET /api/osm-traffic-lights`. The API reads `nav_nodes` and selects rows
whose JSONB tag `highway` is `traffic_signals`. OSM does not contain signal
timings, so the popup uses the application's default cycle and labels it as
estimated.

The PostgreSQL API runs separately from Vite. Copy `.env.example` to `.env`,
replace the placeholders with the database login, and run the API and frontend
in separate terminals:

```powershell
npm run api
npm run dev
```

The Vite development server proxies `/api` to the Node API on port 3001. Search
and route requests use the Go API endpoints `POST /api/v1/search/places` and
`POST /api/v1/routes`; Vite proxies `/api/v1` to `localhost:8080`. The Go API
must be started separately; it is not launched by `npm run api`. If the Node
API runs in Docker, use the PostgreSQL service name instead of `127.0.0.1` in
`DATABASE_URL`; `localhost` inside a container refers to that container.
Configure the same `/api` and `/api/v1` routes through a reverse proxy when
deploying.

For efficient viewport queries, create spatial and tag indexes once in the
`v_navigator` database:

```sql
CREATE INDEX IF NOT EXISTS nav_nodes_geom_gix
  ON nav_nodes USING GIST (geom);

CREATE INDEX IF NOT EXISTS nav_nodes_traffic_signals_idx
  ON nav_nodes ((tags ->> 'highway'))
  WHERE tags ->> 'highway' = 'traffic_signals';
```

Then run `ANALYZE nav_nodes;`. Keep real database credentials in the ignored
`.env` file or environment variables, not in source code.
