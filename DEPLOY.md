# ProStage Deployment

## Docker Build & Run

```bash
docker build -t prostage .
docker run -d \
  -p 3000:3000 \
  -v prostage-data:/data \
  --name prostage \
  prostage
```

## Volume Mount

Product data and images are stored outside the container in `/data/`:

- `/data/products.json` — Product database
- `/data/images/` — Uploaded product images

On first startup, if `/data/products.json` doesn't exist, the app seeds it from the built-in `src/data/products.json`.

### Named volume (recommended)

```bash
docker volume create prostage-data
docker run -d -p 3000:3000 -v prostage-data:/data prostage
```

### Bind mount (for direct file access)

```bash
mkdir -p ./data/images
docker run -d -p 3000:3000 -v $(pwd)/data:/data prostage
```

## Dokploy

When deploying via Dokploy, add a persistent volume mount:

- **Source**: Named volume or host path (e.g., `/opt/prostage/data`)
- **Target**: `/data`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATA_PATH` | `/data` | Directory for products.json and images |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `production` | Node environment |

## Backup

To backup product data:

```bash
docker cp prostage:/data ./backup
```
