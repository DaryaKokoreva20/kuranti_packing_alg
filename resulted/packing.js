const canvas = document.getElementById("packingCanvas");
const ctx = canvas.getContext("2d");

const SHEET_WIDTH = 862;
const SHEET_HEIGHT = 604;
let sheet;

function startPacking() {
    try {
        const inputText = document.getElementById("inputData").value;
        let rectangles = JSON.parse(inputText).map(r => ({ width: r.w, height: r.h }));

        rectangles.sort((a, b) => b.width * b.height - a.width * a.height); // Сортировка по убыванию площади

        sheet = createSheet();
        let remainingSpace = SHEET_WIDTH * SHEET_HEIGHT;
        let failedRects = [];

        for (let rect of rectangles) {
            let placed = placeRectangle(sheet, rect);
            if (!placed) {
                failedRects.push({ width: rect.width, height: rect.height });
            } else {
                remainingSpace -= rect.width * rect.height;
            }
        }

        if (failedRects.length > 0) {
            let failedSizes = failedRects.map(r => `(${r.width}x${r.height})`).join(", ");
            alert(`Ошибка: Не удалось разместить следующие прямоугольники: ${failedSizes}`);
            return;
        }

        document.getElementById("freeSpaceInfo").textContent = 
            `Свободная площадь на листе: ${Math.floor((remainingSpace / (SHEET_WIDTH * SHEET_HEIGHT)) * 100)}%`;

        drawSheet();
    } catch (error) {
        alert("Ошибка в формате JSON! Проверь ввод.");
    }
}

function createSheet() {
    return {
        width: SHEET_WIDTH,
        height: SHEET_HEIGHT,
        freeSpaces: [{ x: 0, y: 0, width: SHEET_WIDTH, height: SHEET_HEIGHT }],
        rectangles: []
    };
}

function placeRectangle(sheet, rect) {
    for (let i = 0; i < sheet.freeSpaces.length; i++) {
        let space = sheet.freeSpaces[i];

        if (rect.width <= space.width && rect.height <= space.height) {
            return finalizePlacement(sheet, space, rect);
        }

        if (rect.height <= space.width && rect.width <= space.height) {
            [rect.width, rect.height] = [rect.height, rect.width];
            return finalizePlacement(sheet, space, rect);
        }
    }
    return false;
}

function finalizePlacement(sheet, space, rect) {
    rect.x = space.x;
    rect.y = space.y;
    sheet.rectangles.push(rect);
    updateFreeSpaces(sheet, space, rect);
    return true;
}

function updateFreeSpaces(sheet, space, rect) {
    sheet.freeSpaces = sheet.freeSpaces.filter(s => s !== space);

    if (space.width - rect.width > 0) {
        sheet.freeSpaces.push({ x: space.x + rect.width, y: space.y, width: space.width - rect.width, height: space.height });
    }
    if (space.height - rect.height > 0) {
        sheet.freeSpaces.push({ x: space.x, y: space.y + rect.height, width: rect.width, height: space.height - rect.height });
    }
}

function drawSheet() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT);
    ctx.fillText("Лист 1", 10, 20);

    for (let rect of sheet.rectangles) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 60%, 70%)`;
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    }
}