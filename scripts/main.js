const fileInput = document.querySelector('#file');
const uploadArea = document.querySelector('.upload-area');
const previewArea = document.querySelector('.preview-area');
const images = document.querySelectorAll('.preview-area .images .image');
const sizeSlider = document.querySelector('#size-slider')
const saveButton = document.querySelector('#save-btn');
const resetButton = document.querySelector('#reset-btn');
const swapButton = document.querySelector('#swap-btn');

let focusedImage = null;
let firstPosition = null;

/**
 * Event listeners
 */
uploadArea.addEventListener("dragenter", dragenter, false);
uploadArea.addEventListener("dragover", dragover, false);
uploadArea.addEventListener("dragleave", dragleave, false);
uploadArea.addEventListener("drop", drop, false);

fileInput.addEventListener('change', onFileChange);
sizeSlider.addEventListener('input', setImageSize);

images.forEach((image) => image.addEventListener('click', setFocusedImage));
images.forEach((image) => image.addEventListener('dragstart', setInitialPosition, false));
images.forEach((image) => image.addEventListener('drag', setImagePosition, false));
images.forEach((image) => image.addEventListener('dragend', resetPositionVal, false));

previewArea.addEventListener("dragover", function(event) {
  event.preventDefault();
});

saveButton.addEventListener('click', saveImage);
resetButton.addEventListener('click', init);
swapButton.addEventListener('click', swapImages);

function swapImages(event) {
  const imageOneSrc = images[0].style['background-image'];
  const imageTwoSrc = images[1].style['background-image'];

  images[0].style['background-image'] = imageTwoSrc;
  images[1].style['background-image'] = imageOneSrc;
}

/**
 * ========== FILE DRAG/DROP
 */

function dragenter(event) {
  event.stopPropagation();
  event.preventDefault();

  uploadArea.classList.add('drag-enter');
}

function dragover(event) {
  event.stopPropagation();
  event.preventDefault();
}

function dragleave(event) {
  event.stopPropagation();
  event.preventDefault();

  uploadArea.classList.remove('drag-enter');
}

function drop(event) {
  event.stopPropagation();
  event.preventDefault();

  var dt = event.dataTransfer;
  var files = dt.files;

  onFileChange({ target: { files }});
  uploadArea.classList.remove('drag-enter');
}

/**
 * 
 * @param {Object} event - JS event object
 */
function onFileChange(event) {
  const files = Array.from(event.target.files)
    .slice(0, 2)
    .sort((a, b) => {
      if(a.name < b.name) return -1;
      if(a.name > b.name) return 1;
      return 0;
    });

  if (files.length < 2) {
    console.error('Not enough images!');
    return;
  }

  uploadArea.classList.add('hidden');
  previewArea.classList.remove('hidden');

  files.forEach((file, index) => {
    images[index].style['background-image'] = `url(${URL.createObjectURL(file)}`;
  });
}

function init() {
  focusedImage = null;
  fileInput.value = '';
  sizeSlider.value = 200;
  sizeSlider.setAttribute('disabled', true);
  uploadArea.classList.remove('hidden');
  previewArea.classList.add('hidden');
  resetImages();
}

function resetImages() {
  images.forEach((image) => {
    image.style['background-size'] = '';
    image.style['background-position'] = '';
    image.classList.remove('blurred');
  });
}

function setImageSize(event) {
  if (!focusedImage) { return; }

  images[focusedImage].style['background-size'] = `${event.target.value}%`;
}

/**
 * ========== IMAGE DRAG/DROP ==========
 */

function setInitialPosition(event) {
  const { pageX, pageY } = event;

  var clone = this.cloneNode(true);
  clone.style.opacity = 0.1;
  document.body.appendChild(clone);
  event.dataTransfer.setDragImage(clone, 0, 0);

  firstPosition = { pageX, pageY };
}

function setImagePosition(event) {
  const { pageX, pageY } = event;
  let currentPosition = '0px 0px';

  const distance = {
    x: pageX - firstPosition.pageX,
    y: pageY - firstPosition.pageY,
  };

  if (event.target.style['background-position'] === '') {
    currentPosition = window.getComputedStyle(event.target).getPropertyValue('background-position').split(' ');
  } else {
    currentPosition = event.target.style['background-position'].split(' ');
  }

  event.target.style['background-position'] = `${parseInt(currentPosition[0]) + distance.x}px ${parseInt(currentPosition[1]) + distance.y}px`;
  firstPosition = { pageX, pageY };
}

function resetPositionVal(event) {
  firstPosition = null;

  document.body.removeChild(document.querySelector('body > .image'));
}

function setFocusedImage(event) {
  if (focusedImage === event.target.id) {
    focusedImage = null;
    sizeSlider.setAttribute('disabled', true);
    
    images.forEach((imageDOM) => {
      imageDOM.classList.remove('blurred');
    });
  } else {
    focusedImage = event.target.id;
    sizeSlider.removeAttribute('disabled');
    sizeSlider.value = parseInt(images[focusedImage].style['background-size']);
    
    images.forEach((imageDOM) => {
      imageDOM.classList.add('blurred');
    });

    event.target.classList.remove('blurred');
  }
}

function downloadURI(uri, name) {
  const link = document.createElement('a');
  
  link.download = name;
  link.href = uri;
  
  document.body.appendChild(link);
  
  link.click();
 
  document.body.removeChild(link);
}

function saveImage() {
  const container = document.querySelector('.preview-area .images');

  html2canvas(container).then(canvas => {
    const myImage = canvas.toDataURL('image/jpeg');
    const seconds = new Date().getSeconds();
    
    downloadURI("data:" + myImage, `image_${seconds}.jpeg`);
  });
}