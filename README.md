# ILWEBAngular

Angular **feature modules** for the IL Insurance Portal: Travel and Liability quotes. It is not a portal: no login, header, dashboard or logout. The Flutter shell (repository **ILWEBFlutter**) embeds it in an iframe and hands over the session (one-time token via `postMessage`, never in a URL). Backend: **ILAPI**.

```
src/app/
  travel/      pages, models (routes /travel, /travel/result)
  liability/   pages, models (routes /liability, /liability/result)
  shared/      quote form + result, forbidden page, field models
  core/        config (API URL, allowed portal origins), session/handoff service, interceptor, guards
```
Guards: auth, role (AGENT/UNDERWRITER/MANAGER/ADMIN) and permission (`travel.quote`, `liability.quote`); the API enforces them again.

## Run
```
npm install
npm start          # http://localhost:4200
```
Opened directly it only shows "open it from the portal"; use the portal at http://localhost:8080.
Allowed portal origins and the API URL are in `src/app/core/config.ts`.

Tests: `ng test`. Build: `ng build`.
