// kegEdit.js - Handles editing existing kegs

function showEditKegForm() {
    const keg = getKegById(window.selectedKegId);
    if (!keg) return;

    document.getElementById('editKegName').value = keg.name;
    document.getElementById('editKegWeight').value = keg.currentWeight.toFixed(2);
    document.getElementById('editKegAbv').value = keg.abv || '';

    const editForm = document.getElementById('editKegForm');
    editForm.style.display = '';
    editForm.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
        document.getElementById('editKegName').focus();
    }, 300);
}

function hideEditKegForm() {
    document.getElementById('editKegForm').style.display = 'none';
    document.getElementById('editKegResult').textContent = '';
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
    keg.remainingGallons = Math.max(0, (keg.currentWeight - 9.5) / 8.5);
    keg.beersLeft = Math.round(keg.remainingGallons * 16);
    saveKegs(kegs);
    hideEditKegForm();
    refreshKegSelector();
    showToast('Keg updated successfully!', 'success');
}

window.showEditKegForm = showEditKegForm;
window.hideEditKegForm = hideEditKegForm;
window.saveEditKeg = saveEditKeg;
