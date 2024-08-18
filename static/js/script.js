let series = {};
let currentSeries = 'portraits';
let currentPhotoIndex = 0;
let carouselCurrentIndex = 0;

const photoElement = document.getElementById('photo');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const tabs = document.querySelectorAll('.tab');
const carousel = document.getElementById('carousel');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselWrapper = document.getElementById('carouselWrapper');
const toggleButton = document.getElementById('toggleButton');

// Add event delegation for button clicks
document.addEventListener('click', function(event) {
    if (event.target.id === 'prev') {
        showPreviousPhoto();
    } else if (event.target.id === 'next') {
        showNextPhoto();
    }
});

tabs.forEach(tab => tab.addEventListener('click', changeSeries));
document.addEventListener('keydown', handleKeydown);

photoElement.addEventListener('dragstart', (e) => {
    e.preventDefault();
});

function fetchImages(seriesName) {
    console.log(`Fetching images for series: ${seriesName}`);
    fetch(`/api/images/${seriesName}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch images for series: ${seriesName}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Fetched images for ${seriesName}:`, data);
            series[seriesName] = data.images;
            updatePhoto();
            populateCarousel(data.images);
        })
        .catch(error => {
            console.error('Error fetching image data:', error);
            alert(`Error loading images for ${seriesName}. Please try again later.`);
        });
}

function showPreviousPhoto() {
    currentPhotoIndex = (currentPhotoIndex - 1 + series[currentSeries].length) % series[currentSeries].length;
    console.log(`Showing previous photo. Current index: ${currentPhotoIndex}`);
    updatePhoto();
}

function showNextPhoto() {
    currentPhotoIndex = (currentPhotoIndex + 1) % series[currentSeries].length;
    console.log(`Showing next photo. Current index: ${currentPhotoIndex}`);
    updatePhoto();
}

function changeSeries(event) {
    currentSeries = event.target.getAttribute('data-series');
    currentPhotoIndex = 0;
    carouselCurrentIndex = 0;
    console.log(`Changed series to ${currentSeries}`);

    if (!series[currentSeries]) {
        console.log(`Fetching images for ${currentSeries}`);
        fetchImages(currentSeries);
    } else {
        updatePhoto();
        populateCarousel(series[currentSeries]);
    }

    tabs.forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
}

function updatePhoto() {
    if (series[currentSeries] && series[currentSeries][currentPhotoIndex]) {
        const currentImage = series[currentSeries][currentPhotoIndex];

        console.log(`Updating photo to: ${currentImage.url}`);

        photoElement.classList.remove('fade-in');
        photoElement.classList.add('fade-out');

        setTimeout(() => {
            photoElement.src = currentImage.url;
            photoElement.classList.remove('fade-out');
            photoElement.classList.add('fade-in');
            console.log(`Updated photo to ${photoElement.src}`);

            // Update carousel selection
            updateCarouselSelection();
        }, 782);
    } else {
        console.error('No images available for this series');
    }
}

function handleKeydown(event) {
    switch(event.key) {
        case 'ArrowLeft':
            showPreviousPhoto();
            break;
        case 'ArrowRight':
            showNextPhoto();
            break;
        case 'Tab':
            event.preventDefault();
            let activeTab = document.querySelector('.tab.active');
            let newActiveTab = activeTab.nextElementSibling || tabs[0];
            activeTab.classList.remove('active');
            newActiveTab.classList.add('active');
            currentSeries = newActiveTab.getAttribute('data-series');
            currentPhotoIndex = 0;
            carouselCurrentIndex = 0;
            if (!series[currentSeries]) {
                fetchImages(currentSeries);
            } else {
                updatePhoto();
                populateCarousel(series[currentSeries]);
            }
            break;
    }
}

function updateButtonSizes() {
    const sliderHeight = document.querySelector('.slider').offsetHeight;
    const buttons = document.querySelectorAll('.nav-button');
    buttons.forEach(button => {
        button.style.height = `${sliderHeight}px`;
    });
}

// Carousel functionality
let isVerticalLayout = window.innerWidth > 600;
const visibleImagesCount = 4;

function updateCarouselLayout() {
    isVerticalLayout = window.innerWidth > 600;
    
    if (isVerticalLayout) {
        carouselPrev.innerHTML = '&#9650;';
        carouselNext.innerHTML = '&#9660;';
        carouselWrapper.style.bottom = 'auto';
    } else {
        carouselPrev.innerHTML = '&#9664;';
        carouselNext.innerHTML = '&#9654;';
        carouselWrapper.style.left = '0';
    }
    
    updateCarouselPosition();
    updateCarousel();
    updateCarouselImageSizes();
}

