const canvasId = 'canvas';
const canvasWidth = 900;
const canvasHeight = 600;

const test = 0;

const fixedBoxes = [
    [
        { w: 235, h: 296 }, { w: 263, h: 293 }, { w: 288, h: 64 }, { w: 230, h: 214 },
        { w: 100, h: 59 }, { w: 53, h: 158 }, { w: 111, h: 147 }, { w: 78, h: 56 },
        { w: 62, h: 37 }, { w: 130, h: 259 }, { w: 106, h: 255 }, { w: 248, h: 121 },
        { w: 240, h: 125 }, { w: 185, h: 120 }, { w: 175, h: 61 }, { w: 109, h: 39 },
        { w: 82, h: 35 }, { w: 228, h: 114 }, { w: 158, h: 86 }, { w: 33, h: 41 }, { w: 110, h: 112 }
    ],
    [
        { w: 213, h: 295 }, { w: 188, h: 294 }, { w: 293, h: 57 }, { w: 269, h: 173 },
        { w: 225, h: 150 }, { w: 105, h: 58 }, { w: 85, h: 58 }, { w: 114, h: 287 },
        { w: 278, h: 50 }, { w: 277, h: 156 }, { w: 174, h: 41 }, { w: 266, h: 142 },
        { w: 214, h: 54 }, { w: 206, h: 64 }, { w: 149, h: 72 }, { w: 138, h: 35 }, { w: 258, h: 97 }, { w: 255, h: 97 }, { w: 253, h: 253 }, { w: 241, h: 252 }
    ],
    [
        { w: 296, h: 143 }, { w: 273, h: 132 }, { w: 252, h: 57 }, { w: 246, h: 68 },
        { w: 102, h: 291 }, { w: 285, h: 176 }, { w: 284, h: 167 }, { w: 224, h: 139 },
        { w: 277, h: 43 }, { w: 217, h: 56 }, { w: 136, h: 49 }, { w: 235, h: 86 },
        { w: 218, h: 55 }, { w: 93, h: 54 }, { w: 49, h: 50 }, { w: 217, h: 77 },
        { w: 214, h: 45 }, { w: 193, h: 45 }, { w: 277, h: 275 }, { w: 258, h: 191 }, { w: 197, h: 224 }
    ]
];

const colors = [
    [
        "#CE9780", "#A3B387", "#C775A8", "#B0BCC3", "#BF8BC7", "#CC7F78", "#A7A6A1", "#749D86", 
        "#CCA5B1", "#CD84A2", "#789877", "#7E7EB9", "#B4C4A5", "#788ED0", "#8D7490", "#96C3B9", 
        "#A77CA1", "#73C57B", "#D0C88C", "#99A3B5", "#C8CCAE"
    ],
    [
        "#A7BD96", "#BBA5C0", "#A68286", "#99CEB0", "#CD948B", "#CACCCE", "#75B97C", "#828176", 
        "#90A2B9", "#95C170", "#B0BB9C", "#93988E", "#92C6AC", "#8EA2B3", "#9AADBB", "#707C7E", 
        "#B190B6", "#8083A5", "#8395C7", "#B080C5"
    ],
    [
        "#AEB274", "#B2B49E", "#9075AB", "#C7BEBB", "#BC7093", "#867CA5", "#B58590", "#81897C", 
        "#8E8799", "#C1CF91", "#8B73A9", "#A58C8F", "#7B7A82", "#90CB78", "#72C2AA", "#9FA8BC", 
        "#728593", "#7AC0B2", "#B47F89", "#979FBD", "#CA7A74"
    ]
];

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
