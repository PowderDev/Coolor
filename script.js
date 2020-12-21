const colorDivs = document.querySelectorAll('.color'),
      generateBtn = document.querySelector('.generate'),
      sliders = document.querySelectorAll('input[type="range"]'),
      currentHexes = document.querySelectorAll('.color h2'),
      copyCont = document.querySelector('.copy-container'),
      adjustBtns = document.querySelectorAll('.adjust'),
      closeAdjusts = document.querySelectorAll('.close-adjustment'),
      sliderContainers = document.querySelectorAll('.sliders'),
      lockBtns = document.querySelectorAll('.lock');

let initialColors;
let savedPalettes = [];

sliders.forEach(slider =>{
    slider.addEventListener('input', hslControls);
})

colorDivs.forEach((div, index) =>{
    div.addEventListener('input', () =>{
        updateTextUI(index)
    });
});

currentHexes.forEach(hex =>{
    hex.addEventListener('click', () =>{
        copyToClipboard(hex);
    })
});

copyCont.addEventListener('transitionend', () =>{
    const popup = copyCont.children[0];
    copyCont.classList.remove('active');
    popup.classList.remove('active');
})

adjustBtns.forEach((btn, index) =>{
    btn.addEventListener('click', () =>{
        openAdjustmentPanel(index);
    })
})

closeAdjusts.forEach((btn, index) =>{
    btn.addEventListener('click', () =>{
    closeAdjustmentPanel(index);
    })
})

generateBtn.addEventListener('click', randomColors);

lockBtns.forEach((btn, index) =>{
    btn.addEventListener('click', (e) =>{
        lockLayer(e, index);
    })
})

function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

function generateHex(){

    const hexColor = chroma.random();
    return hexColor;

    // const letters = '0123456789ABCDEF';
    // let hash = '#';

    // for(let i = 0; i < 6; i++){
    //     hash += letters[Math.floor(Math.random() * 16)];
    // }
    // return hash
}

function randomColors(){
    initialColors = []
    colorDivs.forEach((div, i) =>{
        const hexText = div.children[0];
        const randomColor = generateHex();

        if(div.classList.contains('locked')){
            initialColors.push(hexText.innerHTML);
            return;
        }else{
            initialColors.push(chroma(randomColor).hex());
        }



        div.style.background = randomColor;
        hexText.innerHTML = randomColor;

        checkTextContrast(randomColor, hexText);

        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    });

    resetInputs();

    adjustBtns.forEach((btn, index) =>{
        checkTextContrast(initialColors[index], btn);
        checkTextContrast(initialColors[index], lockBtns[index]);
    })

}

function checkTextContrast(color, text){
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = 'black'
    }else{
        text.style.color = 'white'
    }
}


function colorizeSliders(color, hue, brightness, saturation){
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    const midBright =color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, 'white']);


    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;}



function hslControls(e){
    const index = e.target.getAttribute('data-bright') || e.target.getAttribute('data-sat') || e.target.getAttribute('data-hue');


   
    let sliders = e.target.parentNode.querySelectorAll('input[type="range"]');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];
    //colorDivs[index].querySelector('h2').innerHTML; из-за него лагает Brightness 

    let color = chroma(bgColor)
    .set('hsl.s', saturation.value)
    .set('hsl.h', hue.value)
    .set('hsl.l', brightness.value);

    colorDivs[index].style.backgroundColor = color;

    colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index){
    const activeDiv = colorDivs[index]
    const color =chroma(activeDiv.style.background);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');

    textHex.innerHTML = color.hex();

    checkTextContrast(color,textHex);
    for(icon of icons){
        checkTextContrast(color, icon)
    }
}