function updateCarouselPosition() {
    if (isVerticalLayout) {
        carouselWrapper.style.left = carouselWrapper.classList.contains('active') ? '0' : '-140px';
    } else {
        carouselWrapper.style.bottom = carouselWrapper.classList.contains('active') ? '0' : '-20vh';
    }
}

function updateCarousel() {
    const images = carousel.getElementsByTagName('img');
    if (images.length > 0) {
        if (isVerticalLayout) {
            const offset = -carouselCurrentIndex * (images[0].offsetHeight + 10);
            carousel.style.transform = `translateY(${offset}px)`;
        } else {
            const offset = -carouselCurrentIndex * (images[0].offsetWidth + 10);
            carousel.style.transform = `translateX(${offset}px)`;
        }
    }
}

function updateCarouselImageSizes() {
    const images = carousel.getElementsByTagName('img');
    const containerWidth = carouselWrapper.clientWidth;
    const containerHeight = carouselWrapper.clientHeight;
    const imageCount = Math.min(images.length, visibleImagesCount);

    if (isVerticalLayout) {
        const imageHeight = Math.min((containerHeight - (imageCount - 1) * 10) / imageCount, 100);
        Array.from(images).forEach(img => {
            img.style.height = `${imageHeight}px`;
            img.style.width = '100%';
            img.style.objectFit = 'cover';
        });
    } else {
        const imageWidth = Math.min((containerWidth - (imageCount - 1) * 10) / imageCount, 150);
        Array.from(images).forEach(img => {
            img.style.width = `${imageWidth}px`;
            img.style.height = '100%';
            img.style.objectFit = 'cover';
        });
    }
}

function toggleCarousel() {
    carouselWrapper.classList.toggle('active');
    updateCarouselPosition();
}

function populateCarousel(images) {
    carousel.innerHTML = ''; // Clear existing images
    images.forEach((image, index) => {
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = 'Carousel Image';
        img.style.objectFit = 'cover';
        img.dataset.index = index;
        img.addEventListener('click', () => {
            currentPhotoIndex = index;
            updatePhoto();
        });
        carousel.appendChild(img);
    });
    updateCarouselLayout();
}

function updateCarouselSelection() {
    const carouselImages = carousel.getElementsByTagName('img');
    Array.from(carouselImages).forEach((img, index) => {
        if (index === currentPhotoIndex) {
            img.classList.add('selected');
        } else {
            img.classList.remove('selected');
        }
    });
}

function moveCarousel(direction) {
    const images = carousel.getElementsByTagName('img');
    if (direction === 'prev') {
        carouselCurrentIndex = Math.max(0, carouselCurrentIndex - 1);
    } else {
        carouselCurrentIndex = Math.min(images.length - visibleImagesCount, carouselCurrentIndex + 1);
    }
    updateCarousel();
}

// Updated Functionality for Collapsible Content
document.addEventListener('DOMContentLoaded', function() {
    const collapsibleContent = document.getElementById('collapsible-content');
    const mainHeader = document.getElementById('main-header');

    // Initially show the navigation
    collapsibleContent.classList.add('show');
    mainHeader.classList.add('expanded');

    // Handle logo click to toggle collapse
    const logoToggle = document.getElementById('logo-toggle');
    logoToggle.addEventListener('click', function() {
        collapsibleContent.classList.toggle('show');
        mainHeader.classList.toggle('expanded');
    });

    // Close the menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInside = mainHeader.contains(event.target);

        if (!isClickInside && collapsibleContent.classList.contains('show')) {
            collapsibleContent.classList.remove('show');
            mainHeader.classList.remove('expanded');
        }
    });

    // Collapse the content on smaller screens
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            collapsibleContent.classList.remove('show');
            mainHeader.classList.remove('expanded');
        }
    });

    // Trigger the resize event on page load to apply the collapse
    window.dispatchEvent(new Event('resize'));

    // Initial setup
    document.querySelector('.tab[data-series="portraits"]').classList.add('active');
    fetchImages('portraits');
});

// Event listeners
window.addEventListener('load', () => {
    updateButtonSizes();
    updateCarouselLayout();
});
window.addEventListener('resize', () => {
    updateButtonSizes();
    updateCarouselLayout();
});

carouselPrev.addEventListener('click', () => moveCarousel('prev'));
carouselNext.addEventListener('click', () => moveCarousel('next'));
toggleButton.addEventListener('click', toggleCarousel);

photoElement.addEventListener('error', () => {
    console.error('Failed to load image:', photoElement.src);
    photoElement.src = '/images/1.jpg'; // Fallback image
});
