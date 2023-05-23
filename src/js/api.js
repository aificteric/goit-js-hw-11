import axios from 'axios';
import {
  displayImages,
  clearGallery,
  displayMessage,
  updateSimpleLightbox,
  observeLastCard,
} from '../index.js';

const baseURL = 'https://pixabay.com/api/';
const apiKey = '36274851-0167dd4a4908f41b50a6b64a2';

async function searchImages() {
  const url = `${baseURL}?key=${apiKey}&q=${currentQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.hits.length === 0 && currentPage === 1) {
      displayMessage(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    totalPageCount = Math.ceil(data.totalHits / 40); // Calculate total page count

    displayImages(data.hits);
    loading = false;

    if (currentPage === 1) {
      displayMessage(`Hooray! We found ${data.totalHits} images.`);
    }

    observeLastCard();
  } catch (error) {
    console.error('Error:', error);
  }
}

export {
  searchImages,
  clearGallery,
  displayMessage,
  updateSimpleLightbox,
  observeLastCard,
};
