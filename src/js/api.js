import axios from 'axios';

const baseURL = 'https://pixabay.com/api/';
const apiKey = '36274851-0167dd4a4908f41b50a6b64a2';

export async function searchImages(currentQuery, currentPage) {
  const url = `${baseURL}?key=${apiKey}&q=${currentQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    return data.hits;
  } catch (error) {
    throw error;
  }
}
