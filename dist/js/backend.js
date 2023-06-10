let addLayer = document.getElementById("add_layer");
let delLayer = document.getElementById("remove_layer");

let layers = document.getElementById("layers");
let items = document.getElementById("items");

var LAYER = 1;

let canvasDiv = document.getElementById("canvas-backdrop");
let default_canvas = document.getElementById("default_canvas");

let ctx = default_canvas.getContext('2d');

let cS = window.getComputedStyle(default_canvas);
let w = parseInt(cS.width.replace("px", ""));
let h = parseInt(cS.height.replace("px", ""));

default_canvas.width = w;
default_canvas.height = h;

let canvases = [];
let currentSelected = null;

// Define the size of each square in the checkered pattern
const squareSize = 5;

// Variables to keep track of the current square position
let x = 0;
let y = 0;

// Variable to toggle between black and white squares
let isBlack = true;

// Draw the checkered pattern
while (y < h) { //replaced canvasSize with h
    while (x < w) { //replaced canvasSize with w
        if (isBlack) {
            ctx.fillStyle = "rgb(50,50,50)";
        } else {
            ctx.fillStyle = "rgb(125,125,125)";
        }

        ctx.fillRect(x, y, squareSize, squareSize);

        x += squareSize;
        isBlack = !isBlack;
    }

    y += squareSize;
    x = 0;
    isBlack = !isBlack;
}

// Function to show the canvas preview
function showCanvasPreview(data) {
    let canvas = data['canvas'];
    let label = data['label'];
    let isEmpty = data['isEmpty'];

    let img = label.getElementsByTagName("img")[0];

    // Get the data URL of the canvas
    var dataURL = canvas.toDataURL();

    if (isEmpty === false) {
        img.src = dataURL;
        img.style.visibility = "visible";
    } else {
        img.style.visibility = "hidden";
    }
}

function select(data) {
    if (currentSelected !== null) {
        currentSelected.id = '';
    }
    currentSelected = data.srcElement;
    if (currentSelected.tagName !== "DIV") {
        currentSelected = currentSelected.parentElement;
    }
    currentSelected.id = 'selected';

    const getCanvas = (cs) => {
        for (let x = 0; x < canvases.length; x++) {
            let d = canvases[x];
            if (d['label'] == cs) {
                return d;
            }
        }
        return null;
    }

    switchCanvas(getCanvas(currentSelected));
}



function refresh() {
    let zoom_label = document.getElementById('zoom-label');

    let zoomfunc = (data) => {
        uneditTextHandler(data);
        if (zoom_label.value.length <= 1 || !zoom_label.value.includes("%") || isNaN(zoom_label.value.replace("%", "")) || !zoom_label.value.endsWith("%")) {
            zoom_label.value = "100%";
        }
    }
    zoom_label.removeEventListener("dblclick", editTextHandler);
    zoom_label.addEventListener("dblclick", editTextHandler);
    zoom_label.addEventListener("blur", zoomfunc);
    for (let x = 0; x < items.children.length; x++) {
        items.children[x].removeEventListener("dblclick", editTextHandler);
        items.children[x].addEventListener("dblclick", editTextHandler);
        items.children[x].removeEventListener("click", select);
        items.children[x].addEventListener("click", select);
        items.children[x].addEventListener("blur", uneditTextHandler);
    }
    for (let cnvs of canvases) {
        showCanvasPreview(cnvs);
    }


    let ctx = default_canvas.getContext('2d');

    let cS = window.getComputedStyle(default_canvas);
    let w = parseInt(cS.width.replace("px", ""));
    let h = parseInt(cS.height.replace("px", ""));

    // Define the size of the canvas
    default_canvas.width = w;
    default_canvas.height = h;

    // Define the size of each square in the checkered pattern
    const squareSize = 5;

    // Variables to keep track of the current square position
    let x = 0;
    let y = 0;

    // Variable to toggle between black and white squares
    let isBlack = true;

    ctx.fillStyle = "#00000000";
    ctx.fillRect(0, 0, w, h);

    // Draw the checkered pattern
    for (let row = 0; row < h; row += squareSize) {
        for (let col = 0; col < w; col += squareSize) {
            if ((row / squareSize) % 2 === 0) {
                // Even rows
                ctx.fillStyle = (col / squareSize) % 2 === 0 ? "#aaaaaa22" : "#ffffff77";
            } else {
                // Odd rows
                ctx.fillStyle = (col / squareSize) % 2 === 0 ? "#ffffff77" : "#7d7d7d44";
            }

            ctx.fillRect(col, row, squareSize, squareSize);
        }
    }
}

