// Initialize variables and functions

let drawCanvas = null;
let flag = false;
let moving = false;
let prevX = 0;
let currX = 0;
let prevY = 0;
let currY = 0;
let dot_flag = false;

let DRAW_COLOR = "#000000";
let BRUSH_SIZE = 2;

let drawContext = null;
let activeTool = {
    'btn': null,
    'type': null
};

// Set up event listeners and drawing context for the canvas

let controls = document.getElementById("controls").children;
for (let x = 0; x < controls.length; x++) {
    controls[x].addEventListener("click", () => {
        switchTool(controls[x].id);
    });
}

function switchTool(name) {
    const whitelist = [
        'draw',
        'fill',
        'erase'
    ];
    if (!whitelist.includes(name.toLowerCase())) {
        throw new Error(`Attempt to switch to tool with name "${name}" which does not exist`);
    }
    if (activeTool['btn'] != null && activeTool['type'] != null) {
        activeTool['btn'].classList.remove("active");
    }
    activeTool = {
        'btn': document.getElementById(name.toLowerCase()),
        'type': name.toLowerCase()
    };
    activeTool['btn'].classList.add("active");
}

function switchCanvas(data) {
    console.log("Switching to ", data);
    if (drawCanvas) {
        drawCanvas.removeEventListener("mousemove", move);
        drawCanvas.removeEventListener("mousedown", down);
        drawCanvas.removeEventListener("mouseup", up);
        drawCanvas.removeEventListener("mouseout", out);
    }
    drawCanvas = data['canvas'];
    drawContext = drawCanvas.getContext('2d');
    drawContext.willReadFrequently = true; // Move this line here

    drawCanvas.addEventListener("mousemove", move);
    drawCanvas.addEventListener("mousedown", down);
    drawCanvas.addEventListener("mouseup", up);
    drawCanvas.addEventListener("mouseout", out);

    rsz();
}

// Drawing functions

function draw() {
    drawContext.beginPath();
    drawContext.moveTo(prevX, prevY);
    drawContext.lineTo(currX, currY);
    drawContext.strokeStyle = DRAW_COLOR;
    drawContext.lineWidth = BRUSH_SIZE;
    if (activeTool['type'] == "draw") {
        drawContext.stroke();
    } else if (activeTool['type'] == "erase") {
        drawContext.clearRect(currX, currY, BRUSH_SIZE, BRUSH_SIZE);
    }
    drawContext.closePath();
}

function findxy(res, e) {
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - drawCanvas.offsetLeft;
        currY = e.clientY - drawCanvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            if (activeTool != null) {
                if (activeTool['type'] == 'draw') {
                    DRAW_COLOR = "#000000";
                    drawContext.beginPath();
                    drawContext.fillStyle = DRAW_COLOR;
                    drawContext.fillRect(currX, currY, 2, 2);
                    drawContext.closePath();
                    dot_flag = false;

                    let img = new Image();
                    img.src = drawCanvas.toDataURL();
                    let data = getCanvas(drawCanvas);
                    let label = data['label'];
                    label.innerHTML = '';
                    label.appendChild(img);
                } else if (activeTool['type'] == 'erase') {
                    DRAW_COLOR = "#00000000";
                    drawContext.beginPath();
                    drawContext.clearRect(currX, currY, 2, 2);
                    drawContext.closePath();
                    dot_flag = false;

                    let img = new Image();
                    img.src = drawCanvas.toDataURL();
                    let data = getCanvas(drawCanvas);
                    let label = data['label'];
                    label.innerHTML = '';
                    label.appendChild(img);
                } else if (activeTool['type'] == 'fill') {
                    const imageData = drawContext.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
                    const pixelStack = [];
                    const startPixel = (currY * imageData.width + currX) * 4;
                    const startColor = Array.from(imageData.data.slice(startPixel, startPixel + 4));

                    const matchColor = (pixel) => {
                        for (let i = 0; i < 4; i++) {
                            if (pixel[i] !== startColor[i]) {
                                return false;
                            }
                        }
                        return true;
                    };

                    const setPixelColor = (pixel, color) => {
                        for (let i = 0; i < 4; i++) {
                            pixel[i] = color[i];
                        }
                    };

                    const pushPixel = (x, y) => {
                        if (x >= 0 && x < imageData.width && y >= 0 && y < imageData.height) {
                            const pixelIndex = (y * imageData.width + x) * 4;
                            if (matchColor(imageData.data.slice(pixelIndex, pixelIndex + 4))) {
                                pixelStack.push([x, y]);
                            }
                        }
                    };

                    if (!matchColor(startColor)) {
                        return;
                    }

                    pixelStack.push([currX, currY]);

                    while (pixelStack.length > 0) {
                        const [x, y] = pixelStack.pop();
                        const pixelIndex = (y * imageData.width + x) * 4;

                        if (matchColor(imageData.data.slice(pixelIndex, pixelIndex + 4))) {
                            setPixelColor(imageData.data.slice(pixelIndex, pixelIndex + 4), DRAW_COLOR);

                            pushPixel(x + 1, y);
                            pushPixel(x - 1, y);
                            pushPixel(x, y + 1);
                            pushPixel(x, y - 1);
                        }
                    }

                    drawContext.putImageData(imageData, 0, 0);

                    let img = new Image();
                    img.src = drawCanvas.toDataURL();
                    let data = getCanvas(drawCanvas);
                    let label = data['label'];
                    label.innerHTML = '';
                    label.appendChild(img);
                }
            }
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - drawCanvas.offsetLeft;
            currY = e.clientY - drawCanvas.offsetTop;
            draw();
        }
    }
}

function move(e) {
    findxy('move', e);
}

function down(e) {
    findxy('down', e);
}

function up(e) {
    findxy('up', e);
}

function out(e) {
    findxy('out', e);
}

// Utility functions

const getCanvas = (cs) => {
    for (let x = 0; x < canvases.length; x++) {
        let d = canvases[x];
        if (d['canvas'] == cs) {
            return d;
        }
    }
    return null;
}

function rsz() {
    drawContext.canvas.width = drawCanvas.offsetWidth;
    drawContext.canvas.height = drawCanvas.offsetHeight;
}

window.addEventListener('resize', rsz);



////////////// DEBUGING ///////////////////////

let debug_div = document.getElementById("debug");
let down_p = document.getElementById("down");
let moving_p = document.getElementById("moving");
let exists_p = document.getElementById("exists");
let size_p = document.getElementById("size");
let mode_p = document.getElementById("mode");

function wait(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    })
}

async function debug() {
    while (true) {
        await wait(100);
        down_p.textContent = `Down: ${flag}`;
        moving_p.textContent = `Moving: ${moving}`;
        exists_p.textContent = `Exists: ${drawCanvas !== null && drawCanvas !== undefined}`;
        mode_p.textContent = `Mode: ${activeTool['type']}`
        if (drawCanvas) {
            let cS = window.getComputedStyle(drawCanvas);
            let w = parseInt(cS.width.replace("px", ""));
            let h = parseInt(cS.height.replace("px", ""));
            size_p.textContent = `Size: X:${w} | Y:${h}`;
        } else {
            size_p.textContent = `Size: X:? | Y:?`;
        }

    }
}



debug();