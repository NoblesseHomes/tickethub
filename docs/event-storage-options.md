# Варианты простого хранения webhook events в БД

Этот документ про ваш payload формата:

- `count`
- `events[]`

Цель: хранить просто, но чтобы потом удобно делать выборки:

- по `type`
- по `city`/локации
- по дате
- по жанру/теме (если нужно)

---

## Вариант 1: Самый простой (рекомендую старт)

Идея:

1. Держим 2 таблицы: `Event` и `Place`
2. `classification` храним прямо в `Event` в виде массивов строк
3. Никаких join-таблиц

### Что хранить

`Event`:

- `externalId` (уникальный id из API)
- `name`
- `startAt` (ISO datetime)
- `bookingUrl`
- `facebookEventId`
- `description`
- `entranceFee`
- `detailsUrl`
- `photoKey` (имя файла после загрузки в S3)
- `themes String[]`
- `genres String[]`
- `types String[]`
- `placeId` (ссылка на Place)

`Place`:

- `externalId`
- `city`
- `company`
- `street`
- `latitude`
- `longitude`

### Плюсы

1. Очень простой ingestion
2. Мало запросов
3. Быстрый запуск

### Минусы

1. Меньше строгой нормализации
2. Сложнее глобально переименовывать жанры/типы

### Выборки

1. По типу: `types has "Koncert"`
2. По городу: join с `Place.city`
3. По дате: `startAt between ...`

---

## Вариант 2: Баланс (лучший для роста)

Идея:

1. `Event` + `Place` как в варианте 1
2. Отдельно нормализуем только `EventType` (для фильтра "тип события")
3. `themes/genres` пока в массивах в `Event`

### Что дает

1. По `type` выборка максимально чистая и гибкая
2. Сложность ниже, чем full-normalized
3. Можно позже без боли вынести и `genres/themes` в отдельные таблицы

### Когда выбирать

Если тип события — основной фильтр в продукте уже сейчас.

---

## Вариант 3: Полная нормализация (самый тяжелый)

Идея:

1. Отдельные справочники `Theme`, `Genre`, `EventType`
2. Join-таблицы `EventTheme`, `EventGenre`, `EventTypeOnEvent`

### Плюсы

1. Идеально для аналитики
2. Чистая структура без дублей

### Минусы

1. Самый сложный ingestion
2. Больше SQL-запросов
3. Чаще упирается в транзакции/таймауты

---

## Практическая рекомендация для вашего кейса

Берите **Вариант 1** сейчас.

Почему:

1. Вы хотите "проще и легче".
2. Уже есть payload с массивами (`types`, `themes`, `genres`) — их удобно прямо так хранить.
3. Нужные выборки (тип/локация/дата) закрываются сразу.

Когда вырастет нагрузка/аналитика — перейти на Вариант 2.

---

## Мини-схема (псевдо)

```prisma
model Event {
  id              Int       @id @default(autoincrement())
  externalId      Int       @unique
  name            String
  startAt         DateTime?
  bookingUrl      String?
  facebookEventId String?
  description     String?
  entranceFee     String?
  detailsUrl      String?
  photoKey        String?
  themes          String[]
  genres          String[]
  types           String[]
  placeId         Int?
  place           Place?    @relation(fields: [placeId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([startAt])
  @@index([name])
}

model Place {
  id         Int      @id @default(autoincrement())
  externalId Int?     @unique
  city       String
  company    String?
  street     String?
  latitude   Decimal?
  longitude  Decimal?
  events     Event[]

  @@index([city])
}
```

---

## Как раскладывать payload в Variant 1

Из каждого `event`:

1. `description` -> `description.text`
2. `photoKey` -> взять из `photos` нужный URL (`normalized`), сохранить только имя файла
3. `types` -> `classification.types`
4. `themes` -> `classification.themes[].name`
5. `genres` -> все `classification.themes[].genres` в один уникальный массив
6. `startAt` -> из `dates.start_date + start_time`
7. `place` -> upsert `Place` по `place.id`, затем `event.placeId`

---

## Примеры выборок

### По типу и дате

- Найти концерты после текущей даты

### По городу и типу

- Все фестивали в `Brno`

### По жанру

- Все события, где `genres` содержит `Pop`

---

## Итог

1. Если нужен быстрый и простой запуск: Вариант 1
2. Если тип — ключевой фильтр и нужна аккуратность: Вариант 2
3. Если нужна глубинная аналитика: Вариант 3

Для вашего текущего этапа: **Вариант 1 — оптимальный**.
