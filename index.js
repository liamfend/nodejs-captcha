"use strict";
const { createCanvas ,registerFont} = require("canvas");
const path = require('path')
registerFont(path.join(__dirname,'./fonts/OpenSans-Italic.ttf'), { family: 'OpenSans' })
/**
 * There is a single object parameter as an input to the function
 * Here is the list of available parameters, all of them optional
 * -- charset {arr} list of characters to generate captcha from
 * -- length {number} length of the captcha
 * -- value {String} value of the captcha
 */
const PER_CHAR_WIDTH = 40;
const MIN_HEIGHT = 40;
const DEFAULT_HEIGHT = 100;
const DEFAULT_WIDTH = 200;
const DEFAULT_LENGTH = 6;
const DEFAULT_MIN_CIRCLE = 10;
const DEFAULT_MAX_CIRCLE = 25;
 

module.exports = p => {
  const params = Object.assign({}, p);
  if (params.charset === undefined) {
    params.charset = "1234567890abcdefghijklmnoprstuvyz".split("");
  }
  if (params.length === undefined) {
    params.length = DEFAULT_LENGTH;
  } else if (params.length < 1) {
    throw new Error("Parameter Length is less then 1");
  }
  params.rnStr = {
    value:'',
    indexs:[]
  };
  
  if (params.value === undefined) {
    params.value = ""; 
    
    const len = params.charset.length;
    for (let i = 0; i < params.length; i++) {
      params.value += params.charset[Math.floor(Math.random() * len)];
    }

    let lastValues = params.value.split('');
     
    for(let i =0 ; i< params.value.length*2;i++){
      
      if (lastValues.length >= params.value.length*2 - i  ) {
        params.rnStr.value += lastValues.join('');
        for(let j =0;j< lastValues.length;j++){
          params.rnStr.indexs.push(i+j);
        }
        break;
      }
    
      if (Math.floor(Math.random()*100) % 2 === 0&&lastValues.length>0) {
        params.rnStr.value += lastValues.shift();
        params.rnStr.indexs.push(i);
      } else {
        params.rnStr.value +=  params.charset[Math.floor(Math.random() * len)];
      }
    }
     
  }

  if (params.length !== params.value.length) {
    throw new Error(
      "Parameter Length and Parameter Value Length is inconsistent"
    );
  }
  if (params.width === undefined) {
    params.width = Math.min(DEFAULT_WIDTH, params.length * PER_CHAR_WIDTH);
  } else if (params.width / params.length < PER_CHAR_WIDTH) {
    throw new Error("Width per char should be more than " + PER_CHAR_WIDTH);
  }

  if (params.height === undefined) {
    params.height = DEFAULT_HEIGHT;
  } else if (params.height < MIN_HEIGHT) {
    throw new Error("Min Height is " + PER_CHAR_WIDTH);
  }
  if(params.numberOfCircles === undefined){
    params.numberOfCircles = DEFAULT_MIN_CIRCLE + (Math.random() * (DEFAULT_MAX_CIRCLE - DEFAULT_MIN_CIRCLE)) 
  }

  params.image =  drawImage(params);
  params.imageBuffer = drawImageBuffer(params);
  return {
    value: params.value,
    width: params.width,
    height: params.height,
    image: params.image,
    imageBuffer: params.imageBuffer
  };
};

function drawImageBuffer(params) {
  const { width, height, length, value } = params;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  fillBackground(ctx, params);
 
  printText(ctx, params);
  // addCircles(ctx,params);
  
  return canvas.toBuffer("image/png");
}

function drawImage(params) {
  const { width, height, length, value } = params;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  fillBackground(ctx, params);
  printText(ctx, params);
  // addCircles(ctx,params);

  return canvas.toDataURL('image/jpeg', 0.6);

}

function fillBackground(ctx, params) {
  var gradient = ctx.createLinearGradient(0, 0, params.width, params.height);

  for (let i = 0; i < 10; i++) {
    gradient.addColorStop(Math.random() * 0.1 + i * 0.1, randomLightColor(5));
  }
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, params.width, params.height);
}



function printText(ctx, params) {
  
  let height = params.height;
  let colors = [{
    zh:'黄色',
    en:'Yellow',
    c:'#FFFF00',

  },{
    zh:'蓝色',
    en:'Blue',
    c:'#4169E1'
  },
  {
    zh:'红色',
    en:'Red',
    c:'#FF0000'
  },
  {
    zh:'绿色',
    en:'Green',
    c:'#008000' },
    {
      zh:'紫色',
      en:'Purple',
      c:'#800080' }
  
  ]
  let value = params.rnStr.value;
  let width = (params.width - 10) / value.length;
  let mainColor = colors[randomNumber(colors.length-1)] 
 
  for (let i = 0; i < params.rnStr.value.length; i++) {
    // Font Size
    // let fontSize = Math.random() *10+ 24;
    let fontSize = Math.random() *10+ 14;
    ctx.font = fontSize + 'px "OpenSans"';

    // Font Color
    ctx.fillStyle = randomDarkColor(4)
    let isLine1 = i  < params.rnStr.value.length/2
     if(params.rnStr.indexs.indexOf(i)>=0){
      ctx.fillStyle = mainColor.c
     }
    // ctx.fillText(value.charAt(i), 5 + width * (isLine1?i:(i-4)),isLine1? 50:70 );   
    ctx.fillText(value.charAt(i), 5 + width * i,60);   
  }
  
  ctx.font = '14px "OpenSans"';
  //Please enter blue characters
  ctx.fillStyle = randomDarkColor(4)
  ctx.fillText("Enter those in  ",0,20);
  ctx.fillStyle = mainColor.c
  ctx.fillText(mainColor.en,90,20);
  ctx.fillStyle = randomDarkColor(4)
  ctx.fillText(" ↓",135,20);
  //Enter those in 
}
function addCircles(ctx, params){
  let i = 0;

  // Dark Circles
  while(i < params.numberOfCircles ){
    i++;
    ctx.beginPath();

    // Radius
    const radius = 10 * Math.random() + 5;

    // Center
    const centerX = params.width * Math.random();
    const centerY = params.height * Math.random();

    // Color
    ctx.strokeStyle = randomDarkColor(10);

    // Width
    ctx.lineWidth = 1 * Math.random();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * (1.5+Math.random()*0.5), false);
    ctx.stroke();
  }

  
}
function randomLightHex(amount = 4) {
  return (16 - Math.floor(Math.random() * amount + 1)).toString(16);
}
function randomDarkHex(amount = 4) {
  return Math.floor(Math.random() * amount + 1).toString(16);
}
function randomLightColor(amount) {
  return "#" + randomLightHex(amount) + randomLightHex(amount) + randomLightHex(amount);
}
function randomDarkColor(amount) {
  return (
    "#" + randomDarkHex(amount) + randomDarkHex(amount) + randomDarkHex(amount)
  );
}
function randomNumber(maxNumber){
  return Math.floor(Math.random() * maxNumber + 1)
}