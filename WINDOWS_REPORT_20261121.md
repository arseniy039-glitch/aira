# WINDOWS_REPORT_20261121 — Aira Windows (feat/aira-windows)

## Часть 1 — выполнено (коммит 4596dba)

### 0. Состояние ветки
- Ветка `feat/aira-windows` уже существовала; `backup-windows-20261121` тоже есть.
- `tg/index.html` и `home/index.html` — незакоммиченные изменения прошлых задач, **не тронуты**.
- windows.html и assets/windows/ были созданы прошлым заходом (незакоммиченные) — подхватил и закоммитил.

### 1. Картинки (assets/windows/)
Всего 70 файлов (jpg + webp). Новые 6 изображений обработаны:

| Исходник | Выход | Примечание |
|---|---|---|
| shutters-house.jpg (1170×878) | 400 + 800 jpg/webp | ✓ |
| shutters-alu-closeup.jpg (640×427) | 400 jpg/webp | только 400 (оригинал < 800) |
| shutters-industrial.jpg (1200×848) | 400 + 800 jpg/webp | ✓ |
| mosquito-roll-closeup.jpg (653×435) | 400 jpg/webp | только 400 |
| mosquito-sliding.jpg (498×400) | 400 jpg/webp | только 400 |
| mosquito-production.jpg (400×285) | 400 jpg/webp | только 400 |

**Логотипы/водяные знаки:** визуальную проверку выполнить вручную — `shutters-industrial.jpg` и `mosquito-production.jpg` могут содержать водяной знак поставщика (судя по малому размеру исходника). Если есть — обрезать или заменить.

**Не использованы в HTML:** `shutters-alu-closeup`, `shutters-industrial`, `mosquito-sliding`, `mosquito-production` — в ассетах есть, но в windows.html не подставлены (показал только репрезентативные: `shutters-house` в тайл+галерея, `mosquito-roll-closeup` в тайл+галерея). Можно добавить в Часть 2 если нужна более насыщенная галерея.

### 2. windows.html (~1010 строк) — готов
**Соответствие ТЗ:**
- ✅ Стиль construction.html (те же CSS-переменные, шрифты, паттерны)
- ✅ 4 языка PT/EN/DE/FR с переключателем
- ✅ 6 продуктов: окна, слайдинг/панорамик, двери входные, двери interior, москитные сетки, рольставни
- ✅ Материалы: алюминий, PVC, массив дерева («профили мировых лидеров отрасли», без брендов)
- ✅ Под ключ: замер→смета→изготовление→монтаж→уборка
- ✅ Вся Португалия + поставки Германия/Испания
- ✅ Без цен, без гарантий, без производителей
- ✅ Форма → `https://n8n.aira-ai.net/webhook/aira-airahome-leads`, page/direction='windows'
- ✅ `window.airaPixelLead()` только при `r.ok`
- ✅ consent-pixel.js и aira-home-chat.js подключены
- ✅ SEO: hreflang x4, canonical, JSON-LD Service + LocalBusiness
- ✅ Рольставни и москитные сетки — фото вместо иконок (тайл + галерея)

### Коммит
```
4596dba feat: Aira Windows page — windows.html + 70 image assets (Часть 1)
```

---

## Осталось на Часть 2
- `/home/` хаб: добавить карточку Windows
- Навигация и футеры: ссылка на /windows
- Artech: (уточнить у Арсения — scope этой части)
- sitemap.xml: добавить /windows
- llms.txt: обновить

## Осталось на Часть 3
- Playwright: проверка формы, языков, мобильного вида

---

## Часть 2 — 21.11.2026

