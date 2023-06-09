function onError(message, source, lineno, colno, error) {
    new Notification('Error', {
        body: message.replace("Uncaught exception: ", ""),
        icon: '../images/icon.png'
    })
    return true; // must keep this
}

window.onerror = onError;