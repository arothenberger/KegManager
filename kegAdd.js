// kegAdd.js - Handles adding new kegs

function handleAddKeg() {
    const name = document.getElementById('kegName').value.trim();
    const weight = document.getElementById('kegWeight').value;
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
    const id = addKeg(name, weight, abv);
    document.getElementById('addKegResult').textContent = 'Keg added!';
    document.getElementById('kegName').value = '';
    document.getElementById('kegWeight').value = '';
    if (abvInput) abvInput.value = '';
    // Hide add keg form and show selector area if present
    if (document.getElementById('addKegForm')) {
        document.getElementById('addKegForm').style.display = 'none';
    }
    if (document.getElementById('kegSelectorArea')) {
        document.getElementById('kegSelectorArea').style.display = '';
    }
    refreshKegSelector();
}

window.handleAddKeg = handleAddKeg;
