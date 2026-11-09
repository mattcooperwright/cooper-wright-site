# Mesh Gradient MCP

An MCP server that lets Claude render mesh gradients with the same engine as
[Mesh Gradient Studio](../mesh-gradient-studio/). It runs on your machine over stdio.

The engine is `apps/mesh-gradient-studio/app/mesh.ts`, imported directly, so the server and the
studio draw the same picture. For the same colours, seed, ratio, grain and blur, a 1K export from
the studio and this server's PNG matched pixel for pixel when checked.

## Tools

**`generate_mesh_gradient`** renders a gradient. It returns a small JPEG preview inline and saves the
full-size PNG, reporting the path.

| Argument | Meaning |
| --- | --- |
| `colours` | 4 to 8 hex colours, such as `#FF5C35`. The first is the base. Or use `palette`. |
| `palette` | A preset from `list_palettes`. Default `studio`. |
| `ratio` | `1:1`, `4:5` or `16:9`. Default `1:1`. |
| `size` | Long edge in pixels, 256 to 4096. Default 2048. |
| `grain` | 0 to 100. Default 18. |
| `blur` | 0 to 100. Default 28. |
| `seed` | Layout of the colour fields. Random if left out, and the result reports the one used, so a good result can be reproduced. |
| `filename` | Name for the saved PNG. Folders in it are dropped. |

**`list_palettes`** lists the presets, which are the studio's own colour sets.

Files are written only to `MESH_GRADIENT_OUT_DIR` (default `~/mesh-gradients`), never over an existing
file, and never to a path the caller chooses.

## Setup

Needs Node 22.18 or later (it runs the TypeScript directly, with no build step).

```sh
cd apps/mesh-gradient-mcp
npm ci
```

Claude Code:

```sh
claude mcp add mesh-gradient -- node /absolute/path/to/apps/mesh-gradient-mcp/src/server.ts
```

Claude Desktop, in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "mesh-gradient": {
      "command": "node",
      "args": ["/absolute/path/to/apps/mesh-gradient-mcp/src/server.ts"],
      "env": { "MESH_GRADIENT_OUT_DIR": "/absolute/path/for/images" }
    }
  }
}
```

## Development

```sh
npm run check   # tsc
npm test        # node:test, including a real stdio client against the server
```

These tests are not part of the site's CI, which only installs the root package.
