document.addEventListener('DOMContentLoaded', () => {
    const landingPage = document.getElementById('landing-page');
    const mainApplication = document.getElementById('main-application');
    const logoFrame = document.querySelector('iframe'); // Assuming the logo is loaded in an iframe
    const image = document.querySelector('.cutout-square img');
    const leftSemiCircles = document.querySelectorAll('.semi-circle.left');
    const rightSemiCircles = document.querySelectorAll('.semi-circle.right');
    const bottomRectangle = document.querySelector('.bottom-rectangle');
    const cutoutSquare = document.querySelector('.cutout-square');
    const halfCircleLeft = document.querySelector('.half-circle.left');
    const halfCircleRight = document.querySelector('.half-circle.right');
    const circle = document.querySelector('.circle');
    const filmStrip = document.querySelector('.film-strip'); // Select the film strip element

    const fadeOutElements = () => {
        // Apply fade-out animations
        landingPage.classList.add('fade-out-background');
        if (logoFrame) {
            logoFrame.classList.add('fade-out'); // Fade out the logo frame
        }
        leftSemiCircles.forEach(element => {
            element.classList.add('fade-out-left');
        });
        rightSemiCircles.forEach(element => {
            element.classList.add('fade-out-right');
        });
        bottomRectangle.classList.add('fade-out-down');
        image.classList.add('fade-out');
        cutoutSquare.classList.add('fade-out');
        halfCircleLeft.classList.add('fade-out-half-circle-left');
        halfCircleRight.classList.add('fade-out-half-circle-right');
        circle.classList.add('fade-out-circle');
        if (filmStrip) {
            filmStrip.classList.add('fade-out-film-strip'); // Apply fade-out to the film strip
        }

        // Show the main application after the animation completes
        setTimeout(() => {
            // Ensure all elements from the splash screen are removed
            if (logoFrame) {
                logoFrame.remove(); // Removes the iframe from the DOM
            }
            if (filmStrip) {
                filmStrip.remove(); // Removes the film strip from the DOM
            }
            landingPage.remove(); // Removes the entire splash page from the DOM
            console.log('Splash screen removed from DOM');
            mainApplication.style.display = 'block';
            mainApplication.classList.add('fade-in');
        }, 1500); // Match the fade-out duration
    };

    // Attach event listeners for click events to trigger the fade out
    image.addEventListener('click', fadeOutElements);
    cutoutSquare.addEventListener('click', fadeOutElements);
    halfCircleLeft.addEventListener('click', fadeOutElements);
    halfCircleRight.addEventListener('click', fadeOutElements);
    circle.addEventListener('click', fadeOutElements);
});
