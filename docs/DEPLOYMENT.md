# Deployment

## GitHub Pages

The primary free static deployment path is GitHub Pages from the `main` branch.
The workflow is `.github/workflows/deploy-pages.yml`.

Before first use, enable Pages in the GitHub repository settings and select
GitHub Actions as the Pages source.

The Pages build uses `VITE_DEPLOY_TARGET=github-pages`, which changes the Vite
base path to `/Chicken-Pixel-Village/`. The React router reads the same base path
from `import.meta.env.BASE_URL`, so the same source can still build for `/` on
Netlify or local preview.

The workflow copies `index.html` to `404.html` after build. This gives GitHub
Pages a static fallback for direct refreshes on app routes.

The manifest and icon links are emitted with the same Vite base path, while the
manifest itself uses `./` URLs. This keeps Safari/iOS Add to Home Screen on
`/Chicken-Pixel-Village/` instead of falling back to the user root domain.
The workflow runs `pnpm pwa:qa` after the Pages build to verify both paths.

If Firebase Auth is enabled in the web app, add this authorized domain in the
Firebase console:

```text
aitest00898.github.io
```

## Netlify Rollback Path

Netlify remains supported. The repository keeps `netlify.toml` and the public
`_redirects` file, so switching back only requires reconnecting or re-enabling
the Netlify site and using its existing build command:

```bash
pnpm --filter @chicken-village/mobile build
```

Netlify builds keep the default Vite base path `/`.
