// --- Pour Beers Form Logic ---
function showPourBeersForm() {
    document.getElementById('pourBeersForm').style.display = '';
    document.getElementById('showPourBeersBtn').style.display = 'none';
    document.getElementById('beersPoured').focus();
}
function hidePourBeersForm() {
    document.getElementById('pourBeersForm').style.display = 'none';
    document.getElementById('showPourBeersBtn').style.display = '';
    document.getElementById('beersPoured').value = '';
    document.getElementById('pourResult').textContent = '';
}
// --- Edit Keg Logic ---
function showEditKegForm() {
    const keg = getKegById(window.selectedKegId);
    if (!keg) return;
    
    // Populate form fields with current keg data
    document.getElementById('editKegName').value = keg.name;
    document.getElementById('editKegWeight').value = keg.currentWeight.toFixed(2);
    document.getElementById('editKegAbv').value = keg.abv || '';
    
    // Show form and scroll into view
    const editForm = document.getElementById('editKegForm');
    editForm.style.display = '';
    editForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Focus on first field after scroll
    setTimeout(() => {
        document.getElementById('editKegName').focus();
    }, 300);
}

function hideEditKegForm() {
    document.getElementById('editKegForm').style.display = 'none';
    document.getElementById('editKegResult').textContent = '';
    // Clear form fields
    document.getElementById('editKegName').value = '';
    document.getElementById('editKegWeight').value = '';
    document.getElementById('editKegAbv').value = '';
}

function saveEditKeg() {
    const kegs = getKegs();
    const keg = kegs.find(k => k.id === window.selectedKegId);
    if (!keg) return;
    const newName = document.getElementById('editKegName').value.trim();
    const newWeight = document.getElementById('editKegWeight').value;
    const newAbv = document.getElementById('editKegAbv').value;
    if (!newName) {
        document.getElementById('editKegResult').textContent = 'Please enter a keg name.';
        return;
    }
    if (!newWeight || isNaN(newWeight)) {
        document.getElementById('editKegResult').textContent = 'Please enter a valid keg weight.';
        return;
    }
    keg.name = newName;
    keg.currentWeight = parseFloat(newWeight);
    keg.abv = newAbv;
    // Recalculate remaining gallons and beers if weight changed
    keg.remainingGallons = Math.max(0, (keg.currentWeight - 9.5) / 8.5);
    keg.beersLeft = Math.round(keg.remainingGallons * 16);
    saveKegs(kegs);
    hideEditKegForm();
    refreshKegSelector();
    showToast('Keg updated successfully!', 'success');
}
// --- Keg Management UI Logic for KegBeerCountdown ---
function refreshKegSelector() {
    const kegs = getKegs();
    const selector = document.getElementById('kegSelector');
    const previousSelected = selector.value;
    selector.innerHTML = '';
    kegs.forEach(keg => {
        const option = document.createElement('option');
        option.value = keg.id;
        option.textContent = `${keg.name} (${keg.remainingGallons.toFixed(1)} gal left)`;
        selector.appendChild(option);
    });
    if (kegs.length > 0) {
        selector.value = previousSelected && kegs.some(k => k.id === previousSelected) ? previousSelected : kegs[0].id;
        handleSelectKeg();
    } else {
        document.getElementById('selectedKegInfo').textContent = '';
        document.getElementById('updateKegSection').style.display = 'none';
    }
}

function handleAddKeg() {
    const name = document.getElementById('kegName').value.trim();
    const weight = document.getElementById('kegWeight').value;
    const recipeId = document.getElementById('kegRecipe')?.value || '';
    if (!name) {
        document.getElementById('addKegResult').textContent = 'Please enter a keg name.';
        return;
    }
    if (!weight || isNaN(weight)) {
        document.getElementById('addKegResult').textContent = 'Please enter a valid keg weight.';
        return;
    }
    let abv = '';
    const abvInput = document.getElementById('kegAbv');
    if (abvInput && abvInput.value) {
        abv = abvInput.value;
    } else if (document.getElementById('abvResult') && document.getElementById('abvResult').dataset.abv) {
        abv = document.getElementById('abvResult').dataset.abv;
    }
    const id = addKeg(name, weight, abv, recipeId);
    document.getElementById('addKegResult').textContent = 'Keg added!';
    document.getElementById('kegName').value = '';
    document.getElementById('kegWeight').value = '';
    if (abvInput) abvInput.value = '';
    if (document.getElementById('kegRecipe')) document.getElementById('kegRecipe').value = '';
    // Hide add keg form and show selector area if present
    if (document.getElementById('addKegForm')) {
        document.getElementById('addKegForm').style.display = 'none';
    }
    if (document.getElementById('kegSelectorArea')) {
        document.getElementById('kegSelectorArea').style.display = '';
    }
    refreshKegSelector();
}

