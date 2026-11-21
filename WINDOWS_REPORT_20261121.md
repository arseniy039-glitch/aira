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
