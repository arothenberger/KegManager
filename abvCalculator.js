// --- ABV and Gravity Input Utilities for KegBeerCountdown ---
function formatGravityField(id) {
    let input = document.getElementById(id);
    let value = input.value.trim();
    if (/^\d{4}$/.test(value)) {
        value = '1.' + value.slice(1);
    }
    input.value = value;
}

function sanitizeNumericInput(input) {
    let value = input.value;
    // Remove all non-digit and non-dot characters
    value = value.replace(/[^\d.]/g, '');
    // Only allow one dot
    let parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    input.value = value;
}

function clearInput(id) {
    document.getElementById(id).value = '';
}
// ABV Calculator in JavaScript

let hydrometerAdjustment = 0.004;

function setHydrometerAdjustment() {
    let adjustmentString = document.getElementById('adjustment').value;
    hydrometerAdjustment = parseFloat(adjustmentString) || 0.004;
}

function sgToPlato(sg) {
    return (-616.868) + (1111.14 * sg) - (630.272 * Math.pow(sg, 2)) + (135.997 * Math.pow(sg, 3));
}

function normalizeGravityInput(input) {
    let value = input.trim();
    if (/^\d{4}$/.test(value)) {
        // Convert 1050 to 1.050
        value = '1.' + value.slice(1);
    }
    return parseFloat(value);
}

function abvCalculator() {
    let ogString = document.getElementById('og').value;
    let ogCount = normalizeGravityInput(ogString);

    if (isNaN(ogCount) || ogCount > 9.999 || ogCount < 0.001) {
        document.getElementById('result').textContent = "Please enter a valid original gravity reading.";
        return;
    }

    let fgString = document.getElementById('fg').value;
    let fgCount = normalizeGravityInput(fgString);

    if (isNaN(fgCount) || fgCount > 9.999 || fgCount < 0.001) {
        document.getElementById('result').textContent = "Please enter a valid final gravity reading.";
        return;
    }

    // Use global hydrometerAdjustment
    let adjustedOG = ogCount - hydrometerAdjustment;

    // Reset borders
    document.getElementById('og').style.border = '';
    document.getElementById('fg').style.border = '';

    if (fgCount > adjustedOG) {
        document.getElementById('og').style.border = '2px solid red';
        document.getElementById('fg').style.border = '2px solid red';
        document.getElementById('result').textContent = "Your final gravity has to be lower than your adjusted original gravity.";
        return;
    }

    let abvCount = (adjustedOG - fgCount) * 131;
    let platoOG = sgToPlato(adjustedOG);
    let platoFG = sgToPlato(fgCount);
    document.getElementById('result').innerHTML =
        "The percentage of alcohol by volume is " + abvCount.toFixed(2) + "%<br>" +
        "Adjusted OG in Plato: " + platoOG.toFixed(2) + "&#176;P<br>" +
        "FG in Plato: " + platoFG.toFixed(2) + "&#176;P";
}