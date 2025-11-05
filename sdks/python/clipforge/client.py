"""
ClipForge Python SDK Client
"""

import requests
import hmac
import hashlib
import json
from typing import Optional, List, Dict, Any
from .models import Project, Clip, Export, BrandKit, Usage, Webhook


class ClipForgeClient:
    """ClipForge API client"""

    def __init__(
        self,
        api_url: str,
        api_key: Optional[str] = None,
        access_token: Optional[str] = None,
    ):
        """
        Initialize ClipForge client
        
        Args:
            api_url: Base API URL
            api_key: API key for authentication
            access_token: JWT access token
        """
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.access_token = access_token
        self.session = requests.Session()
        self._setup_headers()

    def _setup_headers(self) -> None:
        """Setup request headers"""
        self.session.headers.update({
            'Content-Type': 'application/json',
        })

        if self.api_key:
            self.session.headers.update({
                'X-Api-Key': self.api_key,
            })
        elif self.access_token:
            self.session.headers.update({
                'Authorization': f'Bearer {self.access_token}',
            })

    def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs
    ) -> Dict[str, Any]:
        """Make API request"""
        url = f"{self.api_url}{endpoint}"
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json()

    # Projects
    def create_project(
        self,
        title: str,
        source_url: Optional[str] = None,
    ) -> Project:
        """Create a project"""
        data = {
            'title': title,
            'sourceUrl': source_url,
        }
        response = self._request('POST', '/v1/projects', json=data)
        return Project(**response)

    def list_projects(self, skip: int = 0, take: int = 20) -> List[Project]:
        """List projects"""
        response = self._request(
            'GET',
            '/v1/projects',
            params={'skip': skip, 'take': take}
        )
        return [Project(**p) for p in response]

    def get_project(self, project_id: str) -> Project:
        """Get project details"""
        response = self._request('GET', f'/v1/projects/{project_id}')
        return Project(**response)

    def delete_project(self, project_id: str) -> None:
        """Delete project"""
        self._request('DELETE', f'/v1/projects/{project_id}')

    # Highlight Detection
    def detect_highlights(self, project_id: str, num_clips: int = 6) -> None:
        """Start highlight detection"""
        data = {'numClips': num_clips}
        self._request('POST', f'/v1/projects/{project_id}/detect', json=data)

    def list_clips(self, project_id: str) -> List[Clip]:
        """List clips for project"""
        response = self._request('GET', f'/v1/projects/{project_id}/clips')
        return [Clip(**c) for c in response]

    # Exports
    def create_export(
        self,
        clip_id: str,
        format: str = 'MP4',
        aspect_ratio: str = '9:16',
        template: Optional[str] = None,
        brand_kit_id: Optional[str] = None,
    ) -> Export:
        """Create export"""
        data = {
            'format': format,
            'aspectRatio': aspect_ratio,
            'template': template,
            'brandKitId': brand_kit_id,
        }
        response = self._request('POST', f'/v1/clips/{clip_id}/export', json=data)
        return Export(**response)

    def get_export(self, export_id: str) -> Export:
        """Get export status"""
        response = self._request('GET', f'/v1/exports/{export_id}')
        return Export(**response)

    # Brand Kits
    def create_brand_kit(
        self,
        name: str,
        fonts: Dict[str, str],
        colors: Dict[str, str],
        logo_url: Optional[str] = None,
    ) -> BrandKit:
        """Create brand kit"""
        data = {
            'name': name,
            'fonts': fonts,
            'colors': colors,
            'logoUrl': logo_url,
        }
        response = self._request('POST', '/v1/brand-kits', json=data)
        return BrandKit(**response)

    def list_brand_kits(self) -> List[BrandKit]:
        """List brand kits"""
        response = self._request('GET', '/v1/brand-kits')
        return [BrandKit(**k) for k in response]

    def get_brand_kit(self, kit_id: str) -> BrandKit:
        """Get brand kit"""
        response = self._request('GET', f'/v1/brand-kits/{kit_id}')
        return BrandKit(**response)

    # Usage
    def get_usage(self) -> Usage:
        """Get usage metering"""
        response = self._request('GET', '/v1/usage')
        return Usage(**response)

    # Webhooks
    def register_webhook(
        self,
        url: str,
        events: List[str],
    ) -> Webhook:
        """Register webhook"""
        data = {
            'url': url,
            'events': events,
        }
        response = self._request('POST', '/v1/webhooks/endpoints', json=data)
        return Webhook(**response)

    def list_webhooks(self) -> List[Webhook]:
        """List webhooks"""
        response = self._request('GET', '/v1/webhooks/endpoints')
        return [Webhook(**w) for w in response]

    @staticmethod
    def verify_webhook_signature(
        secret: str,
        payload: Dict[str, Any],
        signature: str,
    ) -> bool:
        """
        Verify webhook signature
        
        Args:
            secret: Webhook secret
            payload: Webhook payload
            signature: Signature to verify
            
        Returns:
            True if signature is valid
        """
        json_str = json.dumps(payload, separators=(',', ':'), sort_keys=True)
        expected = hmac.new(
            secret.encode(),
            json_str.encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(expected, signature)
