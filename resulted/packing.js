const canvas = document.getElementById("packingCanvas");
const ctx = canvas.getContext("2d");

const SHEET_WIDTH = 900;
const SHEET_HEIGHT = 600;
let sheet;

function startPacking() {
    try {
        const inputText = document.getElementById("inputData").value;
        let rectangles = JSON.parse(inputText).map(r => ({ width: r.w, height: r.h }));

        rectangles.sort((a, b) => b.width * b.height - a.width * a.height); // Сортировка по убыванию площади

        sheet = createSheet();
        let failedRects = [];

        for (let rect of rectangles) {
            if (!placeRectangle(sheet, rect)) {
                failedRects.push(`(${rect.width}x${rect.height})`);
            }
        }

        if (failedRects.length > 0) {
            alert(`Ошибка: Не удалось разместить следующие прямоугольники: ${failedRects.join(", ")}`);
            return;
        }

        const remainingSpace = Array.from(sheet.freeSpaces).reduce((sum, space) => sum + space.width * space.height, 0);
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
        freeSpaces: new Set([{ x: 0, y: 0, width: SHEET_WIDTH, height: SHEET_HEIGHT }]),
        rectangles: []
    };
}

function placeRectangle(sheet, rect) {
    for (let space of sheet.freeSpaces) {
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
    sheet.freeSpaces.delete(space);
    splitFreeSpace(sheet, space, rect);
    return true;
}

function splitFreeSpace(sheet, space, rect) {
    if (space.width > rect.width) {
        sheet.freeSpaces.add({ x: space.x + rect.width, y: space.y, width: space.width - rect.width, height: space.height });
    }
    if (space.height > rect.height) {
        sheet.freeSpaces.add({ x: space.x, y: space.y + rect.height, width: rect.width, height: space.height - rect.height });
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
