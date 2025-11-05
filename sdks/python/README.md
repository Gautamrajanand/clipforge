# ClipForge Python SDK

Official Python SDK for the ClipForge API.

## Installation

```bash
pip install clipforge-sdk
```

## Quick Start

```python
from clipforge import ClipForgeClient

client = ClipForgeClient(
    api_url='https://api.clipforge.dev',
    api_key='your-api-key'
)

# Create a project
project = client.create_project('My Video')

# List clips
clips = client.list_clips(project.id)

# Create export
export = client.create_export(
    clips[0].id,
    format='MP4',
    aspect_ratio='9:16',
    template='default'
)

# Get export status
status = client.get_export(export.id)
```

## Authentication

### API Key
```python
client = ClipForgeClient(
    api_url='https://api.clipforge.dev',
    api_key='your-api-key'
)
```

### JWT Token
```python
client = ClipForgeClient(
    api_url='https://api.clipforge.dev',
    access_token='your-jwt-token'
)
```

## API Methods

### Projects

```python
# Create project
project = client.create_project('Title', 'https://example.com/video.mp4')

# List projects
projects = client.list_projects(skip=0, take=20)

# Get project
project = client.get_project('project-id')

# Delete project
client.delete_project('project-id')
```

### Highlight Detection

```python
# Start detection
client.detect_highlights('project-id', num_clips=6)

# List clips
clips = client.list_clips('project-id')
```

### Exports

```python
# Create export
export = client.create_export(
    clip_id='clip-id',
    format='MP4',
    aspect_ratio='9:16',
    template='default',
    brand_kit_id='kit-id'  # optional
)

# Get export status
export = client.get_export('export-id')
```

### Brand Kits

```python
# Create brand kit
kit = client.create_brand_kit(
    name='My Brand',
    fonts={'primary': 'Arial', 'secondary': 'Helvetica'},
    colors={'primary': '#000000', 'secondary': '#FFFFFF'},
    logo_url='https://example.com/logo.png'
)

# List brand kits
kits = client.list_brand_kits()

# Get brand kit
kit = client.get_brand_kit('kit-id')
```

### Usage & Metering

```python
# Get current usage
usage = client.get_usage()
print(f"Minutes: {usage.minutesProcessed}")
print(f"Exports: {usage.exportsCount}")
```

### Webhooks

```python
# Register webhook
webhook = client.register_webhook(
    url='https://example.com/webhook',
    events=['job.completed', 'export.ready']
)

# List webhooks
webhooks = client.list_webhooks()

# Verify webhook signature
is_valid = ClipForgeClient.verify_webhook_signature(
    secret='webhook-secret',
    payload=payload,
    signature=signature
)
```

## Webhook Handling

```python
from flask import Flask, request, jsonify
from clipforge import ClipForgeClient

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook_handler():
    signature = request.headers.get('X-Signature')
    payload = request.get_json()

    # Verify signature
    is_valid = ClipForgeClient.verify_webhook_signature(
        secret='your-webhook-secret',
        payload=payload,
        signature=signature
    )

    if not is_valid:
        return jsonify({'error': 'Invalid signature'}), 401

    # Handle event
    print(f"Event: {payload['event']}")
    print(f"Data: {payload['data']}")

    return jsonify({'ok': True})
```

## Error Handling

```python
try:
    project = client.create_project('My Video')
except Exception as error:
    if error.response.status_code == 429:
        print('Rate limit exceeded')
    elif error.response.status_code == 401:
        print('Unauthorized')
    else:
        print(f'Error: {error}')
```

## Examples

See `examples/` directory for complete examples:
- `python-partner-app.py` - Full workflow example

## API Reference

See [OpenAPI Spec](../../openapi.json) for complete API documentation.

## Support

- Documentation: https://docs.clipforge.dev
- Issues: https://github.com/clipforge/sdk-python/issues
- Email: support@clipforge.dev

## License

MIT
