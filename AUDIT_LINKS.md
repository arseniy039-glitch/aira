# Аудит кликабельности Aira Home — 08.10.2026

Ветка `fix/airahome-4-directions`. Playwright (Chromium) обошёл 5 страниц × 4 языка (EN/DE/FR/PT; язык — через `setLang`).
По каждому `<a>`/`<button>`: href, HTTP-статус (внутренние и внешние), наличие якоря, формат `tel:` / `wa.me` / `mailto:`,
есть ли у кнопки обработчик (CDP `getEventListeners` / onclick / submit в форме), есть ли читаемый текст или `aria-label`.
Отдельно — «вид без JS» (сырой HTML, так читают краулеры и ИИ-агенты): ссылки и кнопки без текста и `aria-label`.

## Итог

| | Прод `aira-ai.net` (до) | Ветка (после) |
|---|---|---|
| Битые ссылки (4xx/5xx, нет якоря) | 0 | 0 |
| Кнопки без действия | 0 | 0 |
| Кнопки/ссылки без текста (с JS) | 1 (`.ah-send` в чате /airahome) | 0 |
| Кнопки/ссылки без текста (без JS) | почти все `data-i18n`-кнопки и ссылки на 5 страницах (текст подставлялся только JS) | 0 |
| Неверный `tel:` / `wa.me` / `mailto:` | 0 по формату | 0 по формату |
| Языки: нет переключателя | /garden: DE, FR | /garden: DE, FR (не исправлялось, см. ниже) |
| JS-ошибки в консоли | — | 0 (один 404 — `/favicon.ico` локального сервера; на проде 200) |

Порог стоп-крана (>20 битых) не достигнут — битых 0.

## Ссылки по страницам (ветка, после правок)

Текст — что видит пользователь/агент (до 4 языковых вариантов). `wa.me` — без `?text=`.

### /home/
| href | текст | проверка |
|---|---|---|
| `#hero` | Aira Home | якорь ok |
| `/home/` | Aira Home | 200 |
| `/airahome` | Airahome · карточка «Right now — Airahome…» · Airahome (футер) | 200 |
| `/energia` | Energia · карточка Aira Energia · Aira Energia | 200 |
| `/garden` | Garden · карточка Aira Garden · Aira Garden | 200 |
| `/construction` | Construction · карточка Aira Construction · Aira Construction | 200 |
| `#doors` | See the four services / Die vier Dienste ansehen / Voir les quatre services / Ver os quatro serviços | якорь ok |
| `tel:+351308800687` | +351 308 800 687 · Call us · Call now — … · 📞 Call | tel ok |
| `https://wa.me/351936800000` | WhatsApp us · 💬 WhatsApp | wa ok |
| `mailto:info@aira-ai.net` | Email us / E-Mail schreiben / … | mailto ok |
| `#contact` | 📝 Leave a request (виджет) | якорь ok |
| `https://aira-ai.net/` | aira-ai.net ↗ | 200 |

### /airahome
| href | текст | проверка |
|---|---|---|
| `#hero` | Airahome | якорь ok |
| `/home/`, `/airahome`, `/energia`, `/garden`, `/construction` | панель направлений + футер | 200 |
| `#request` | Request a callout / Einsatz anfragen / … · 📝 Leave a request | якорь ok |
| `tel:+351308800687` | 24/7 +351 308 800 687 · Call now — … · 📞 Call | tel ok |
| `https://wa.me/351936800000` | WhatsApp · 💬 WhatsApp | wa ok |
| `/home/privacy.html` | privacy policy / Datenschutzerklärung / … | 200 |
| `/` | Aira | 200 |

### /energia
| href | текст | проверка |
|---|---|---|
| `#hero` | Aira Energia | якорь ok |
| `/home/`, `/airahome`, `/energia`, `/garden`, `/construction` | панель направлений + футер | 200 |
| `#request` | Check my bill · Request a free review · Pedir análise gratuita · 📝 Leave a request | якорь ok |
| `#calc` | Calculate my savings / … | якорь ok |
| `https://wa.me/351936800000` | WhatsApp (4 языка, свой `?text=`) | wa ok |
| `tel:+351308800687` | 📞 Call / Anrufen / Appeler / Ligar (виджет) | tel ok |
| `/`, `/concierge`, `/assistant`, `/admin` | футер | 200 |

### /garden
| href | текст | проверка |
|---|---|---|
| `#hero` | Aira Garden | якорь ok |
| `/home/`, `/airahome`, `/energia`, `/garden`, `/construction` | панель направлений + футер | 200 |
| `#request` | Request a consultation (& quote) / Pedir consulta (e orçamento) · 📝 | якорь ok |
| `#how` | See how it works / Ver como funciona | якорь ok |
| `https://wa.me/351936800000` | Message on WhatsApp / Falar por WhatsApp · 💬 WhatsApp | wa ok |
| `mailto:info@aira-ai.net?subject=Aira%20Garden` | Write an email / Escrever um email | mailto ok |
| `tel:+351308800687` | 📞 Call / Ligar (виджет) | tel ok |
| `/home/privacy.html`, `/` | футер | 200 |

### /construction
| href | текст | проверка |
|---|---|---|
| `#hero` | Aira Construction | якорь ok |
| `/home/`, `/airahome`, `/energia`, `/garden`, `/construction` | панель направлений + футер | 200 |
| `#request` | Request a quote / Pedir orçamento / Angebot anfragen / Demander un devis · 📝 | якорь ok |
| `#how` | See how it works / Wie es funktioniert / … | якорь ok |
| `https://wa.me/351308800687` | Message on WhatsApp (4 языка) — **номер страницы, не бот Sofia** | wa ok (формат) |
| `https://wa.me/351936800000` | 💬 WhatsApp (виджет) | wa ok |
| `mailto:info@aira-ai.net?subject=Aira%20Construction` | Write an email / … | mailto ok |
| `tel:+351308800687` | 📞 Call … (виджет) | tel ok |
| `/home/privacy.html`, `/` | футер | 200 |

## Что починено
- Немые кнопки/ссылки: текст языка по умолчанию теперь пререндерен в HTML (EN для /home и /airahome, PT для остальных), JS по-прежнему переключает 4 языка. Кнопки hero на /home: «See the four services», «Call us».
- `.ah-send` (кнопка отправки в чате) — заменена виджетом с видимым текстом «Send/Senden/Envoyer/Enviar» и `aria-label`.
- sitemap.xml: убраны несуществующие `/home/home.html`, `/home/garden.html`; добавлен `/construction`.

## Не битое по формату, но требует решения (не трогал — номера не менять)
- /construction: WhatsApp `wa.me/351308800687` (в коде `TODO: confirmar número WhatsApp da Construction`), на остальных страницах — `351936800000` (Sofia).
- Форма /construction шлёт в `https://n8n.aira-ai.net/webhook/aira-construction-leads` — **вебхук не зарегистрирован в n8n (404)**: заявки с этой формы теряются.
- /garden — только PT/EN, переключателей DE/FR нет вообще.
