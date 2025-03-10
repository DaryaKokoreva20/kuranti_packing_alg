const canvas = document.getElementById("packingCanvas");
const ctx = canvas.getContext("2d");

const SHEET_WIDTH = 900;
const SHEET_HEIGHT = 600;
let sheet;

function startPacking() {
    try {
        const inputText = document.getElementById("inputData").value;
        let rectangles = JSON.parse(inputText).map(r => ({ width: r.w, height: r.h }));

        rectangles.sort((a, b) => b.width * b.height - a.width * a.height);

        sheet = createSheet();
        let failedRects = [];

        for (let rect of rectangles) {
            if (!placeRectangle(sheet, rect)) {
                failedRects.push(rect);
            }
        }

        mergeBottomRightSpaces();
        placeLargestFailedInBottomRight(failedRects);

        if (failedRects.length > 0) {
            alert(`Ошибка: Не удалось разместить следующие прямоугольники: ${failedRects.map(r => `(${r.width}x${r.height})`).join(", ")}`);
        }

        const remainingSpace = Array.from(sheet.freeSpaces).reduce((sum, space) => sum + space.width * space.height, 0);
        document.getElementById("freeSpaceInfo").textContent = 
            `Свободная площадь на листе: ${Math.floor((remainingSpace / (SHEET_WIDTH * SHEET_HEIGHT)) * 100)}%`;

        displayFreeSpaces();
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

function mergeBottomRightSpaces() {
    let mergedSpace = { x: SHEET_WIDTH, y: SHEET_HEIGHT, width: 0, height: 0 };
    let found = false;
    let mergedSpace = { x: SHEET_WIDTH, y: SHEET_HEIGHT, width: 0, height: 0 };
    for (let space of sheet.freeSpaces) {
        if (space.x + space.width >= SHEET_WIDTH - 10 && space.y + space.height >= SHEET_HEIGHT - 10) {
                        mergedSpace.x = Math.min(mergedSpace.x, space.x);
            mergedSpace.y = Math.min(mergedSpace.y, space.y);
            mergedSpace.width += space.width;
            mergedSpace.height += space.height;
            sheet.freeSpaces.delete(space);
            found = true;
            mergedSpace.y = Math.min(mergedSpace.y, space.y);
            mergedSpace.width += space.width;
            mergedSpace.height += space.height;
            sheet.freeSpaces.delete(space);
        }
    }
        sheet.freeSpaces.add(mergedSpace);
    if (found) {
        document.getElementById("freeSpaceInfo").innerHTML += `<br>Объединенное свободное пространство в правом нижнем углу: x: ${mergedSpace.x}, y: ${mergedSpace.y}, ширина: ${mergedSpace.width}, высота: ${mergedSpace.height}`;
    }
}

function placeLargestFailedInBottomRight(failedRects) {
    if (failedRects.length === 0) return;
    failedRects.sort((a, b) => b.width * b.height - a.width * a.height);
    let largestRect = failedRects.shift();
    for (let space of sheet.freeSpaces) {
        if (largestRect.width <= space.width && largestRect.height <= space.height) {
            finalizePlacement(sheet, space, largestRect);
            break;
        }
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

function displayFreeSpaces() {
    const freeSpacesDiv = document.getElementById("freeSpacesList");
    freeSpacesDiv.innerHTML = "<strong>Свободные пространства:</strong><br>";
    for (let space of sheet.freeSpaces) {
        freeSpacesDiv.innerHTML += `x: ${space.x}, y: ${space.y}, ширина: ${space.width}, высота: ${space.height}<br>`;
    }
}
