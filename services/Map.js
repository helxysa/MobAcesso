const OSM_API = 'https://nominatim.openstreetmap.org';
const ROUTE_API = 'https://router.project-osrm.org/route/v1/driving';

const headers = {
  'User-Agent': 'MobiAcess/1.0',
  'Accept-Language': 'pt-BR,pt;q=0.9',
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      error => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  });
};

export const searchLocation = async (searchText, userLocation) => {
  try {
    await delay(300);

    let url = `${OSM_API}/search?q=${encodeURIComponent(searchText)}&format=json&limit=5&countrycodes=br`;
    
    if (userLocation) {
      const viewbox = [
        userLocation.longitude - 0.1,
        userLocation.latitude - 0.1,
        userLocation.longitude + 0.1,
        userLocation.latitude + 0.1
      ].join(',');
      
      url += `&viewbox=${viewbox}&bounded=1`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data.map(item => ({
      id: item.place_id,
      name: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon)
    }));
  } catch (error) {
    console.error('Erro detalhado na busca:', error);
    throw error;
  }
};

export const getRoute = async (startPoint, endPoint) => {
  try {
    if (!startPoint || !endPoint) {
      throw new Error('Pontos de origem e destino são necessários');
    }

    const url = `${ROUTE_API}/${startPoint.longitude},${startPoint.latitude};${endPoint.longitude},${endPoint.latitude}?overview=full&geometries=geojson`;

    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      route: data.routes[0].geometry.coordinates,
      distance: data.routes[0].distance,
      duration: data.routes[0].duration
    };
  } catch (error) {
    console.error('Erro detalhado ao obter rota:', error);
    throw error;
  }
};