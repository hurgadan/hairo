# Hairo

AI-сервис примерки причёсок: пользователь загружает селфи → визард предпочтений → подбор из каталога причёсок → генерация фото с выбранной причёской. Web-first, с обёрткой в Telegram Mini App.

## Структура

```
api/        — backend (NestJS + TypeORM + PostgreSQL)
web/        — frontend (Nuxt) — в работе
data/       — стартовый каталог причёсок (seed)
*.md        — проектные документы (см. CLAUDE.md как точку входа)
```

## Документы

- [CLAUDE.md](CLAUDE.md) — навигатор по проекту
- [PROJECT.md](PROJECT.md) — бизнес и стратегия
- [PRODUCT.md](PRODUCT.md) — продукт, флоу, визард
- [CATALOG.md](CATALOG.md) — таксономия каталога
- [DESIGN.md](DESIGN.md) — дизайн-система
- [ARCHITECTURE.md](ARCHITECTURE.md) — инженерные правила бэкенда
- [ROADMAP.md](ROADMAP.md) — план разработки

## Backend (api)

```bash
cd api
npm i
cp .env.dist .env       # настроить при необходимости
npm run db:up           # dev Postgres (Docker)
npm run migration:run   # миграции
npm run seed            # засидить каталог (30 образов)
npm run start:dev       # http://localhost:3001  (Swagger: /docs)
```

Тесты:
```bash
npm run docker:test     # e2e в изолированном Postgres (tmpfs)
```
