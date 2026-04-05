// recipes.js - Handle recipe management

// Recipe data model: { id, name, batchSize, abv, ibu, style, xmlData }

function getRecipes() {
    return JSON.parse(localStorage.getItem('recipes') || '[]');
}

function saveRecipes(recipes) {
    localStorage.setItem('recipes', JSON.stringify(recipes));
}

function deleteRecipe(id) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        const recipes = getRecipes();
        const updated = recipes.filter(r => r.id !== id);
        saveRecipes(updated);
        refreshRecipeList();
        populateRecipeSelect();
        showToast('Recipe deleted successfully!', 'success');
    }
}

function parseBeerXML(xmlText) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const recipe = xmlDoc.querySelector('RECIPE');
    if (!recipe) throw new Error('Invalid BeerXML: No RECIPE found');

    const name = recipe.querySelector('NAME')?.textContent || 'Unknown';
    const type = recipe.querySelector('TYPE')?.textContent || 'Unknown';
    const brewer = recipe.querySelector('BREWER')?.textContent || 'Unknown';
    // BeerXML stores volumes in liters, convert to gallons
    const batchSizeLiters = parseFloat(recipe.querySelector('BATCH_SIZE')?.textContent) || 0;
    const batchSize = batchSizeLiters / 3.78541; // Convert liters to US gallons
    const boilSizeLiters = parseFloat(recipe.querySelector('BOIL_SIZE')?.textContent) || 0;
    const boilSize = boilSizeLiters / 3.78541; // Convert liters to US gallons
    const boilTime = parseFloat(recipe.querySelector('BOIL_TIME')?.textContent) || 0;
    const efficiency = parseFloat(recipe.querySelector('EFFICIENCY')?.textContent) || 0;
    const og = parseFloat(recipe.querySelector('EST_OG')?.textContent) || 0;
    const fg = parseFloat(recipe.querySelector('EST_FG')?.textContent) || 0;
    const abv = parseFloat(recipe.querySelector('EST_ABV')?.textContent) || 0;
    const ibu = parseFloat(recipe.querySelector('IBU')?.textContent) || 0;
    const color = parseFloat(recipe.querySelector('EST_COLOR')?.textContent) || 0;
    const calories = parseFloat(recipe.querySelector('CALORIES')?.textContent) || 0;
    const ibuMethod = recipe.querySelector('IBU_METHOD')?.textContent || 'Unknown';
    const notes = recipe.querySelector('NOTES')?.textContent || '';
    const style = recipe.querySelector('STYLE NAME')?.textContent || 'Unknown';
    const fermentationStages = parseInt(recipe.querySelector('FERMENTATION_STAGES')?.textContent) || 1;
    const primaryAge = parseInt(recipe.querySelector('PRIMARY_AGE')?.textContent) || 0;
    // BeerXML stores temperature in Celsius, convert to Fahrenheit
    const primaryTempCelsius = parseFloat(recipe.querySelector('PRIMARY_TEMP')?.textContent) || 0;
    const primaryTemp = (primaryTempCelsius * 9/5) + 32; // Convert Celsius to Fahrenheit

    return {
        id: Date.now().toString(),
        name,
        type,
        brewer,
        batchSize,
        boilSize,
        boilTime,
        efficiency,
        og,
        fg,
        abv,
        ibu,
        color,
        calories,
        ibuMethod,
        notes,
        style,
        fermentationStages,
        primaryAge,
        primaryTemp,
        xmlData: xmlText
    };
}

function uploadRecipe(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const recipe = parseBeerXML(e.target.result);
            const recipes = getRecipes();
            recipes.push(recipe);
            saveRecipes(recipes);
            refreshRecipeList();
            populateRecipeSelect();
            showToast('Recipe uploaded successfully!', 'success');
        } catch (error) {
            showToast('Error parsing XML: ' + error.message, 'error');
        }
    };
    reader.onerror = function() {
        showToast('Error reading file', 'error');
    };
    reader.readAsText(file);
    event.target.value = '';
}

