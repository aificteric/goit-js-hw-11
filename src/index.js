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
let totalPageCount = 1;

const lightbox = new SimpleLightbox('.gallery a', {});

searchForm.addEventListener('submit', handleSubmit);

async function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(this);
  currentQuery = formData.get('searchQuery');

  if (!currentQuery.trim()) {
    displayMessage('Please enter a valid search query.');
    return;
  }

  currentPage = 1;
  clearGallery();
  await searchImages();
}

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

function displayImages(images) {
  const imageCards = images.map(image => createImageCard(image));
  gallery.insertAdjacentHTML('beforeend', imageCards.join(''));
  updateSimpleLightbox();
}

function createImageCard(image) {
  return `
    <div class="photo-card">
      <a href="${image.largeImageURL}" data-lightbox="gallery">
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

function updateSimpleLightbox() {
  lightbox.refresh();
}

function observeLastCard() {
  const observer = new IntersectionObserver(
    entries => {
      if (
        entries[0].isIntersecting &&
        !loading &&
        currentPage < totalPageCount
      ) {
        loading = true;
        observer.disconnect();

        currentPage++;
        searchImages();
      }
    },
    { threshold: 1 }
  );

  const lastCard = gallery.lastElementChild;
  observer.observe(lastCard);
}

window.addEventListener('scroll', () => {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  const triggerHeight = cardHeight * 2;
  const scrollPosition = window.innerHeight + window.pageYOffset;

  if (
    scrollPosition > triggerHeight &&
    !loading &&
    currentPage < totalPageCount
  ) {
    loading = true;
    currentPage++;
    searchImages();
  }
});
