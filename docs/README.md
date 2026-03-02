# Oxford App (Frontend)

Frontend React + Vite para uso local e build de produção servido pelo backend Node/Express.

## Desenvolvimento local

No diretório `docs/`:

```bash
yarn install
yarn dev
```

Por padrão, em desenvolvimento, a API é `http://localhost:4000/api`.

Opcionalmente, você pode definir `docs/.env.development`:

- `VITE_API_BASE_URL_DEV=http://localhost:4000/api`

## Produção (GitHub Pages)

No deploy único, o frontend e backend compartilham o mesmo host.

- Em produção, a API padrão é `'/api'` no mesmo domínio.
- Opcionalmente, ainda é possível sobrescrever com `VITE_API_BASE_URL_PRD`.

## Build

```bash
yarn build
```

O `postbuild` gera `dist/404.html` para fallback de rotas da SPA no GitHub Pages.

## Deploy

Para deploy único, use um serviço Node (ex.: Render) com o arquivo `render.yaml` na raiz do repositório.