function refreshRecipeList() {
    const recipes = getRecipes();
    const listEl = document.getElementById('recipeList');
    listEl.innerHTML = '';

    if (recipes.length === 0) {
        listEl.innerHTML = '<p>No recipes uploaded yet.</p>';
        updateRecipeCount(0, 0);
        return;
    }

    updateRecipeCount(recipes.length, recipes.length);
    
    // Sort recipes by name
    const sorted = [...recipes].sort((a, b) => a.name.localeCompare(b.name));
    
    // Group by style
    const grouped = {};
    sorted.forEach(recipe => {
        if (!grouped[recipe.style]) {
            grouped[recipe.style] = [];
        }
        grouped[recipe.style].push(recipe);
    });

    // Display grouped recipes
    Object.keys(grouped).sort().forEach(style => {
        const styleDiv = document.createElement('div');
        styleDiv.className = 'recipe-group';
        
        const styleTitle = document.createElement('h3');
        styleTitle.className = 'recipe-group-title';
        styleTitle.textContent = `${style} (${grouped[style].length})`;
        styleDiv.appendChild(styleTitle);
        
        grouped[style].forEach(recipe => {
            const div = document.createElement('div');
            div.className = 'recipe-item';
            div.innerHTML = `
                <div class="recipe-item-header">
                    <h4>${recipe.name}</h4>
                    <span class="recipe-type-badge">${recipe.type}</span>
                </div>
                <p class="recipe-item-meta">ABV: ${recipe.abv}% | IBU: ${recipe.ibu} | OG: ${recipe.og}</p>
                <p class="recipe-item-brewer">by ${recipe.brewer}</p>
                <div class="recipe-item-buttons">
                    <button onclick="viewRecipe('${recipe.id}')" class="modern-btn-flex recipe-btn-small">Details</button>
                    <button onclick="deleteRecipe('${recipe.id}')" class="modern-btn-flex recipe-btn-small recipe-btn-delete">Delete</button>
                </div>
            `;
            styleDiv.appendChild(div);
        });
        
        listEl.appendChild(styleDiv);
    });
}

function updateRecipeCount(shown, total) {
    const countEl = document.getElementById('recipeCount');
    if (shown === total) {
        countEl.textContent = `${total} recipe${total !== 1 ? 's' : ''}`;
    } else {
        countEl.textContent = `${shown} of ${total} recipes`;
    }
}

function filterRecipes() {
    const searchTerm = document.getElementById('recipeSearch').value.toLowerCase();
    const recipes = getRecipes();
    const listEl = document.getElementById('recipeList');
    listEl.innerHTML = '';

    if (recipes.length === 0) {
        listEl.innerHTML = '<p>No recipes uploaded yet.</p>';
        updateRecipeCount(0, 0);
        return;
    }

    // Filter recipes based on search term
    const filtered = recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.style.toLowerCase().includes(searchTerm) ||
        recipe.type.toLowerCase().includes(searchTerm) ||
        recipe.brewer.toLowerCase().includes(searchTerm)
    );

    if (filtered.length === 0) {
        listEl.innerHTML = '<p>No recipes match your search.</p>';
        updateRecipeCount(0, recipes.length);
        return;
    }

    updateRecipeCount(filtered.length, recipes.length);
    
    // Sort filtered recipes by name
    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    
    // Group by style
    const grouped = {};
    sorted.forEach(recipe => {
        if (!grouped[recipe.style]) {
            grouped[recipe.style] = [];
        }
        grouped[recipe.style].push(recipe);
    });

    // Display grouped recipes
    Object.keys(grouped).sort().forEach(style => {
        const styleDiv = document.createElement('div');
        styleDiv.className = 'recipe-group';
        
        const styleTitle = document.createElement('h3');
        styleTitle.className = 'recipe-group-title';
        styleTitle.textContent = `${style} (${grouped[style].length})`;
        styleDiv.appendChild(styleTitle);
        
        grouped[style].forEach(recipe => {
            const div = document.createElement('div');
            div.className = 'recipe-item';
            div.innerHTML = `
                <div class="recipe-item-header">
                    <h4>${recipe.name}</h4>
                    <span class="recipe-type-badge">${recipe.type}</span>
                </div>
                <p class="recipe-item-meta">ABV: ${recipe.abv}% | IBU: ${recipe.ibu} | OG: ${recipe.og}</p>
                <p class="recipe-item-brewer">by ${recipe.brewer}</p>
                <div class="recipe-item-buttons">
                    <button onclick="viewRecipe('${recipe.id}')" class="modern-btn-flex recipe-btn-small">Details</button>
                    <button onclick="deleteRecipe('${recipe.id}')" class="modern-btn-flex recipe-btn-small recipe-btn-delete">Delete</button>
                </div>
            `;
            styleDiv.appendChild(div);
        });
        
        listEl.appendChild(styleDiv);
    });
}

