import p5 from 'p5';
import '../css/style.scss';
import google from '../assets/footsteps.json';
import regeneratorRuntime from 'regenerator-runtime';

const sketch = (p) => {
  let canvas;
  let roboto;
  let fit;
  let tripsCoords;
  let maxx,
    minx,
    maxy,
    miny,
    steps,
    maxsteps,
    distance,
    maxdist,
    maxtime,
    maxcal;
  let background;
  let pallete;
  let randoms;
  let prev;
  let limits;
  let go = false;

  p.preload = async () => {
    roboto = p.loadFont('assets/roboto-mono-v13-latin-regular.ttf');
    fit = google.data;
    tripsCoords = [];
    fit.forEach((element) => {
      let trip = {};

      if (
        element['Step count'] !== '' &&
        element['Step count'] > 20 &&
        element['High latitude (deg)'] !== '' &&
        element['High latitude (deg)'] < -34.45103073120117 &&
        element['Low longitude (deg)'] !== '' &&
        element['Low longitude (deg)'] > -58.527015686035156 &&
        element['Low latitude (deg)'] !== '' &&
        element['Low latitude (deg)'] >= -34.605261 &&
        element['High longitude (deg)'] !== '' &&
        element['High longitude (deg)'] <= -58.418612
      ) {
        trip.top = element['High latitude (deg)'];
        trip.left = element['Low longitude (deg)'];
        trip.bottom = element['Low latitude (deg)'];
        trip.right = element['High longitude (deg)'];
        trip.steps = element['Step count'];
        trip.distance = element['Distance (m)'];
        trip.time = element['Move Minutes count'];
        trip.calories = element['Calories (kcal)'];
        tripsCoords.push(trip);
      }
    });

    maxy = Math.max(...arrayColumn(tripsCoords, 'top'));
    miny = Math.min(...arrayColumn(tripsCoords, 'bottom'));
    maxx = Math.min(...arrayColumn(tripsCoords, 'left'));
    minx = Math.max(...arrayColumn(tripsCoords, 'right'));

    maxsteps = Math.max(...arrayColumn(tripsCoords, 'steps'));
    maxtime = Math.max(...arrayColumn(tripsCoords, 'time'));
    maxdist = Math.max(...arrayColumn(tripsCoords, 'distance'));
    maxcal = Math.max(...arrayColumn(tripsCoords, 'calories'));

    steps = arrayColumn(tripsCoords, 'steps').reduce((a, b) => a + b, 0);
    distance = arrayColumn(tripsCoords, 'distance').reduce((a, b) => a + b, 0);

    await spawn();
  };

  p.setup = () => {
    canvas = p.createCanvas(p.windowWidth, p.windowHeight);
    p.frameRate(60);
    p.textFont(roboto);
    p.textSize(12);
    p.background(0);
  };

  p.draw = () => {
    if (go) {
      plotStacked();
    }
  };

  let value;

  async function spawn() {
    value = cryptoColor();
    background = await complement(value);
    pallete = await createPallete(value);
    randoms = await randomNumbers();
    prev = randoms.shift();
    shuffleArray(tripsCoords);
    count = 0;
    id = 0;
    go = true;
    // if (canvas && yes()) p.background(0);
  }

  const arrayColumn = (arr, n) => arr.map((x) => x[n]);
  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }

  let id = 0;
  let count = 0;

  function plotStacked() {
    p.rectMode(p.CORNER);

    if (id >= tripsCoords.length) {
      go = false;
      setTimeout(spawn, 3000);
      return;
    }

    let element = tripsCoords[id];

    printData(element, id);

    if (!element) {
      id++;
      return;
    }
    let distance = p.map(element.distance, 0, maxdist, 0, 1);
    let steps = p.map(element.steps, 0, maxsteps, 0, 1);
    let time = p.map(element.time, 0, maxtime, 0, 1);
    let calories = p.map(element.calories, 0, maxcal, 0, 1);

    let total = distance + steps + time + calories;

    let left = p.windowWidth * 0.25;


    p.translate(left, 12);

    let w = (p.windowWidth * 0.5) / 8;
    let h = (p.windowHeight - 12) / 31;

    
    let row = Math.floor(id / 8);
    let col = id % 8;

    let w1 = p.map(distance, 0, total, 0, w);

    let x = col * w;

    let c = toColor('t');
    let alpha = 127;
    c.setAlpha(alpha);
    p.fill(c);
    if (yes()) p.rect(x, row * h, w1, h);

    x += w1;

    let w2 = p.map(steps, 0, total, 0, w);

    c = toColor('b');
    c.setAlpha(alpha);
    p.fill(c);
    if (yes()) {
      p.rect(x, row * h, w2, h);
    } else {
      p.fill(0);
      p.rect(x, row * h, w2, h);
    }
    x += w2;

    let w3 = p.map(time, 0, total, 0, w);

    c = toColor('l');
    c.setAlpha(alpha);
    p.fill(c);
    if (yes()) {
      p.rect(x, row * h, w2, h);
    } else {
      p.fill(0);
      p.rect(x, row * h, w2, h);
    }
    x += w3;

    let w4 = p.map(calories, 0, total, 0, w);

    c = toColor('l');
    c.setAlpha(alpha);
    p.fill(c);
    if (yes()) {
      p.rect(x, row * h, w2, h);
    } else {
      p.fill(0);
      p.rect(x, row * h, w2, h);
    }

    id++;
  }

  function printData(row, id) {
    p.noStroke();
    p.fill(0);
    p.rect(0, 0, p.width, 13);
    p.fill('#FFF');
    if (!row) return;
    p.text(
      id +
        ' ' +
        row.steps +
        ' ' +
        row.distance +
        ' ' +
        row.time +
        ' ' +
        row.calories,
      p.windowWidth * 0.25,
      12
    );
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(0);
  };

  p.keyPressed = () => {};

  p.mousePressed = toggleFullScreen;

  function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen =
      docEl.requestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen;
    var cancelFullScreen =
      doc.exitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.webkitExitFullscreen ||
      doc.msExitFullscreen;

    if (
      !doc.fullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.msFullscreenElement
    ) {
      requestFullScreen.call(docEl);
    } else {
      cancelFullScreen.call(doc);
    }

    if (!document.fullscreenElement) {
      p.noCursor();
    } else {
      p.cursor(p.ARROW);
    }
  }

  function random() {
    randoms.push(prev);
    prev = randoms.shift();
    let result = p.map(prev, 0, 255, 0.0, 1.0);

    return result;
  }
  function toColor(polymer) {
    return pallete[polymer];
  }

  function cryptoColor() {
    var letters = '0123456789ABCDEF';
    var color = '';
    let array = new Uint8Array(6);
    window.crypto.getRandomValues(array);
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(array[i] / 16)];
    }
    console.log(color);
    return color;
  }

  async function createPallete(value) {
    // monochrome, monochrome-dark, monochrome-light, analogic, complement, analogic-complement, triad and quad.
    let url =
      'https://www.thecolorapi.com/scheme?hex=' +
      value +
      '&mode=analogic&count=4&format=json';
    let pallete = {};
    
    await p.httpGet(url, 'json', false, function (response) {
      console.log(response);
      pallete['t'] = p.color(
        response.colors[0].rgb.r,
        response.colors[0].rgb.g,
        response.colors[0].rgb.b
      );
      pallete['b'] = p.color(
        response.colors[1].rgb.r,
        response.colors[1].rgb.g,
        response.colors[1].rgb.b
      );
      pallete['l'] = p.color(
        response.colors[2].rgb.r,
        response.colors[2].rgb.g,
        response.colors[2].rgb.b
      );
      pallete['r'] = p.color(
        response.colors[3].rgb.r,
        response.colors[3].rgb.g,
        response.colors[3].rgb.b
      );
      
    });

    return pallete;
  }

  async function complement(value) {
    let url =
      'https://www.thecolorapi.com/scheme?hex=' +
      value +
      '&mode=complement&count=1&format=json';
    let background;
    await p.httpGet(url, 'json', false, function (response) {
      background = p.color(
        response.colors[0].rgb.r,
        response.colors[0].rgb.g,
        response.colors[0].rgb.b
      );
      
    });
    return background;
  }
  async function randomNumbers() {
    let qty = 512;
    let url =
      'https://qrng.anu.edu.au/API/jsonI.php?length=' + qty + '&type=uint8';
    let r;
    await await p.httpGet(url, 'json', false, function (response) {
      console.log(response);
      r = response.data;
    });

    return r;
  }

  let bit = 0;

  function yes() {
    if (bit == 7) {
      randoms.push(prev);
      prev = randoms.shift();
      bit = 0;
    }
    let result = (prev >> bit) & 1;
    bit++;
    return result;
  }
};

new p5(sketch);
