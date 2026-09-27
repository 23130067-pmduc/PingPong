const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

//Thanh đỡ
ctx.fillStyle = '#38bdf8';
ctx.fillRect(390,550,120,4);

//Bóng
ctx.beginPath();
ctx.arc(450,535,9,0,Math.PI*2);
ctx.fillStyle = '#ffffff';
ctx.fill;