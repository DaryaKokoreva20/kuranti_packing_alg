const canvas = document.getElementById("packingCanvas");
const ctx = canvas.getContext("2d");

const SHEET_WIDTH = 862;
const SHEET_HEIGHT = 604;
let sheet;

function createSheet() {
    return {
        width: SHEET_WIDTH,
        height: SHEET_HEIGHT,
        freeSpaces: new Set([{ x: 0, y: 0, width: SHEET_WIDTH, height: SHEET_HEIGHT }]),
        rectangles: []
    };
}

function startPacking() {
    try {
        const inputText = document.getElementById("inputData").value;
        let rectangles = JSON.parse(inputText).map(r => ({ width: r.width, height: r.height }));

        rectangles.sort((a, b) => {
            let areaDiff = b.width * b.height - a.width * a.height;
            return areaDiff !== 0 ? areaDiff : Math.max(b.width, b.height) - Math.max(a.width, a.height);
        });
        console.table(rectangles);

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
        alert(`Ошибка: ${error}`);
    }
}

function placeRectangle(sheet, rect) {
    for (let space of sheet.freeSpaces) {
        let tempRect = { x: space.x, y: space.y, width: rect.width, height: rect.height };

        if (tempRect.width <= space.width && tempRect.height <= space.height) {
            if (!isOverlapping(sheet, tempRect)) {
                return finalizePlacement(sheet, space, tempRect);
            }
        }

        // Проверяем вариант с поворотом
        tempRect = { x: space.x, y: space.y, width: rect.height, height: rect.width };

        if (tempRect.width <= space.width && tempRect.height <= space.height) {
            if (!isOverlapping(sheet, tempRect)) {
                return finalizePlacement(sheet, space, tempRect);
            }
        }
    }
    return false;
}
