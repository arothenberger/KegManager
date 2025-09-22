// kegEdit.js - Handles editing existing kegs

function showEditKegForm() {
    const editForm = document.getElementById('editKegForm');
    // If already visible, hide it (toggle behavior)
    if (editForm.style.display === '' || editForm.style.display === undefined || editForm.style.display === null) {
        editForm.style.display = 'none';
        document.getElementById('editKegResult').textContent = '';
        return;
    }
    // Otherwise, show and populate
    const keg = getKegById(window.selectedKegId);
    if (!keg) return;
    document.getElementById('editKegName').value = keg.name;
    document.getElementById('editKegWeight').value = keg.weight;
    document.getElementById('editKegAbv').value = keg.abv || '';
    editForm.style.display = '';
}

function hideEditKegForm() {
    document.getElementById('editKegForm').style.display = 'none';
    document.getElementById('editKegResult').textContent = '';
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
    keg.weight = newWeight;
    keg.abv = newAbv;
    // Recalculate gallons, beers, and beersLeft if weight changed
    const newKegData = calculateNewKeg(newWeight);
    keg.gallons = newKegData.gallons;
    keg.beers = newKegData.beers;
    keg.beersLeft = newKegData.beersLeft;
    saveKegs(kegs);
    hideEditKegForm();
    refreshKegSelector();
}

window.showEditKegForm = showEditKegForm;
window.hideEditKegForm = hideEditKegForm;
window.saveEditKeg = saveEditKeg;
