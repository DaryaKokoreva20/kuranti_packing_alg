const canvas = document.getElementById("packingCanvas");
const ctx = canvas.getContext("2d");

const SHEET_WIDTH = 900;
const SHEET_HEIGHT = 600;

// Пример входных данных: массив прямоугольников (ширина, высота)
const rectangles = [
    { width: 400, height: 300 },
    { width: 450, height: 200 },
    { width: 300, height: 300 },
    { width: 250, height: 250 },
    { width: 200, height: 200 },
    { width: 350, height: 150 },
    { width: 150, height: 100 },
    { width: 500, height: 300 },
];

// Сортируем по убыванию площади (w * h)
rectangles.sort((a, b) => b.width * b.height - a.width * a.height);

// Хранение листов
let sheets = [];

// Функция упаковки
function packRectangles() {
    for (let rect of rectangles) {
        let placed = false;

        // Ищем первый лист, куда можно добавить прямоугольник
        for (let sheet of sheets) {
            if (placeRectangle(sheet, rect)) {
                placed = true;
                break;
            }
        }

        // Если не нашли место, создаем новый лист
        if (!placed) {
            let newSheet = createSheet();
            placeRectangle(newSheet, rect);
            sheets.push(newSheet);
        }
    }
}

// Создание нового листа
function createSheet() {
    return {
        width: SHEET_WIDTH,
        height: SHEET_HEIGHT,
        freeSpaces: [{ x: 0, y: 0, width: SHEET_WIDTH, height: SHEET_HEIGHT }],
        rectangles: [],
    };
}

// Размещение прямоугольника на листе
function placeRectangle(sheet, rect) {
    for (let i = 0; i < sheet.freeSpaces.length; i++) {
        let space = sheet.freeSpaces[i];

        // Проверяем, помещается ли объект в свободное место
        if (rect.width <= space.width && rect.height <= space.height) {
            rect.x = space.x;
            rect.y = space.y;
            sheet.rectangles.push(rect);

            // Разрезаем свободное место
            splitSpace(sheet, space, rect);
            return true;
        }

        // Проверяем поворот 90°
        if (rect.height <= space.width && rect.width <= space.height) {
            [rect.width, rect.height] = [rect.height, rect.width];
            rect.x = space.x;
            rect.y = space.y;
            sheet.rectangles.push(rect);

            splitSpace(sheet, space, rect);
            return true;
        }
    }
    return false;
}

// Разрезаем свободное пространство
function splitSpace(sheet, space, rect) {
    let newSpaces = [];

    // Горизонтальный разрез (создаем два новых свободных пространства)
    if (space.width - rect.width > 0) {
        newSpaces.push({
            x: space.x + rect.width,
            y: space.y,
            width: space.width - rect.width,
            height: space.height,
        });
    }

    if (space.height - rect.height > 0) {
        newSpaces.push({
            x: space.x,
            y: space.y + rect.height,
            width: rect.width,
            height: space.height - rect.height,
        });
    }

    // Убираем использованное пространство и добавляем новые пустые зоны
    sheet.freeSpaces.splice(sheet.freeSpaces.indexOf(space), 1);
    sheet.freeSpaces.push(...newSpaces);
}

// Отрисовка результата
function drawSheets() {
    let offsetX = 0;
    let offsetY = 0;
    let gap = 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "14px Arial";

    for (let sheet of sheets) {
        // Рисуем границу листа
        ctx.strokeRect(offsetX, offsetY, SHEET_WIDTH, SHEET_HEIGHT);
        ctx.fillText(`Лист ${sheets.indexOf(sheet) + 1}`, offsetX + 10, offsetY + 20);

        for (let rect of sheet.rectangles) {
            ctx.fillStyle = `hsl(${Math.random() * 360}, 60%, 70%)`;
            ctx.fillRect(offsetX + rect.x, offsetY + rect.y, rect.width, rect.height);
            ctx.strokeRect(offsetX + rect.x, offsetY + rect.y, rect.width, rect.height);
        }

        // Сдвиг следующего листа вниз
        offsetY += SHEET_HEIGHT + gap;
    }
}

// Запуск алгоритма
packRectangles();
drawSheets();
