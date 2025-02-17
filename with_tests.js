import { fixedBoxes, colors } from './tests.js';

const canvasId = 'canvas';
const canvasWidth = 900;
const canvasHeight = 600;

const test = 0;

function getColorMap() {
    return fixedBoxes.map((boxes, testIndex) =>
        boxes.map((_, boxIndex) => colors[testIndex][boxIndex % colors[testIndex].length])
    );
}

function drawBoxes(boxes, unplaced) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка листа с толстыми краями
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    const colorMap = getColorMap();
    
    // Отрисовка размещенных объектов
    boxes.forEach((box, index) => {
        if (box.x !== undefined && box.y !== undefined) {
            ctx.fillStyle = colorMap[test][index];
            ctx.fillRect(box.x, box.y, box.w, box.h);
            ctx.strokeRect(box.x, box.y, box.w, box.h);

            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.fillText(`${box.w}x${box.h}`, box.x + 5, box.y + 15);
        }
    });

    // Отрисовка не поместившихся объектов справа
    ctx.lineWidth = 1;
    ctx.font = '14px Arial';
    ctx.fillText('Не поместились:', canvasWidth + 10, 20);
    let offsetY = 30;
    unplaced.forEach((box, index) => {
        ctx.fillStyle = colorMap[test][index % colorMap[test].length];
        ctx.fillRect(canvasWidth + 10, offsetY, box.w, box.h);
        ctx.strokeRect(canvasWidth + 10, offsetY, box.w, box.h);

        ctx.fillStyle = '#000';
        ctx.fillText(`${box.w}x${box.h}`, canvasWidth + 15, offsetY + 15);
        offsetY += box.h + 10;
    });
}

function mergeSpaces(spaces) {
    for (let i = 0; i < spaces.length; i++) {
        for (let j = i + 1; j < spaces.length; j++) {
            let a = spaces[i];
            let b = spaces[j];

            if (a.y === b.y && a.h === b.h && a.x + a.w === b.x) {
                a.w += b.w;
                spaces.splice(j, 1);
                j--;
            } else if (a.x === b.x && a.w === b.w && a.y + a.h === b.y) {
                a.h += b.h;
                spaces.splice(j, 1);
                j--;
            }
        }
    }
}

function placeBoxesInSpaces(boxes, spaces) {
    let unplaced = [];
    
    boxes.forEach((box) => {
        let placed = false;
        for (let rotation = 0; rotation < 2; rotation++) {
            let [w, h] = rotation === 1 ? [box.h, box.w] : [box.w, box.h];

            for (let i = spaces.length - 1; i >= 0; i--) {
                let space = spaces[i];
                if (w <= space.w && h <= space.h) {
                    box.x = space.x;
                    box.y = space.y;

                    if (w === space.w && h === space.h) {
                        spaces.splice(i, 1);
                    } else if (h === space.h) {
                        space.x += w;
                        space.w -= w;
                    } else if (w === space.w) {
                        space.y += h;
                        space.h -= h;
                    } else {
                        spaces.push({ x: space.x + w, y: space.y, w: space.w - w, h });
                        space.y += h;
                        space.h -= h;
                    }
                    placed = true;
                    break;
                }
            }
            if (placed) break;
        }
        if (!placed) {
            unplaced.push({ ...box });
        }
    });
    return unplaced;
}

function potpack(boxes) {
    let unplaced = [];
    
    boxes.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));
    let spaces = [{ x: 0, y: 0, w: canvasWidth, h: canvasHeight }];
    unplaced = placeBoxesInSpaces(boxes, spaces);
    mergeSpaces(spaces);

    let retryCount = 0;
    while (unplaced.length > 0 && retryCount < 3) {
        mergeSpaces(spaces);
        unplaced = placeBoxesInSpaces(unplaced, spaces);
        retryCount++;
    }
    return { boxes, unplaced };
}

function main() {
    const boxes = fixedBoxes[test].map((box, index) => ({ ...box, id: index }));
    const result = potpack(boxes);
    drawBoxes(result.boxes, result.unplaced);
}

main();
