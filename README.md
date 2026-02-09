# OpenAPI Admin Console

A React-based admin UI that renders collection lists and forms from an OpenAPI spec and a small JSON/YAML config. It supports OAuth2/OIDC login (Authorization Code + PKCE) via OIDC discovery.

## The Collection Metaphor (required)

APIs must follow the Collection Metaphor. Each resource should expose only two base URLs:

- Collection URL (example: `/users`) for listing and creating resources in the collection.
- Element URL (example: `/users/1234`) for reading, updating, and deleting individual resources in the collection.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create `public/config.[json|yaml|yml]` and provide an OpenAPI spec at the configured `oas_source` (for example `public/openapi.json`). See Configuration below.

3. Start the dev server:

```bash
npm run dev
```

4. Open `http://localhost:5173`.

## Configuration

The app loads configuration from `/public/config.json` by default (or `/public/config.yaml`/`/public/config.yml` if present). See `examples/config.json` and `examples/config.yaml` for more.

### Example config

```json
{
  "title": "OpenAPI Admin Console",
  "sub_title": "Admin Dashboard",
  "oas_source": "/openapi.json",
  "api_base_url": "http://localhost:8086",
  "security_config": {
    "type": "oauth2",
    "client_id": "YOUR_CLIENT_ID",
    "as_base_url": "https://auth.example.com",
    "scopes": ["openid", "profile", "offline_access", "admin:read", "admin:write"]
  },
  "navigation": [
    {
      "label": "Prompts",
      "collection": {
        "path": "/prompts",
        "display_fields": ["name", "description"]
      },
      "item": {
        "label": "Prompt",
        "path": "/prompts/{id}"
      }
    }
  ]
}
```

### Security config (OAuth2/OIDC)

- `type`: must be `"oauth2"`
- `client_id`: your OAuth/OIDC client ID
- `as_base_url`: your Authorization Server base URL (discovery at `/.well-known/openid-configuration`)
- `scopes`: include at least `openid`; add `offline_access` if you want refresh tokens
- `audience`: optional, for providers that require it

The app uses `oidc-client-ts` for Authorization Code + PKCE and refresh tokens. Tokens are mirrored into cookies for API calls.

### Development-only auth bypass

To test navigation before sign-in is configured, set this in `.env.development`:

```bash
VITE_DEV_AUTH_BYPASS=true
```

When enabled in development, OAuth sign-in is skipped and a header badge shows `Auth bypass active`.
API requests are blocked unless `security_config.dev_bypass.access_token` is present.

Add an optional token in `public/config.json` (or yaml):

```json
{
  "security_config": {
    "type": "oauth2",
    "dev_bypass": {
      "access_token": "PASTE_DEV_TOKEN_HERE",
      "token_type": "Bearer"
    }
  }
}
```

If the token already includes a scheme prefix (for example `Bearer ...`), it is used as-is.
The app throws an error if this flag is enabled outside development.

## Authorization server setup

Configure your OAuth2/OIDC provider with the following:

- Redirect URIs:
  - `http://localhost:5173/oauth/callback`
  - `http://localhost:5173/oauth/silent`
- Application type: public client (no client secret in the browser)
- Allowed scopes: include `openid` and any API scopes you need; add `offline_access` to enable refresh tokens

## How API requests are authorized

The app automatically attaches an `Authorization: Bearer <access_token>` header to API calls when OAuth is enabled. If no valid token is available, the user is redirected to sign in.

## Routes

- `/` loads the first navigation item
- `/:collectionPath` shows a collection list
- `/:collectionPath/new` shows the create form
- `/:collectionPath/:id` shows the detail view
- `/:collectionPath/:id/edit` shows the edit form
- `/oauth/callback` handles the OAuth redirect
- `/oauth/silent` handles silent renew

## Troubleshooting

- If login redirects succeed but API calls still 401, verify the `as_base_url` and required scopes.
- If refresh tokens do not work, confirm `offline_access` is allowed for your client.
- Ensure your OIDC provider serves a valid discovery document at `/.well-known/openid-configuration`.

## License

TBD
