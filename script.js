/** @type {HTMLCanvasElement} */
window.alert("Click on the Ravens to kill them\n If they reach the end of screen them Game is Over \n Ravens with Trails carry more points");
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const collisionCanvas = document.getElementById("collisionCanvas");
const collisionCtx = collisionCanvas.getContext('2d');

collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let ravens = [];
let timeToNextRaven = 0;
let ravenInterval = 500;
let lastTime = 0;
let score = 0;
ctx.font = "10vh Impact";
let gameover = false;
class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.height = this.spriteHeight * this.sizeModifier;
        this.width = this.spriteWidth * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = "raven.png";
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.color = 'rgb(' + this.randomColors[0] + ',' + this.randomColors[1] + ',' + this.randomColors[2] + ')';
        this.hasTrail=Math.random()>0.5;
    }
    update(deltaTime) {
        if (this.y < 0 || this.y + this.height > canvas.height) this.directionY = this.directionY * -1;

        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) {
            this.markedForDeletion = true;

        }
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) {
                this.frame = 0;
            }
            this.frame++;

            this.timeSinceFlap = 0;
            if(this.hasTrail) 
            {
                for( let i=0;i<5;i++){
                    parcticles.push(new particle(this.x,this.y,this.width,this.color));
                }
            }
           
        }
        if (this.x < 0 - this.width) gameover = true;
    }

    draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

let explosions = [];

class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = "boom.png";
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.sound = new Audio();
        this.sound.src = "explode.wav";
        this.frame = 0;
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
    }

    update(deltaTime) {
        if (this.frame == 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) {
                this.markedForDeletion = true;
            }
        }


    }

    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteWidth, this.x, this.y - this.size / 4, this.size, this.size);
    }
}


let parcticles = [];

class particle {
    constructor(x, y, size, color) {
        this.size = size;
        this.x = x+size/2+Math.random()*50-25;
        this.y = y+size/3+Math.random()*50-25;
       
        this.color = color;
        this.radius = Math.random() * this.size/10;
        this.maxRadius = Math.random() * 20 + 20;
        this.markedForDeletion = false;
        this.speedX=Math.random()*1+0.5;

    }

    update(){
        this.x+=this.speedX;
        this.radius+=0.3;
        if(this.radius>this.maxRadius-5){
            this.markedForDeletion=true;
        }
    }
    draw(){
        ctx.save();
        ctx.globalAlpha=1-this.radius/this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle=this.color;
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2);
        ctx.fill();
        ctx.restore();    }
}


function drawScore() {
    ctx.fillStyle = 'black';
    ctx.fillText('score: ' + score, 50, 75);
    ctx.fillStyle = 'white';
    ctx.fillText('score: ' + score, 55, 80);
}

function gameOver() {
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillText('Game Over, your Score is: ' + score, canvas.width / 2, canvas.height / 2);
    ctx.fillStyle = 'white';
    ctx.fillText('Game Over, your Score is: ' + score, canvas.width / 2 + 5, canvas.height / 2 + 5);

}


window.addEventListener('load',function(){
window.addEventListener("click", function (e) {
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);

    const pc = detectPixelColor.data;

    ravens.forEach(object => {

        if (object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]) {
            object.markedForDeletion = true;
            explosions.push(new Explosion(object.x, object.y, object.width));
            if(object.hasTrail){
                score+=Math.floor(Math.random()*4+1);
            }else{
                score++;
            }
            
        }


    });

});



function animate(timeStamp) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height);

    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    timeToNextRaven += deltaTime;
    if (timeToNextRaven > ravenInterval) {
        timeToNextRaven = 0;
        ravens.push(new Raven());
        ravens.sort(function (a, b) {
            return a.width - b.width;
        });
    }
    drawScore();
    [...parcticles,...ravens, ...explosions].forEach(Object => Object.update(deltaTime));
    [...parcticles,...ravens, ...explosions].forEach(Object => Object.draw());
    ravens = ravens.filter(Object => !Object.markedForDeletion);
    explosions = explosions.filter(Object => !Object.markedForDeletion);
    parcticles = parcticles.filter(Object => !Object.markedForDeletion);
    if (!gameover) requestAnimationFrame(animate);
    else {
        gameOver();
    }

}

animate(0);

});
