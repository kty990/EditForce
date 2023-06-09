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

// Set up event listeners and drawing context for the canvas

function switchCanvas(data) {
    /**
     * 
     * TODO:
     * - Make the 'draw' symbol and set one of the control buttons to 'draw', and another to 'erase'
     * - Check for press of each control and update accordingly.
     */
    console.log("Switching to ", data);
    if (drawCanvas) {
        drawCanvas.removeEventListener("mousemove", move);
        drawCanvas.removeEventListener("mousedown", down);
        drawCanvas.removeEventListener("mouseup", up);
        drawCanvas.removeEventListener("mouseout", out);
    }
    drawCanvas = data['canvas'];
    drawContext = drawCanvas.getContext('2d');

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
    drawContext.stroke();
    drawContext.closePath();
}

function findxy(res, e) {
    console.log(`${res} pressed`)
    const getCanvas = (cs) => {
        for (let x = 0; x < canvases.length; x++) {
            let d = canvases[x];
            if (d['canvas'] == cs) {
                return d;
            }
        }
        return null;
    }
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - drawCanvas.offsetLeft;
        currY = e.clientY - drawCanvas.offsetTop;

        flag = true;
        dot_flag = true;
        if (dot_flag) {
            drawContext.beginPath();
            drawContext.fillStyle = DRAW_COLOR;
            drawContext.fillRect(currX, currY, 2, 2);
            drawContext.closePath();
            dot_flag = false;


            let data = getCanvas(drawCanvas);
            let img = data['label'].getElementsByTagName("img")[0];
            img.src = drawCanvas.toDataURL();
        }
    }
    if (res == 'up' || res == "out") {
        flag = false;

        let data = getCanvas(drawCanvas);
        let img = data['label'].getElementsByTagName("img")[0];
        img.src = drawCanvas.toDataURL();
    }
    if (res == 'move') {
        moving = true;
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - drawCanvas.offsetLeft;
            currY = e.clientY - drawCanvas.offsetTop;
            draw();
        }
    } else {
        moving = false;
    }
}

// Event handlers

const move = (e) => {
    findxy('move', e);
}

const down = (e) => {
    findxy('down', e);
}

const up = (e) => {
    findxy('up', e);
}

const out = (e) => {
    findxy('out', e);
}


// Store the current drawing
let savedImageData = null;
let previousDimensions = {
    'x': 0,
    'y': 0
}

function saveCanvasData() {
    savedImageData = drawContext.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
}

function restoreCanvasData() {
    if (savedImageData) {
        drawContext.putImageData(savedImageData, 0, 0);
    }
}

function rsz() { // on resize
    if (drawCanvas) {

        let cS = window.getComputedStyle(drawCanvas);
        let w = parseInt(cS.width.replace("px", ""));
        let h = parseInt(cS.height.replace("px", ""));
        if (previousDimensions['x'] < w && previousDimensions['y'] < h) {
            previousDimensions = {
                'x': w,
                'y': h
            }
            saveCanvasData()
            // Define the size of the canvas
            drawCanvas.width = w;
            drawCanvas.height = h;
            restoreCanvasData();
        }

    }
}

window.addEventListener('resize', () => {
    rsz();
})

function rgbaToHex(red, green, blue, alpha) {
    const rHex = red.toString(16).padStart(2, '0');
    const gHex = green.toString(16).padStart(2, '0');
    const bHex = blue.toString(16).padStart(2, '0');
    const aHex = Math.round(alpha * 255).toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}${aHex}`;
}

function rgbToHex(red, green, blue) {
    const rHex = red.toString(16).padStart(2, '0');
    const gHex = green.toString(16).padStart(2, '0');
    const bHex = blue.toString(16).padStart(2, '0');
    return `#${rHex}${gHex}${bHex}`;
}

function getPixelColor(x, y) {
    const imageData = drawContext.getImageData(x, y, 1, 1);
    const data = imageData.data;
    const color = {
        rgba: `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3]})`,
        rgb: `rgb(${data[0]}, ${data[1]}, ${data[2]})`,
        hex: rgbToHex(data[0], data[1], data[2], data[3])
    };
    return color;
}

function removeAlpha(color) {
    // Check if the color is in RGBA format
    if (color.startsWith("rgba")) {
        const rgbaRegex = /rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+(\.\d+)?)\)/;
        const matches = color.match(rgbaRegex);
        if (matches) {
            const red = parseInt(matches[1]);
            const green = parseInt(matches[2]);
            const blue = parseInt(matches[3]);
            return `rgb(${red}, ${green}, ${blue})`;
        }
    }

    // Check if the color is in HEX format
    if (color.startsWith("#")) {
        const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;
        const matches = color.match(hexRegex);
        if (matches) {
            const red = parseInt(matches[1], 16);
            const green = parseInt(matches[2], 16);
            const blue = parseInt(matches[3], 16);
            return `#${(red << 16 | green << 8 | blue).toString(16).padStart(6, '0')}`;
        }
    }

    // Return the color unchanged if it's not in RGBA or HEX format
    return color;
}

// Function to set the color of a pixel at (x, y)
function setPixelColor(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

// Function to perform paint bucket fill
function paintBucket(x, y, color) {
    // THIS IS THE CHATGPT version. Modify it to fit with my code
    let fillColor = removeAlpha(color);

    const initialColor = getPixelColor(x, y);
    if (initialColor['hex'] === fillColor || initialColor['rgb'] == fillColor) {
        // If the initial and fill colors are the same, no need to proceed
        return;
    }

    const stack = [];
    stack.push({ x, y });

    while (stack.length > 0) {
        const { x, y } = stack.pop();
        const currentColor = getPixelColor(x, y);

        if (currentColor === initialColor) {
            setPixelColor(x, y, fillColor);

            // Check the four neighboring pixels
            if (x > 0) stack.push({ x: x - 1, y });
            if (x < drawCanvas.width - 1) stack.push({ x: x + 1, y });
            if (y > 0) stack.push({ x, y: y - 1 });
            if (y < drawCanvas.height - 1) stack.push({ x, y: y + 1 });
        }
    }
}

////////////// DEBUGING ///////////////////////

let debug_div = document.getElementById("debug");
let down_p = document.getElementById("down");
let moving_p = document.getElementById("moving");
let exists_p = document.getElementById("exists");
let size_p = document.getElementById("size");

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
        exists_p.textContent = `Exists: ${drawCanvas !== null && drawCanvas !== undefined}`
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