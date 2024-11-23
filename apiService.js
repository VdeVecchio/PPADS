const API_URL = process.env.REACT_APP_API_URL;

export async function fetchNotas(token) {
  const response = await fetch(`${API_URL}/notas`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}

export async function createNota(nota, token) {
  const response = await fetch(`${API_URL}/notas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(nota),
  });
  return await response.json();
}