function resetInputs(){
    const sliders = document.querySelectorAll('.sliders input');
    
    sliders.forEach(slider =>{
        if(slider.name === 'hue'){
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];

            slider.value = Math.floor(hueValue);
        }
        if(slider.name === 'brightness'){
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const btightValue = chroma(brightColor).hsl()[1];

            slider.value = Math.floor(btightValue * 100) / 100;
        }
        if(slider.name === 'saturation'){
            const saturationColor = initialColors[slider.getAttribute('data-sat')];
            const saturationValue = chroma(saturationColor).hsl()[2];

            slider.value = Math.floor(saturationValue * 100) / 100;
        }
    })
}

function copyToClipboard(hex){
    const el = document.createElement('textarea');
    el.value = hex.innerHTML;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    const popup = copyCont.children[0];
    copyCont.classList.add('active');
    popup.classList.add('active');
}

function openAdjustmentPanel(index){
    sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index){
    sliderContainers[index].classList.remove('active');
}


const saveBtn = document.querySelector('.save'),
      submitSave = document.querySelector('.submit-save'),
      closeSave = document.querySelector('.close-save'),
      saveContainer = document.querySelector('.save-container'),
      saveInput = document.querySelector('.save-container input'),
      libraryContainer = document.querySelector('.library-container'),
      libraryBtn = document.querySelector('.library'),
      closeLibraryBtn = document.querySelector('.close-library');


saveBtn.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);


function openPalette(){
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}
function closePalette(){
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}
function savePalette(e) {
  closePalette();
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach(hex => {
    colors.push(hex.innerText);
  });

  let paletteNr;
  const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
  if(paletteObjects){
      paletteNr = paletteObjects.length
  }else{
      paletteNr = savedPalettes.length
  }

  const paletteObj = {name, colors, nr:paletteNr};
  savedPalettes.push(paletteObj);

  saveToLocal(paletteObj);
  saveInput.value = '';

  const palette = document.createElement('div')
  palette.classList.add('custom-palette');
  const title = document.createElement('h4');
  title.innerHTML = paletteObj.name;
  const preview = document.createElement('div');
  preview.classList.add('small-preview');

  paletteObj.colors.forEach(smallColor =>{
    const smallDiv = document.createElement('div');
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });

  const paletteBtn = document.createElement('button');
  paletteBtn.classList.add('palette-button');
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerHTML = 'Select';

  paletteBtn.addEventListener('click', (e) =>{
      closeLibrary();
      const paletteIndex = e.target.classList[1];
      initialColors = [];
      savedPalettes[paletteIndex].colors.forEach((color, index) =>{
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];

          checkTextContrast(color, text);
          updateTextUI(index);
      });
      resetInputs()
  })






  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryContainer.children[0].appendChild(palette);
};

function saveToLocal(paletteObj){
    let localPalettes;
    if(localStorage.getItem('palettes') === null){
        localPalettes = []
    }else{
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}
function openLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}
function closeLibrary(){
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}


function getLocal(){
    if(localStorage.getItem('palettes') === null){
        localPalettes = []
    }else{
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        savedPalettes = [...paletteObjects];
        paletteObjects.forEach(paletteObj =>{
            const palette = document.createElement('div')
                palette.classList.add('custom-palette');
            const title = document.createElement('h4');
                title.innerHTML = paletteObj.name;
            const preview = document.createElement('div');
                preview.classList.add('small-preview');

            paletteObj.colors.forEach(smallColor =>{
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = smallColor;
                preview.appendChild(smallDiv);
            });

            const paletteBtn = document.createElement('button');
            paletteBtn.classList.add('palette-button');
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.innerHTML = 'Select';

            paletteBtn.addEventListener('click', (e) =>{
                closeLibrary();
                const paletteIndex = e.target.classList[1];
                initialColors = [];
                savedPalettes[paletteIndex].colors.forEach((color, index) =>{
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];

                    checkTextContrast(color, text);
                    updateTextUI(index);
                });
                resetInputs()
            });


            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);
            libraryContainer.children[0].appendChild(palette);
        })
    }
}







getLocal();
randomColors();