### Шаг 1: home/index.html — хаб, сетка 5 карточек
- ✅ Карточка Windows (строка 244) была уже в файле с правильным контентом и переводами (PT/EN/DE/FR)
- ✅ Grid CSS исправлен для 5 элементов: `repeat(3,1fr)` base + `repeat(5,1fr)` при ≥1150px + `repeat(2,1fr)` при ≤600px + `1fr` при ≤420px
- ✅ «Four / Five» — все заголовки, hero_cta, doors_lead уже были «five/cinq/fünf/cinco»
- ✅ footer_services_label: «5 services / 5 Dienste / 5 serviços» в хабе

### Шаг 2: Навигация ah-dirs + футеры
Добавлена ссылка `<a href="/windows">Windows</a>` и label "5 services" в:
- ✅ airahome.html (nav + footer HTML + i18n PT/EN/DE/FR)
- ✅ construction.html (nav + footer HTML + i18n PT/EN/DE/FR)
- ✅ energia.html (nav + footer HTML + i18n PT/EN/DE/FR)
- ✅ garden.html (nav + footer HTML + i18n PT/EN/DE/FR)
- ✅ windows.html — уже содержал полный набор 5 сервисов (Часть 1)

### Шаг 3: Artech
**На airahome.html было 5 упоминаний:**
1. HTML-фолбек trust_3_desc → заменён на «Same crew that installs windows & doors for Aira Windows /windows across Portugal»
2. i18n EN trust_3_desc → заменён
3. i18n DE trust_3_desc → заменён
4. i18n FR trust_3_desc → заменён
5. i18n PT trust_3_desc → заменён

**Оставшиеся Artech вне Aira Home страниц (не трогал):**
- `aira-de.html`, `aira-pt.html` — контактный email `artechportugalia@gmail.com` (старые лендинги)
- `board.html` — заголовок внутренней страницы «Aira / Artech — Доска проектов»
- `.ua/.trash-...` — архив, не публичная страница

### Шаг 4: sitemap.xml + llms.txt
- ✅ sitemap.xml: добавлен `/windows` priority 0.9 (hreflang в sitemap нет, добавлено без)
- ✅ llms.txt: «four» → «five» в трёх местах, добавлена строка Aira Windows

### Шаг 5: Коммит
```
50be27f feat: Aira Windows — хаб, навигация, Artech→Windows, sitemap, llms (Часть 2)
7 files changed, 118 insertions(+), 69 deletions(-)
```

```
git diff --stat main..feat/aira-windows: 82 files changed, 1127 insertions(+), 69 deletions(-)
```

---

## Часть 3 — Проверка и мелкие правки (2026-11-21)

### Выполнено

**1. Сетка хаба home/index.html**
- Было: 5 карточек в ряд при ≥1150px (слишком узкие, ~200px)
- Стало: 6-колоночная сетка → 3 карточки сверху + 2 по центру снизу; карточка ≥380px
- Планшет (601–1149px): 2 колонки (было 3)
- Мобильный (≤420px): 1 колонка (без изменений)
- Коммит: a6bff7a

**2. Email aira-de.html и aira-pt.html**
- 5 вхождений `artechportugalia@gmail.com` → `info@aira-ai.net`
- aira-de.html: 2 замены; aira-pt.html: 3 замены
- board.html не тронут
- Коммит: a6bff7a

**3. Найденные и исправленные баги**
- `windows.html`: `pvc-profile-400.webp/.jpg` и `-800.*` — файлы не существуют; исправлены на `pvc-profile.webp/.jpg` (эти файлы есть в репо)
- `home/index.html`: JS-ошибка "Invalid or unexpected token" + "setLang is not defined" — 18 вхождений U+2019 (типографский апостроф) использовались как разделители строк; заменены на прямые кавычки / двойные кавычки; content-апострофы (строки L22, L98, L102, L108, L119, L121) не тронуты
- Коммит: 3ed505d

