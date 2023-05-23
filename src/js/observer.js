export function observeLastCard(gallery, loading, currentPage, totalPageCount) {
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
        performImageSearch();
      }
    },
    { threshold: 1 }
  );

  const lastCard = gallery.lastElementChild;
  observer.observe(lastCard);
}
