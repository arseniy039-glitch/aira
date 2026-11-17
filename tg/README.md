# Telegram-демо Aira: «Поговорить с ИИ»

Mini App голосового демо: пользователь открывает **@aira_voice_demo_bot**, нажимает «🎙 Поговорить с ИИ» и до 3 минут говорит с агентом **Aira Demo** (ElevenLabs, WebRTC). После разговора Арсений получает отчёт, лид попадает в Notion, а пользователю приходит кнопка «Да, свяжитесь со мной».

Запущено 17.11.2026.

## Схема

```
Telegram (бот @aira_voice_demo_bot)
  /start ─────────────► n8n tg-demo-bot ──► приветствие + кнопка web_app
  кнопка меню / web_app ─► aira-ai.net/tg/ (этот index.html)
                              │ POST {initData}
                              ▼
                         n8n tg-demo-session
                           · HMAC initData (WebAppData), auth_date ≤ 1 ч
                           · флаг demo_enabled, ≤2 сессии/сутки на user_id, ≤300 мин/мес
                           · GET /v1/convai/conversation/token (ключ ElevenLabs только в n8n)
                              │ {conversationToken, dynamicVariables}
                              ▼
                   @elevenlabs/client 1.33.0 → WebRTC → агент Aira Demo
                              │ (разговор завершён)
                              ▼
                   n8n tg-demo-postcall (каждые 2 мин опрашивает /v1/convai/conversations)
                     · Claude Haiku → отчёт (кто, ниша, hot/warm/cold)
                     · Notion «Aira Demo Leads»
                     · Telegram Арсению (@katerina_arseniy_bot)
                     · пользователю: «Спасибо! Хотите такого агента…» + кнопка
                              │ callback «Да, свяжитесь со мной»
                              ▼
                   n8n tg-demo-bot → Notion Status «Запросил контакт» + «🔥 запросил контакт» Арсению
```

Post-call **поллингом**, а не вебхуком: у API-ключей ElevenLabs нет права `webhooks_write`. Чтобы получать отчёт сразу после разговора, создайте в кабинете ElevenLabs (Settings → Webhooks) HMAC-вебхук и подключите его к агенту. Поллер при этом можно оставить, он отсеивает уже обработанные разговоры по `conversation_id`.

## ID и где что лежит

| Что | ID / место |
|---|---|
| Агент ElevenLabs | Aira Demo `agent_1101kt9d092cens96j5nkd0zmm84` (enable_auth=true, 180 с) |
| Бэкап агента до изменений | VPS `/root/backups/elevenlabs/aira_demo_20261117-1622.json` |
| n8n tg-demo-session | `TgDemoSession001`: `POST /webhook/tg-demo-session` |
| n8n tg-demo-postcall | `TgDemoPostcall01`: расписание каждые 2 мин |
| n8n tg-demo-bot | `TgDemoBotWebhk01`: `POST /webhook/tg-demo-bot` (вебхук бота, проверка `X-Telegram-Bot-Api-Secret-Token`) |
| Data table: выданные сессии | `tg_demo_tokens` `R1kJKXeAqazUcP2E` |
| Data table: разговоры и минуты | `tg_demo_calls` `1XS4ZkNpXf1FUXxs` |
| Data table: флаг вкл/выкл | `tg_demo_flags` `WZIbqvpJWkWIoOlE` (последняя строка `demo_enabled` = on/off) |
| Notion | «Aira Demo Leads», db `41bb8fb3-0bb3-819d-b3f9-e9f35b7680c8`, data source `41bb8fb3-0bb3-81bc-a1db-000b01d23fe9` |
| Секреты n8n | VPS `/root/.secrets/n8n-keys.env`: `AIRA_DEMO_BOT_TOKEN`, `REPORT_TG_BOT_TOKEN`, `TG_DEMO_BOT_WEBHOOK_SECRET` (смена = правка файла + `docker compose up -d --force-recreate` в `/root/n8n-compose`) |

## Лимиты

Лимиты заданы константами в коде ноды «Код: лимиты и токен» воркфлоу `tg-demo-session`:

- `PER_USER_DAY = 2`: сессий на один Telegram user_id в сутки (по Europe/Lisbon). Считаются выданные токены в `tg_demo_tokens`.
- `MONTH_MINUTES = 300`: общий лимит в месяц по фактическим длительностям в `tg_demo_calls`. Учёт идёт с задержкой до 2 минут, так что возможен перерасход на последний разговор.
- `OWNER_ID = 1700389702`: на Арсения суточный лимит не действует. Месячный лимит и флаг действуют.
- Длительность разговора ограничена на стороне агента: `max_duration_seconds = 180`. За 20 секунд до конца Mini App шлёт агенту contextual update «время заканчивается».

## Как выключить

- **Быстро:** написать боту `/demo_off`, включить обратно — `/demo_on`. Работает только из чата 1700389702. Статистика за сутки и месяц: `/demo_stats`.
- **Полностью:** деактивировать `tg-demo-session` в n8n. Новые сессии перестанут выдаваться, а Mini App покажет ошибку подключения.
- **Бот целиком:** `deleteWebhook` для @aira_voice_demo_bot — бот перестанет отвечать. Агент Aira Demo без токена с бэкенда недоступен (`enable_auth=true`).

## Ответы tg-demo-session

`{ok:true, conversationToken, dynamicVariables:{tg_user_id,tg_username,tg_first_name}, sessionsLeftToday, maxSeconds}`
или `{ok:false, reason}`, где `reason` ∈ `daily_limit | month_limit | demo_off | upstream_error`. Ошибки подписи возвращаются с HTTP 403 и `reason` ∈ `bad_signature | stale_auth_date | no_init_data | …`.
Запрос `{initData, action:"contact"}` присылает Арсению заявку из Mini App (кнопка «Оставить заявку», когда лимит исчерпан).

## Ручной тест (iPhone)

1. Открыть @aira_voice_demo_bot → `/start`: приходит приветствие и кнопка «🎙 Поговорить с ИИ».
2. Нажать кнопку → Mini App → большая кнопка-микрофон → разрешить микрофон.
3. Статусы меняются: «Подключаюсь…» → «Слушаю» / «Говорит», таймер идёт с 3:00. Айра здоровается первой.
4. Попросить: «Сыграй ресепшен моего отеля». Потом перейти на португальский или немецкий: голос должен смениться.
5. «Закончить» (или дождаться 0:00, на 0:20 Айра предупредит).
6. Через 1–3 минуты Арсению в @katerina_arseniy_bot приходит отчёт, в Notion «Aira Demo Leads» появляется карточка, а в чате бота — «Спасибо! Хотите такого агента…» с кнопкой.
7. Нажать «Да, свяжитесь со мной»: Арсению приходит «🔥 Запросил контакт», в Notion статус «Запросил контакт».
8. `/demo_stats`: сессии и минуты посчитаны.
