var canvasWidth = 800;
var canvasHeight = 500;
var client;
var number;
var start=false;

function setup() {
  createCanvas(canvasWidth, canvasHeight);

  ball = new Ball();

  player1 = new Player(
    10,
    0
  );
  player2 = new Player(
    765,
    255
  );
  
  client = mqtt.connect(

    "wss://public:public@public.cloud.shiftr.io",

    {

      clientId: "ponggame",

    }

  );

  



  client.on("connect", function () {

    console.log("connected!");

    client.subscribe("/idseplayer1");
    client.subscribe("/idseplayer2");

   });



  client.on("message", function (topic, message) {
    number = parseInt(message);

  });

  textSize(20);
  fill(255,255,255);
}

function draw() {
  client.publish("ponggame","on");
  if(start){
    
    background(220);
    if (Math.abs(number)==1){
      player1.move(-number);
    }else if(Math.abs(number)==2){
      player2.move(-number/2);
    }
    player1.draw();
    player2.draw();
    ball.move();
    ball.detectCollisions();
    ball.draw();
    fill(0,0,0);
    text("Player 1: " + player1.score,20,20);
    text("Player 2: " + player2.score,680,20);
  }else{
    fill(0,0,0);
    text("Press Space to start",canvasWidth/2,canvasHeight/2);
  }
  if (keyCode===32) start=true;
}

function restart(){
  ball = new Ball();
  player1.restart();
  player2.restart();
}

class Player {
  constructor(x, colourValue) {
    this.x = x;
    this.y = 200;
    this.playerWidth = 25;
    this.playerHeight = 100;
    this.colourValue = colourValue;
    this.score = 0;
  }
  move(inputY) {
    this.y += 5*inputY;
    
    if(this.y<0){
      this.y=0;
    }
    else if(this.y+this.playerHeight>canvasHeight){
      this.y=canvasHeight-this.playerHeight;
    }
  }
  draw() {
    fill(this.colourValue);
    rect(this.x, this.y, this.playerWidth, this.playerHeight);
  }
  restart(){
    this.y=150;
  }
}

class Ball {
  constructor() {
    this.x = canvasWidth/2;
    this.y = canvasHeight/2;
    var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    this.dX = plusOrMinus * (Math.random()*(0.75-0.55)+0.55);
    plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    this.dY = plusOrMinus * (1-Math.abs(this.dX));
    this.radius = 12.5;
    this.speed = 5;
  }
  detectCollisions(){
    if (this.y-this.radius<=0 || this.y+this.radius>=canvasHeight){
      this.dY*=-1;
    }else if (this.x-this.radius<=player1.x+player1.playerWidth&&this.x-this.radius>=player1.x){
      if(this.y>=player1.y && this.y<=player1.y+player1.playerHeight){
        this.dX=Math.abs(this.dX);
      }else if(this.y+this.radius>=player1.y&&player1.y-this.y>=0){
        this.dX=Math.abs(this.dX);
        if (this.dY>0) this.dY*=-1;
      }else if(this.y-this.radius<=player1.y+player1.Height&&this.y-player1.y+player1.Height>=0){
        this.dX=Math.abs(this.dX);
        this.dY=Math.abs(this.dY);
      }
    }else if (this.x+this.radius>=player2.x&&this.x+this.radius<=player2.x+player2.playerWidth){
      if(this.y>=player2.y && this.y<=player2.y+player2.playerHeight){
        if (this.dX>0) this.dX*=-1;
      }else if(this.y+this.radius>=player2.y&&player2.y-this.y>=0){
        if (this.dX>0) this.dX*=-1;
        if (this.dY>0) this.dY*=-1;
      }else if(this.y-this.radius<=player2.y+player2.Height&&this.y-player2.y+player2.Height>=0){
        if (this.dX>0) this.dX*=-1;
        this.dY=Math.abs(this.dY);
      }
    } else if (this.x-this.radius<=0){
      player2.score++;
      restart();
    }else if (this.x+this.radius>=canvasWidth){
      player1.score++;
      restart();
    }
        
  }
  move() {
    this.x+=this.dX*this.speed;
    this.y+=this.dY*this.speed;
  }
  draw() {
    fill(200);
    circle(this.x, this.y, this.radius*2);
  }
}
