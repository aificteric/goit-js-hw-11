import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const baseURL = 'https://pixabay.com/api/';
const apiKey = '36274851-0167dd4a4908f41b50a6b64a2';
const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

let currentQuery = '';
let currentPage = 1;
let loading = false;
let endOfResults = false;
let lightbox;

searchForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  currentQuery = this.elements.searchQuery.value.trim();
  currentPage = 1;
  clearGallery();
  endOfResults = false;
  loading = false;
  await searchImages();
});

async function searchImages() {
  const searchQuery = currentQuery.trim();
  if (searchQuery === '') {
    displayMessage('Please enter a search query.');
    return;
  }

  const url = `${baseURL}?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.hits.length === 0 && currentPage === 1) {
      displayMessage(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    displayImages(data.hits);
    loading = false;

    if (currentPage === 1) {
      displayMessage(`Hooray! We found ${data.totalHits} images.`);
    }

    const totalPages = Math.ceil(data.totalHits / 40);
    if (currentPage < totalPages) {
      currentPage++;
    } else {
      endOfResults = true;
    }

    if (!endOfResults) {
      observeLastCard();
    }
  } catch (error) {
    console.error('Error:', error);
    loading = false;
  }
}

function observeLastCard() {
  if (loading || endOfResults) {
    return;
  }

  const observer = new IntersectionObserver(
    async entries => {
      if (entries[0].isIntersecting) {
        loading = true;
        await searchImages();
      }
    },
    { threshold: 1 }
  );

  const lastCard = gallery.lastElementChild;
  if (lastCard && lastCard.classList.contains('photo-card')) {
    observer.observe(lastCard);
  } else {
    endOfResults = true;
  }
}

function displayImages(images) {
  if (currentPage === 1) {
    clearGallery();
  }

  const imageCards = images.map(image => createImageCard(image));
  gallery.insertAdjacentHTML('beforeend', imageCards.join(''));
  updateSimpleLightbox();

  observeLastCard();
}

function createImageCard(image) {
  return `
    <div class="photo-card">
      <a href="${image.largeImageURL}">
        <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes:</b> ${image.likes}
        </p>
        <p class="info-item">
          <b>Views:</b> ${image.views}
        </p>
        <p class="info-item">
          <b>Comments:</b> ${image.comments}
        </p>
        <p class="info-item">
          <b>Downloads:</b> ${image.downloads}
        </p>
      </div>
    </div>
  `;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function displayMessage(message) {
  Notiflix.Notify.init({
    width: '280px',
    position: 'right-top',
    distance: '10px',
  });

  Notiflix.Notify.info(message);
}

function initializeSimpleLightbox() {
  lightbox = new SimpleLightbox('.gallery a', {
    disableScroll: false,
  });
}

function updateSimpleLightbox() {
  if (lightbox) {
    lightbox.refresh();
  }
}

initializeSimpleLightbox();
