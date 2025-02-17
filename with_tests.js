import { fixedBoxes, colors } from "./tests.js"
const canvasId = 'canvas';
const canvasWidth = 900;
const canvasHeight = 600;

const test = 0;

function drawBoxes(boxes, unplaced) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка листа с толстыми краями
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // Отрисовка размещенных объектов
    boxes.forEach((box) => {
        if (box.x !== undefined && box.y !== undefined) {
            ctx.fillStyle = getColor(test);
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
    unplaced.forEach((box) => {
        ctx.fillStyle = getColor(test);
        ctx.fillRect(canvasWidth + 10, offsetY, box.w, box.h);
        ctx.strokeRect(canvasWidth + 10, offsetY, box.w, box.h);

        ctx.fillStyle = '#000';
        ctx.fillText(`${box.w}x${box.h}`, canvasWidth + 15, offsetY + 15);
        offsetY += box.h + 10;
    });
}

function getColor(test) {
    return fixedBoxes[test].map((_, index) => colors[test][index % colors[test].length]);
}

function mergeSpaces(spaces) {
    for (let i = 0; i < spaces.length; i++) {
        for (let j = i + 1; j < spaces.length; j++) {
            let a = spaces[i];
            let b = spaces[j];

            // Объединяем смежные пространства по ширине
            if (a.y === b.y && a.h === b.h && a.x + a.w === b.x) {
                a.w += b.w;
                spaces.splice(j, 1);
                j--;
            }
            // Объединяем смежные пространства по высоте
            else if (a.x === b.x && a.w === b.w && a.y + a.h === b.y) {
                a.h += b.h;
                spaces.splice(j, 1);
                j--;
            }
            // Проверяем возможность объединения по пересечению (более гибкое объединение)
            else if (a.x === b.x && a.w === b.w) {
                // По вертикали
                let minY = Math.min(a.y, b.y);
                let maxY = Math.max(a.y + a.h, b.y + b.h);
                if (maxY - minY === a.h + b.h) {
                    a.y = minY;
                    a.h = maxY - minY;
                    spaces.splice(j, 1);
                    j--;
                }
            } else if (a.y === b.y && a.h === b.h) {
                // По горизонтали
                let minX = Math.min(a.x, b.x);
                let maxX = Math.max(a.x + a.w, b.x + b.w);
                if (maxX - minX === a.w + b.w) {
                    a.x = minX;
                    a.w = maxX - minX;
                    spaces.splice(j, 1);
                    j--;
                }
            }
        }
    }
}

function placeBoxesInSpaces(boxes, spaces) {
    let unplaced = [];

    boxes.forEach((box) => {
        let placed = false;
        for (let rotation = 0; rotation < 2; rotation++) {
            if (rotation === 1) {
                [box.w, box.h] = [box.h, box.w];
            }

            for (let i = spaces.length - 1; i >= 0; i--) {
                let space = spaces[i];
                if (box.w <= space.w && box.h <= space.h) {
                    box.x = space.x;
                    box.y = space.y;

                    if (box.w === space.w && box.h === space.h) {
                        spaces.splice(i, 1);
                    } else if (box.h === space.h) {
                        space.x += box.w;
                        space.w -= box.w;
                    } else if (box.w === space.w) {
                        space.y += box.h;
                        space.h -= box.h;
                    } else {
                        spaces.push({
                            x: space.x + box.w,
                            y: space.y,
                            w: space.w - box.w,
                            h: box.h
                        });
                        space.y += box.h;
                        space.h -= box.h;
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

    // Улучшенная сортировка: сначала большие объекты
    boxes.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));

    let spaces = [{ x: 0, y: 0, w: canvasWidth, h: canvasHeight }];
    let width = 0;
    let height = 0;

    // Размещение объектов в подпространства
    unplaced = placeBoxesInSpaces(boxes, spaces);

    // Объединяем подпространства
    mergeSpaces(spaces);

    // Повторная попытка размещения оставшихся объектов
    let retryCount = 0;
    while (unplaced.length > 0 && retryCount < 3) {
        mergeSpaces(spaces);
        unplaced = placeBoxesInSpaces(unplaced, spaces);
        retryCount++;
    }

    return { boxes, unplaced, width, height };
}

function main() {
    const boxes = fixedBoxes[test];
    const result = potpack(boxes);
    drawBoxes(result.boxes, result.unplaced);
}

main(); 