function viewRecipe(id) {
    const recipes = getRecipes();
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    const detailsEl = document.getElementById('recipeDetails');
    detailsEl.innerHTML = `
        <div class="recipe-details-container">
            <h3>${recipe.name}</h3>
            <div class="recipe-details-section">
                <h4>Basic Information</h4>
                <p><strong>Type:</strong> ${recipe.type}</p>
                <p><strong>Brewer:</strong> ${recipe.brewer}</p>
                <p><strong>Style:</strong> ${recipe.style}</p>
                ${recipe.notes ? `<p><strong>Notes:</strong> ${recipe.notes}</p>` : ''}
            </div>
            <div class="recipe-details-section">
                <h4>Beer Profile</h4>
                <p><strong>ABV:</strong> ${recipe.abv}%</p>
                <p><strong>IBU:</strong> ${recipe.ibu}</p>
                <p><strong>IBU Method:</strong> ${recipe.ibuMethod}</p>
                <p><strong>Color (SRM):</strong> ${recipe.color.toFixed(2)}</p>
                <p><strong>Calories:</strong> ${recipe.calories}</p>
            </div>
            <div class="recipe-details-section">
                <h4>Gravity</h4>
                <p><strong>Original Gravity (OG):</strong> ${recipe.og}</p>
                <p><strong>Final Gravity (FG):</strong> ${recipe.fg}</p>
            </div>
            <div class="recipe-details-section">
                <h4>Batch Details</h4>
                <p><strong>Batch Size:</strong> ${recipe.batchSize.toFixed(2)} gallons</p>
                <p><strong>Boil Size:</strong> ${recipe.boilSize.toFixed(2)} gallons</p>
                <p><strong>Boil Time:</strong> ${recipe.boilTime.toFixed(0)} minutes</p>
                <p><strong>Efficiency:</strong> ${recipe.efficiency}%</p>
            </div>
            <div class="recipe-details-section">
                <h4>Fermentation</h4>
                <p><strong>Fermentation Stages:</strong> ${recipe.fermentationStages}</p>
                <p><strong>Primary Age:</strong> ${recipe.primaryAge} days</p>
                <p><strong>Primary Temperature:</strong> ${recipe.primaryTemp.toFixed(1)}°F</p>
            </div>
            <button onclick="hideRecipeDetails()" class="modern-btn-flex modern-btn-secondary">Close</button>
        </div>
    `;
    detailsEl.style.display = '';
    detailsEl.scrollIntoView({ behavior: 'smooth' });
}

function hideRecipeDetails() {
    document.getElementById('recipeDetails').style.display = 'none';
}

function populateRecipeSelect() {
    const recipes = getRecipes();
    const select = document.getElementById('kegRecipe');
    if (!select) return;
    select.innerHTML = '<option value="">-- Select Recipe --</option>';
    recipes.forEach(recipe => {
        const option = document.createElement('option');
        option.value = recipe.id;
        option.textContent = recipe.name;
        select.appendChild(option);
    });
}

function onRecipeSelect() {
    const select = document.getElementById('kegRecipe');
    const recipeId = select.value;
    if (!recipeId) {
        document.getElementById('kegName').value = '';
        document.getElementById('kegAbv').value = '';
        return;
    }
    const recipes = getRecipes();
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
        document.getElementById('kegName').value = recipe.name;
        document.getElementById('kegAbv').value = recipe.abv;
        // Optionally set weight based on batch size, but user enters weight
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    refreshRecipeList();
    populateRecipeSelect();
});

// Expose functions
window.populateRecipeSelect = populateRecipeSelect;
window.filterRecipes = filterRecipes;
window.deleteRecipe = deleteRecipe;