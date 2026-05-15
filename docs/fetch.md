Название таблицы в Prisma указывается сразу после объекта prisma при вызове метода. Каждая модель, которую вы описали в файле schema.prisma, становится доступна в JavaScript как свойство объекта prisma (в нижнем регистре).
Если у вас несколько разных таблиц (например, Event, Place, Organizer), вам нужно сделать отдельный запрос к каждой из них, используя те же самые условия поиска.
Вот пример, как это пишется на JavaScript для нескольких таблиц:

async function searchInMultipleTables(searchString) {
const words = searchString.trim().split(/\s+/);

// Общее условие: проверяем каждое слово
const buildConditions = (field1, field2) => {
return words.map(word => ({
OR: [
{ [field1]: { contains: word, mode: 'insensitive' } },
{ [field2]: { contains: word, mode: 'insensitive' } }
]
}));
};

// Выполняем запросы к РАЗНЫМ таблицам параллельно
const [events, places, organizers] = await Promise.all([

    // 1. Поиск по таблице "Event" (События)
    prisma.event.findMany({
      where: { AND: buildConditions('type', 'location') }
    }),

    // 2. Поиск по таблице "Place" (Площадки/Места)
    prisma.place.findMany({
      where: { AND: buildConditions('name', 'city') }
    }),

    // 3. Поиск по таблице "Organizer" (Организаторы)
    prisma.organizer.findMany({
      where: { AND: buildConditions('title', 'description') }
    })

]);

// Возвращаем все найденные результаты, объединенные в один объект
return { events, places, organizers };
}

## Где именно Prisma берет эти названия?

Всё зависит от вашего файла schema.prisma.

- Если в схеме написано model Event, то в JavaScript вы пишете prisma.event (с маленькой буквы).
- If в схеме написано model EventPlace, то в JavaScript это будет prisma.eventPlace (camelCase).

Если вы хотите, чтобы результаты из разных таблиц возвращались не отдельными массивами, а одним общим списком, их нужно будет объединить через .concat() перед возвратом.
Напишите, как называются ваши модели (таблицы) в схеме, и я изменю код прямо под ваш проект.
