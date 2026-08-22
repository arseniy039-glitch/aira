# aira-live — контекст проекта

## Что это
Статический сайт aira-ai.net (Cloudflare Pages). Чистый HTML/CSS/JS, без сборки, без npm build.
Автодеплой: push в main → arseniy039-glitch/aira → Cloudflare Pages (aira-370.pages.dev → aira-ai.net).

## ⚠️ Не путать с другим репо
`~/aira-site` — ДРУГОЙ репозиторий (katerina.git, PWA). Деплой сайта делается только из `~/aira-live`.

## Структура
- `index.html` — главная
- `concierge.html` — лендинг Aira Concierge (отели)
- `admin.html` — лендинг Aira Admin (бьюти/велнес)
- `assistant.html` — Aira Assistant (executive AI chief of staff)
- `aira-agency.html`, `terracotta.html` — отдельные лендинги/демо
- `aira-react.jsx` — React-компонент (не часть сборки, справочный/черновой файл)
- `v2/` — рабочая версия в разработке
- `_old_v1_backup/` — архив, не трогать без явной причины
- `img/`, `robots.txt`, `sitemap.xml` — стандартные статические файлы

## Формы на сайте
На главной (`index.html`) формы нет. Формы есть на `/concierge`, `/admin`, `/assistant` и отправляют данные на:
`https://n8n.aira-ai.net/webhook/aira-site-leads`
(старый Railway-URL мёртв, остался только в `_old_v1_backup/`, не использовать)

Payload у каждой страницы свой (общее: `name`, `email`, `message`, `page`, `source`):
- `/concierge` — `{name, hotel, email, message, page, source}`
- `/admin` — `{name, studio, email, message, page, source}`
- `/assistant` — `{name, company, email, message, page, source}`

Полей `business`/`phone`/`city` нет ни в одном payload.
Уведомления идут в Telegram (chat_id 1700389702). Это НЕ косметика — проверять перед изменением форм.

## Деплой
```
cd ~/aira-live
git add -A && git commit -m "..." && git push
```
Авторизация — через `gh` CLI, без ручного токена. Автодеплой на Cloudflare Pages займёт ~1-2 минуты.

## Бизнес-контекст (кратко)
Aira — B2B AI-консьерж для отелей/SMB, три продукта: Concierge (отели), Admin (бьюти), Assistant (executive AI chief of staff).
Цель: €600+ MRR / 3+ платящих клиента к 30.09.2026.
Правило «Нет»: новые проекты/подписки — только после первого платящего клиента.

## Работа с Арсением (владелец)
- Прямые честные оценки, без дипломатии, с процентами вероятности.
- Готовый copy-paste результат, а не инструкции.
- Автономное исполнение на ясных задачах. Первые холодные письма клиентам — только с подтверждением.