function handleSelectKeg() {
    // Always hide the edit keg form when switching kegs
    if (typeof hideEditKegForm === 'function') {
        hideEditKegForm();
    } else {
        const editForm = document.getElementById('editKegForm');
        if (editForm && editForm.style.display !== 'none') {
            editForm.style.display = 'none';
            document.getElementById('editKegResult').textContent = '';
        }
    }
    const selector = document.getElementById('kegSelector');
    window.selectedKegId = selector.value;
    const keg = getKegById(window.selectedKegId);
    if (keg) {
        document.getElementById('selectedKegInfo').innerHTML =
            `Name: ${keg.name}<br>` +
            `Weight: ${keg.currentWeight.toFixed(2)} lbs<br>` +
                (keg.abv ? `ABV: ${keg.abv}%<br>` : '') +
                `Remaining: ${keg.remainingGallons.toFixed(2)} gallons (${keg.beersLeft} beers)<br>`;
        document.getElementById('updateKegSection').style.display = '';
    } else {
        document.getElementById('selectedKegInfo').innerHTML = '';
        document.getElementById('updateKegSection').style.display = 'none';
    }
    document.getElementById('pourResult').textContent = '';
    document.getElementById('beersPoured').value = '';
}

function pourBeers() {
    const kegs = getKegs();
    if (!kegs || kegs.length === 0) {
        document.getElementById('pourResult').textContent = 'No kegs available. Please add a new keg first.';
        return;
    }
    const beersPoured = parseInt(document.getElementById('beersPoured').value);
    const keg = getKegById(window.selectedKegId);
    if (!keg) {
        document.getElementById('pourResult').textContent = 'No keg selected. Please select a keg.';
        return;
    }
    if (isNaN(beersPoured) || beersPoured < 1) {
        document.getElementById('pourResult').textContent = 'Please enter a valid number of beers.';
        return;
    }
    if (keg.beersLeft <= 0) {
        document.getElementById('pourResult').textContent = 'No beers left in this keg!';
        return;
    }
    const newTotal = updateKegBeersById(window.selectedKegId, beersPoured);
    document.getElementById('pourResult').textContent = `Beers left after pouring: ${newTotal}`;
    hidePourBeersForm();
    refreshKegSelector();
}

function removeKeg() {
    if (!window.selectedKegId) {
        const selector = document.getElementById('kegSelector');
        window.selectedKegId = selector.value;
    }
    if (!window.selectedKegId) return;
    if (confirm('Are you sure you want to remove this keg?')) {
        removeKegById(window.selectedKegId);
        refreshKegSelector();
    }
}


// Expose functions to global for HTML event handlers
window.refreshKegSelector = refreshKegSelector;
window.handleSelectKeg = handleSelectKeg;
window.pourBeers = pourBeers;
window.removeKeg = removeKeg;
window.showPourBeersForm = showPourBeersForm;
window.hidePourBeersForm = hidePourBeersForm;
// (Add/edit keg logic moved to kegAdd.js and kegEdit.js)

function calculateNewKeg(weight) {
    const kegBaseWeight = 9.5;
    const ounce = Number(weight);
    const kegBeerWeight = +(ounce - kegBaseWeight).toFixed(2);
    const kegBeerGallons = kegBeerWeight / 8.5;
    const kegRounded = +kegBeerGallons.toFixed(2);
    const kegTotalBeers = kegRounded * 16;
    return {
        weight: ounce,
        currentWeight: ounce,
        gallons: kegRounded,
        remainingGallons: kegRounded,
        beers: Math.round(kegTotalBeers),
        beersLeft: Math.round(kegTotalBeers)
    };
}

function updateKegBeers(currentBeers, beersPoured) {
    const total = currentBeers - beersPoured;
    return total > 0 ? total : 0;
}

// Simple localStorage for persistence
function saveBeersLeft(beers) {
    localStorage.setItem('beersLeft', beers);
}
function getBeersLeft() {
    return parseFloat(localStorage.getItem('beersLeft')) || 0;
}

function getKegs() {
    return JSON.parse(localStorage.getItem('kegs') || '[]');
}
function saveKegs(kegs) {
    localStorage.setItem('kegs', JSON.stringify(kegs));
}
function addKeg(name, weight) {
    // Accept abv as third argument, recipeId as fourth
    let abv = arguments.length > 2 ? arguments[2] : '';
    let recipeId = arguments.length > 3 ? arguments[3] : '';
    const kegData = calculateNewKeg(weight);
    const kegs = getKegs();
    const id = Date.now().toString();
    kegs.push({ id, name, abv, recipeId, ...kegData });
    saveKegs(kegs);
    return id;
}
function getKegById(id) {
    return getKegs().find(keg => keg.id === id);
}
function updateKegBeersById(id, beersPoured) {
    const kegs = getKegs();
    const keg = kegs.find(k => k.id === id);
    if (keg) {
        keg.beersLeft = updateKegBeers(keg.beersLeft, beersPoured);
        // Update weight and gallons assuming linear depletion
        const volumePoured = beersPoured / 16; // gallons
        const weightPoured = volumePoured * 8.5;
        keg.currentWeight = Math.max(9.5, keg.currentWeight - weightPoured);
        keg.remainingGallons = Math.max(0, (keg.currentWeight - 9.5) / 8.5);
        saveKegs(kegs);
        return keg.beersLeft;
    }
    return null;
}
function removeKegById(id) {
    const kegs = getKegs().filter(keg => keg.id !== id);
    saveKegs(kegs);
}


