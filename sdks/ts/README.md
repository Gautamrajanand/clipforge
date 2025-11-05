# ClipForge TypeScript SDK

Official TypeScript SDK for the ClipForge API.

## Installation

```bash
npm install @clipforge/sdk
```

## Quick Start

```typescript
import ClipForgeClient from '@clipforge/sdk';

const client = new ClipForgeClient({
  apiUrl: 'https://api.clipforge.dev',
  apiKey: 'your-api-key',
});

// Create a project
const project = await client.createProject('My Video');

// List clips
const clips = await client.listClips(project.id);

// Create export
const exportJob = await client.createExport(
  clips[0].id,
  'MP4',
  '9:16',
  'default'
);

// Get export status
const status = await client.getExport(exportJob.id);
```

## Authentication

### API Key
```typescript
const client = new ClipForgeClient({
  apiUrl: 'https://api.clipforge.dev',
  apiKey: 'your-api-key',
});
```

### JWT Token
```typescript
const client = new ClipForgeClient({
  apiUrl: 'https://api.clipforge.dev',
  accessToken: 'your-jwt-token',
});
```

## API Methods

### Projects

```typescript
// Create project
const project = await client.createProject('Title', 'https://example.com/video.mp4');

// List projects
const projects = await client.listProjects(0, 20);

// Get project
const project = await client.getProject('project-id');

// Delete project
await client.deleteProject('project-id');
```

### Highlight Detection

```typescript
// Start detection
await client.detectHighlights('project-id', 6);

// List clips
const clips = await client.listClips('project-id');
```

### Exports

```typescript
// Create export
const exportJob = await client.createExport(
  'clip-id',
  'MP4',        // format
  '9:16',       // aspectRatio
  'default',    // template
  'kit-id'      // brandKitId (optional)
);

// Get export status
const status = await client.getExport('export-id');
```

### Brand Kits

```typescript
// Create brand kit
const kit = await client.createBrandKit(
  'My Brand',
  { primary: 'Arial', secondary: 'Helvetica' },
  { primary: '#000000', secondary: '#FFFFFF' },
  'https://example.com/logo.png'
);

// List brand kits
const kits = await client.listBrandKits();

// Get brand kit
const kit = await client.getBrandKit('kit-id');
```

### Usage & Metering

```typescript
// Get current usage
const usage = await client.getUsage();
console.log(`Minutes: ${usage.minutesProcessed}`);
console.log(`Exports: ${usage.exportsCount}`);
```

### Webhooks

```typescript
// Register webhook
const webhook = await client.registerWebhook(
  'https://example.com/webhook',
  ['job.completed', 'export.ready']
);

// List webhooks
const webhooks = await client.listWebhooks();

// Verify webhook signature
const isValid = ClipForgeClient.verifyWebhookSignature(
  'webhook-secret',
  payload,
  signature
);
```

## Webhook Handling

```typescript
import express from 'express';
import ClipForgeClient from '@clipforge/sdk';

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-signature'];
  const payload = req.body;

  // Verify signature
  const isValid = ClipForgeClient.verifyWebhookSignature(
    'your-webhook-secret',
    payload,
    signature
  );

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Handle event
  console.log(`Event: ${payload.event}`);
  console.log(`Data: ${JSON.stringify(payload.data)}`);

  res.json({ ok: true });
});
```

## Error Handling

```typescript
try {
  const project = await client.createProject('My Video');
} catch (error) {
  if (error.response?.status === 429) {
    console.error('Rate limit exceeded');
  } else if (error.response?.status === 401) {
    console.error('Unauthorized');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Examples

See `examples/` directory for complete examples:
- `node-partner-app.js` - Full workflow example

## API Reference

See [OpenAPI Spec](../../openapi.json) for complete API documentation.

## Support

- Documentation: https://docs.clipforge.dev
- Issues: https://github.com/clipforge/sdk-ts/issues
- Email: support@clipforge.dev

## License

MIT
