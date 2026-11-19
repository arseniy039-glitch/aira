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
| Post-call демо (с 19.11) | VPS `/root/demo-postcall/postcall.py`, cron `1-59/2` через `flock -n /tmp/demo-postcall.lock timeout 120` → n8n `tg-demo-record` (`7XQgQtir6vQ6dAui`). n8n `TgDemoPostcall01` выключен: зависал в n8n 2.37.11, не включать |
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

## Скрытый режим: Тоби — ИИ-репетитор английского (19.11.2026)

Демо для партнёров. Публичный режим бота не меняется: ссылку знают только те, кому её дали.

- **Ссылка:** https://t.me/aira_voice_demo_bot?start=tutor → бот отвечает по-русски с кнопкой «🎓 Начать урок» (web_app → `https://aira-ai.net/tg/tutor`, файл `tg/tutor.html`).
  `?startapp=tutor` не работает, пока у бота не задан Main Mini App в BotFather (`has_main_web_app=false`).
- **Агент:** «Aira Demo — English Tutor» `agent_1901m7szkkk2f4dsr61tbe14b875` — claude-haiku-5-5, eleven_v4_turbo, голос Jessica `cgSgspJ2msm6clMCkdW9`, language ru, enable_auth, `max_duration_seconds=300`. Объясняет по-русски, практика по-английски; уровень A1–B2, кафе / аэропорт / собеседование / свободный разговор.
- **n8n:** `TgTutorSession01` (`POST /webhook/tg-tutor-session`, initData HMAC → лимиты → токен EL), `jOVr3vohDTDyYmIt` tg-tutor-record (`POST /webhook/tg-tutor-record`, заголовок `x-aira-secret` = `N8N_WEBHOOK_SECRET` → строка в `tg_tutor_calls`). В `tg-demo-bot` добавлена только ветка `/start tutor`.
- **Голосовые итоги — вне n8n:** VPS `/root/tutor-postcall/postcall.py`, cron `*/2` (лог `postcall.log`, обработанные id — `state.json`): завершённые уроки → Claude Haiku (tool_use, thinking off) → TTS тем же голосом → `sendVoice` в чат + сводка Арсению → tg-tutor-record. `--dry` — без отправки. n8n-версия `TgTutorPostcal01` выключена: Code-нода в schedule-режиме вешала n8n (19.11). Cron: `*/2 … flock -n /tmp/tutor-postcall.lock timeout 120`, ≤2 урока за прогон.
- **Data tables:** `tg_tutor_tokens` `pPpLhb3fbcxsjFFO`, `tg_tutor_calls` `C7gZj36UV4nP0aEi`.
- **Лимиты** (константы в «Код: лимиты и токен»): сессия 300 с (агент), 15 мин/сутки на user_id (Europe/Lisbon; выданный токен резервирует свои секунды на 8 мин, пока поллер не запишет разговор), остаток < 60 с → `daily_limit`; не больше 2 уроков одновременно → `busy`; 300 tutor-минут в месяц → `month_limit`. Флаг `/demo_off` выключает и tutor. Арсений без дневного лимита.
- **Ответы:** `{ok:true, conversationToken, dynamicVariables, maxSeconds, secondsLeftToday}` или `{ok:false, reason: daily_limit|busy|month_limit|demo_off|upstream_error}`, подпись — 403.
- **Ключ EL:** для голосовых итогов нужно право `text_to_speech` (включено 19.11). Без него поллер шлёт итоги текстом.
