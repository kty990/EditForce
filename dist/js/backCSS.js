const resize = () => {
    // Get the viewport dimensions in pixels
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    // Calculate 1vh and 1vw in pixels
    const oneVhInPixels = viewportHeight * 0.01;
    const oneVwInPixels = viewportWidth * 0.01;

    // Compare the values and find the smallest
    const smallestValue = Math.min(oneVhInPixels, oneVwInPixels);
    document.documentElement.style.setProperty("--vwh", `${smallestValue}px`);
    console.log(smallestValue, 'px');
};

window.onresize = resize;