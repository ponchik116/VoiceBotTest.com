// Используем собственный прокси-сервер через GitHub
const PROXY_URL = 'https://cors-proxy.roblox.workers.dev/?';

document.getElementById('getUniverseBtn').addEventListener('click', async function() {
    const placeId = document.getElementById('placeIdInput').value.trim();
    if (!placeId || isNaN(placeId)) {
        showError('Please enter a valid Place ID (numbers only)');
        return;
    }
    
    try {
        showLoading();
        clearError();
        
        const universeId = await getUniverseId(placeId);
        
        document.getElementById('universeResult').innerHTML = `
            <p>Universe ID: <strong>${universeId}</strong></p>
            <p>Now you can use this ID in Step 2 to get all places in this universe.</p>
        `;
        
        document.getElementById('universeIdInput').value = universeId;
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
});

document.getElementById('getPlacesBtn').addEventListener('click', async function() {
    const universeId = document.getElementById('universeIdInput').value.trim();
    if (!universeId || isNaN(universeId)) {
        showError('Please enter a valid Universe ID (numbers only)');
        return;
    }
    
    try {
        showLoading();
        clearError();
        clearResults();
        
        const places = await getPlacesInUniverse(universeId);
        
        if (!places || places.length === 0) {
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
                    ${place.description ? `<div class="place-desc">${place.description}</div>` : ''}
                </div>
            `;
            container.appendChild(card);
        });
        
        document.getElementById('placesResult').innerHTML = `<p>Found ${places.length} places in this universe.</p>`;
        
    } catch (error) {
        showError(error.message);
    } finally {
        hideLoading();
    }
});

// Новые функции с обработкой ошибок
async function getUniverseId(placeId) {
    const url = `https://apis.roblox.com/universes/v1/places/${placeId}/universe`;
    const response = await fetchThroughProxy(url);
    
    if (response.status === 404) {
        throw new Error('Place not found. Check the ID.');
    }
    if (response.status === 403) {
        throw new Error('Access denied. Roblox blocked the request.');
    }
    
    const data = await response.json();
    return data.universeId;
}

async function getPlacesInUniverse(universeId) {
    const url = `https://develop.roblox.com/v1/universes/${universeId}/places?sortOrder=Asc&limit=100`;
    const response = await fetchThroughProxy(url);
    
    if (response.status === 404) {
        throw new Error('Universe not found. Check the ID.');
    }
    
    const data = await response.json();
    return data.data || [];
}

// Улучшенный прокси-запрос
async function fetchThroughProxy(url) {
    try {
        const proxyResponse = await fetch(PROXY_URL + encodeURIComponent(url), {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!proxyResponse.ok) {
            throw new Error(`Proxy error: ${proxyResponse.status}`);
        }
        
        return proxyResponse;
    } catch (error) {
        throw new Error(`Network error: ${error.message}`);
    }
}

// Вспомогательные функции остаются без изменений
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