**4. Playwright-тесты (tests/windows.spec.js)**
- 31 тест, все прошли ✓
- Существующие pixel-lead.spec.js: 9/9 ✓
- Покрытие:
  - `/windows` и `/home/` на 375px и 1440px, все 4 языка PT/EN/DE/FR: нет консольных ошибок, нет горизонтального скролла, все картинки загружены
  - Ссылки `/windows` в nav/footer airahome, construction, energia, garden, home — наличие href проверено ✓
  - Форма через page.route: 200→1 Lead (fbq), 500→0 Leads, оба случая: подтверждение показано
  - Скриншоты full-page (8 штук)

**5. Скриншоты**
Путь: `~/aira-live/_screens/windows/` (не в git — добавлено в .gitignore)
- `windows-375-pt.png`, `windows-375-en.png`
- `windows-1440-pt.png`, `windows-1440-en.png`
- `home-375-pt.png`, `home-375-en.png`
- `home-1440-pt.png`, `home-1440-en.png`

**6. .gitignore**
Добавлено: `_screens/`

### Финальный git diff --stat main..feat/aira-windows
87 files changed, 1389 insertions(+), 73 deletions(−)

### Коммиты Части 3
```
3ed505d fix+test: broken images, home JS curly-quote syntax error, Playwright windows suite
a6bff7a fix: hub grid 3+2 centered desktop, email Artech→info@aira-ai.net
```

### Замечание (не блокирует)
`windows.html` строка 636: `LEADS_WEBHOOK = '.../aira-airahome-leads'` — возможно должен быть `aira-windows-leads` или `aira-site-leads`. Текущие тесты используют page.route, реальный URL не проверялся. Уточнить у Арсения.

### Результат тестов
- windows.spec.js: **31/31 ✓**
- pixel-lead.spec.js: **9/9 ✓**
- Финальный хэш: `3ed505d`

**Готово к push feat/aira-windows**

---

## Правки ревью (21.11.2026 вечер)

### 1. Грамматика PT — toda Portugal (windows.html)
- `meta description`: `em toda Portugal` → `em todo o país`
- `h1` (HTML + PT i18n): `em toda Portugal` → `em todo o país`
- `geo_title` (HTML + PT i18n): `Trabalhamos em toda Portugal` → `Trabalhamos em todo o Portugal`
- Итого 5 правок, все в `windows.html`
- Коммит: `301dd82`

### 2. Удаление бренд-дисклеймера из prod_lead (windows.html)
Убрана фраза «Sem referências de marcas...» и её аналоги во всех 4 языках (PT/EN/DE/FR) — и из HTML, и из i18n-словарей.
- Коммит: `5740cb5`

### 3. Один переключатель языка в шапке (windows.html)
Удалён `lang-badges` из `nav-mid` (декоративные статичные теги PT/EN/DE/FR по центру навбара), а также мёртвые CSS-правила `.nav-mid`, `.lang-badges`, `.lang-badge` и `@media`-правило для них. Оставлен интерактивный `lang-switch` справа.
- **Замечание**: construction.html имеет идентичную структуру с теми же `lang-badges`. Если нужно убрать там тоже — подтверди отдельно.
- Коммит: `d40ba6e`

### 4. home/index.html — географическая точность
**Изменено:**
- `<title>`, `og:title`, `twitter:title`: «Five services for your property in Portugal» → «Five services for the Algarve, plus windows & doors across Portugal»
- `<meta description>`: уточнено — 4 сервиса Algarve, Windows по всей Португалии
- `og:description`, `twitter:description`: обновлены аналогично
- JSON-LD: Organization's `areaServed` добавлен Country Portugal (рядом с Algarve)
- HTML `<h1>` и все 4 i18n (EN/DE/FR/PT): добавлено упоминание Algarve и всей Португалии для Windows
- PT `door_5_desc`: `em toda Portugal` → `em todo o Portugal`
- `llms.txt`: заголовок секции и строка Coverage обновлены
- Коммит: `550b893`

### 5. Тесты
- `tests/windows.spec.js`: **40/40 ✓**
- `tests/pixel-lead.spec.js`: **9/9 ✓**
- Последний хэш: `550b893`
