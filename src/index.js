import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';
import { searchImages } from './js/api';
import { createImageCard } from './js/rendercard';
import { observeLastCard } from './js/observer';

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
  await performImageSearch();
}

async function performImageSearch() {
  try {
    const images = await searchImages(currentQuery, currentPage);

    if (images.length === 0 && currentPage === 1) {
      displayMessage(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    totalPageCount = Math.ceil(images.length / 40);

    displayImages(images);
    loading = false;

    if (currentPage === 1) {
      displayMessage(`Hooray! We found ${images.length} images.`);
    }

    observeLastCard(gallery, loading, currentPage, totalPageCount);
  } catch (error) {
    console.error('Error:', error);
  }
}

function displayImages(images) {
  const imageCards = images.map(image => createImageCard(image));
  gallery.insertAdjacentHTML('beforeend', imageCards.join(''));
  updateSimpleLightbox();
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
    performImageSearch();
  }
});