function openExportWindow() {
    var popup = window.open("export.html", "Popup Window", "width=400,height=300");
}

addLayer.addEventListener("click", () => {
    let divChild = document.createElement("div");
    divChild.classList.add("layer");
    divChild.moveable = true;
    let canvas = document.createElement("canvas");

    canvas.width = default_canvas.width;
    canvas.height = default_canvas.height;

    let ctx = canvas.getContext('2d');
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillRect(0, 0, w, h);
    let data = {
        'canvas': canvas,
        'label': divChild,
        'isEmpty': false
    };
    canvas.style.zIndex = canvases.length + 1;
    canvases.push(data);
    canvas.classList.add("canvas");
    canvasDiv.appendChild(canvas);

    let nameChild = document.createElement("p");
    nameChild.textContent = `Layer ${LAYER}`;
    LAYER++;
    let imgChild = document.createElement("img");
    imgChild.src = canvas.toDataURL();
    divChild.appendChild(imgChild);
    divChild.appendChild(nameChild);

    items.appendChild(divChild);
    refresh();
});


delLayer.addEventListener("click", () => {
    if (currentSelected !== null) {
        for (let x = 0; x < canvases.length; x++) {
            if (canvases[x]['label'] == currentSelected) {
                canvases[x]['canvas'].remove();
                canvases.splice(x, 1);
            }
        }
        currentSelected.remove();
        if (drawCanvas) {
            drawCanvas.removeEventListener("mousemove", move);
            drawCanvas.removeEventListener("mousedown", down);
            drawCanvas.removeEventListener("mouseup", up);
            drawCanvas.removeEventListener("mouseout", out);
            drawCanvas = null;
        }
    }
});

function editTextHandler(data) {
    data.srcElement.contentEditable = true;
    data.srcElement.addEventListener("keydown", handleKeyDown);
    // data.srcElement.focus();
}

function uneditTextHandler(data) {
    data.srcElement.contentEditable = false;
    data.srcElement.removeEventListener("keydown", handleKeyDown);
}

function handleKeyDown(data) {
    if (data.key === "Enter") {
        data.preventDefault();
        console.log(data);
        data.srcElement.blur();
    }
}

// Create a new MutationObserver
const observer = new MutationObserver(function (mutationsList) {
    // Iterate over the mutations that occurred
    for (let mutation of mutationsList) {
        // Check if nodes were added
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Handle the added child elements
            refresh();
        }
    }
});

// Configure and start the observer
const observerConfig = { childList: true };
observer.observe(layers, observerConfig);

refresh();

window.addEventListener('resize', () => {
    refresh();
});


///////////////////////////////////////////////////////////////////////////////////////////////////////

// CONTROLS FUNCTIONALITY

function editPixel(x, y, color, brushSize) {
    // Get the canvas element
    const canvas = currentSelected;
    const ctx = canvas.getContext('2d');

    // Get the image data of the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Loop through the pixels affected by the brush size
    for (let offsetY = -brushSize; offsetY <= brushSize; offsetY++) {
        for (let offsetX = -brushSize; offsetX <= brushSize; offsetX++) {
            const currentX = x + offsetX;
            const currentY = y + offsetY;

            // Calculate the index of the pixel in the data array
            const index = (currentY * canvas.width + currentX) * 4;

            // Update the pixel values with the specified color
            data[index] = color[0];     // Red
            data[index + 1] = color[1]; // Green
            data[index + 2] = color[2]; // Blue
            // data[index + 3] is the alpha channel (transparency)
        }
    }

    // Put the modified image data back onto the canvas
    ctx.putImageData(imageData, 0, 0);
}


/* Modify this event, send an event to the server to create the popup and handle the rest of the logic in the popup 
This includes:
    - Sending the dataURL to the server in this event
*/

window.api.receive("export-client", (...args) => {
    let filePath = args[0];
    let ext = filePath.split(".")[1];
    let saveCanvas = document.createElement("canvas");
    let ctx = saveCanvas.getContext('2d');
    for (let x = 0; x < canvases.length; x++) {
        let data = canvases[x];
        let img = new Image()
        img.src = data['canvas'].toDataURL(`image/${ext.toLowerCase()}`);
        ctx.drawImage(img, 0, 0);
        img.src = "";
    }

    // Get the data URL for the file content
    let dataURL = saveCanvas.toDataURL();
    saveCanvas.remove();

    alert(`Ready to export: ${filePath}`);

    window.api.send("export-server", dataURL);
});