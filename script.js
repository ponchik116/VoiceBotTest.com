document.getElementById('getUniverseBtn').addEventListener('click', async function() {
    const placeId = document.getElementById('placeIdInput').value.trim();
    if (!placeId) {
        showError('Please enter a Place ID');
        return;
    }
    
    try {
        showLoading();
        clearError();
        
        // Use proxy to avoid CORS
        const universeId = await getUniverseId(placeId);
        
        document.getElementById('universeResult').innerHTML = `
            <p>Universe ID: <strong>${universeId}</strong></p>
            <p>Now you can use this ID in Step 2 to get all places in this universe.</p>
        `;
        
        document.getElementById('universeIdInput').value = universeId;
        
    } catch (error) {
        showError('Failed to get universe ID: ' + error.message);
    } finally {
        hideLoading();
    }
});

document.getElementById('getPlacesBtn').addEventListener('click', async function() {
    const universeId = document.getElementById('universeIdInput').value.trim();
    if (!universeId) {
        showError('Please enter a Universe ID');
        return;
    }
    
    try {
        showLoading();
        clearError();
        clearResults();
        
        const places = await getPlacesInUniverse(universeId);
        
        if (places.length === 0) {
            document.getElementById('placesResult').innerHTML = '<p>No places found in this universe.</p>';
            return;
        }
        
        const container = document.getElementById('placesContainer');
        places.forEach(place => {
            const card = document.createElement('div');
            card.className = 'place-card';
            card.innerHTML = `
                <a href="https://www.roblox.com/games/${place.id}/" target="_blank">
                    <img src="https://www.roblox.com/asset-thumbnail/image?assetId=${place.id}&width=420&height=420&format=png" 
                         alt="${place.name}" class="place-image" onerror="this.src='https://via.placeholder.com/420'">
                </a>
                <div class="place-info">
                    <div class="place-name" title="${place.name}">${place.name}</div>
                    <div class="place-id">ID: ${place.id}</div>
                </div>
            `;
            container.appendChild(card);
        });
        
        document.getElementById('placesResult').innerHTML = `<p>Found ${places.length} places in this universe.</p>`;
        
    } catch (error) {
        showError('Failed to get places: ' + error.message);
    } finally {
        hideLoading();
    }
});

// Используем прокси для обхода CORS
async function fetchWithProxy(url) {
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const response = await fetch(proxyUrl + url, {
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return response.json();
}

async function getUniverseId(placeId) {
    const data = await fetchWithProxy(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
    return data.universeId;
}

async function getPlacesInUniverse(universeId) {
    const data = await fetchWithProxy(`https://develop.roblox.com/v1/universes/${universeId}/places?sortOrder=Asc&limit=100`);
    return data.data || [];
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    document.getElementById('error').textContent = message;
}

function clearError() {
    document.getElementById('error').textContent = '';
}

function clearResults() {
    document.getElementById('placesContainer').innerHTML = '';
}