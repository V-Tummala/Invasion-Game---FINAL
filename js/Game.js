class Game {
    constructor() 
    {
      this.resetTitle = createElement("h2");
      this.resetButton = createButton("");
  
      this.leadeboardTitle = createElement("h2");
  
      this.leader1 = createElement("h2");
      this.leader2 = createElement("h2");
  
      this.playerMoving = false;
  
      this.lasersGroup = new Group();
      this.laserImage = loadImage("assets/laser.png");

      this.asteroidsGroup = new Group();
      this.asteroidImage = loadImage("assets/asteroid.png"); 

      this.starsGroup = new Group();
      this.starImage = loadImage("assets/star.png");

      this.fuelsGroup = new Group();
      this.fuelImage = loadImage("assets/fuel.png");
    
      this.enemyShipsGroup = new Group();
      this.enemyShipImg = loadImage("assets/enemyShip.png");

      this.missilesGroup = new Group();
      this.missileImage = loadImage("assets/missile.png");

      this.planetImage = loadImage("assets/planet.png");

      this.backgroundY = 0;
  
      this.speed = 3;

      this.laserActive = false;
      this.playerMoving = false;
      this.leftKeyActive = false;
      this.planetsLeft = 1;
    }
  
      getState() 
      {
        var gameStateRef = database.ref("gameState");
        gameStateRef.on("value", function(data) 
                        {
                          gameState = data.val();
                        });
      }
  
      update(state) 
      {
        database.ref("/").update({
          gameState: state
        });
      }
  
      start() 
      {
        player = new Player();
        playerCount = player.getCount();
    
        form = new Form();
        form.display();
    
        rocket1 = createSprite(width / 2 - 50, height-50);
        rocket1.addImage("rocket1", rocket1Image);
        rocket1.scale = 0.2;
        rocket1.visible = false;
        
    
        rocket2 = createSprite(width / 2 + 100, height-50);
        rocket2.addImage("rocket2", rocket2Image);
        rocket2.scale = 0.2;
        rocket2.visible = false;

        rocket1.setCollider("rectangle", 0, 0, rocket1.width, rocket1.height);
        rocket2.setCollider("rectangle", 0, 0, rocket2.width, rocket2.height);
    
        rockets = [rocket1, rocket2];
    
      }
    
  
      handleElements() 
      {
        form.hide();
        form.titleImg.position(20, 10);
        form.titleImg.class("gameTitleAfterEffect");
    
        this.resetButton.class("resetButton");
        this.resetButton.position(380, 10);
    
        this.leadeboardTitle.html("Leaderboard");
        this.leadeboardTitle.class("resetText");
        this.leadeboardTitle.position(width / 3 -10, 500);
    
        this.leader1.class("leadersText");
        this.leader1.position(width / 3+10 , 540);
    
        this.leader2.class("leadersText");
        this.leader2.position(width / 3 +10, 580);
      }
    
    handleResetButton() 
    {
      this.resetButton.mousePressed(() => {
        database.ref("/").set({
          playerCount: 0,
          gameState: 0,
          players: {}
        });
        window.location.reload();
      });
    }
  
    handlePlayerControls()
    {
      if (keyIsDown(LEFT_ARROW) && player.positionX > 20) 
      {
        this.leftKeyActive = true;
        player.positionX -= 5;
        player.update();
      }
  
      if (keyIsDown(RIGHT_ARROW) && player.positionX < 380) 
      {
        this.leftKeyActive = false;
        player.positionX += 5;
        player.update();
      }

      if(player.positionX < 20)
      {
        player.positionX = 20;
      }

      if(player.positionX > 380)
      {
        player.positionX = 380;
      }
    }
  
    
    showLife() 
    {
      push();
      image(lifeImage, 30, 470, 20, 20);
      fill("white");
      rect(60, 470, 100, 20);
      fill("#f50057");
      rect(60, 470, player.life, 20);
      noStroke();
      pop();
    }

    showFuelBar() 
    {
      push();
      image(fuelImage, 200, 470, 20, 20);
      fill("white");
      rect(230, 470, 100, 20);
      fill("#ffc400");
      rect(230, 470, player.fuel, 20);
      noStroke();
      pop();
    }
  
    handleStars(index) 
    {
      rockets[index - 1].overlap(this.starsGroup, function(collector, collected) {
        player.score += 20;
        player.update();
        collected.remove();
      });
    }

    handleObstacleCollision(index) 
    {
      if (rockets[index - 1].collide(this.asteroidsGroup) || rockets[index - 1].collide(this.enemyShipsGroup)) 
      {
        if (this.leftKeyActive) 
        {
          player.positionX += 100;
        } 
        else 
        {
          player.positionX -= 100;
        }
    
        // Reducing Player Life
        if (player.life > 0) 
        {
          player.life -= 20;
        }
    
        player.update();
      }
    }

    handleMissileCollision(index)
    {
      if (rockets[index - 1].collide(this.missilesGroup))
      {
        if (player.life > 0)
        {
          player.life -= 10;
        }

        for(var i = 0; i < this.missilesGroup.length; i++)
        {
          this.missilesGroup[i].destroy();
        }

        player.update();
      }
    }

    handleFuel(index) 
    {
      // Adding fuel
        rockets[index - 1].overlap(this.fuelsGroup, function(collector, collected) {
        player.fuel = 100;
        //collected is the sprite in the group collectibles that triggered
        //the event
        collected.remove();
      });
  
      // Reducing Player rocket fuel
      if (player.fuel > 0) {
        player.fuel -= 0.1;
      }
  
      if (player.fuel <= 0) {
        gameState = 2;
        this.gameOver();
      }
    }

    handleLaser()
    {
        // Check for collisions between lasers and enemy ships
      this.lasersGroup.collide(this.enemyShipsGroup, (laser, enemyShip) => {
      // Destroy both the laser and enemy ship when they collide
      laser.remove();
      enemyShip.remove();
      });
    }
  
    showLeaderboard() {
      var leader1, leader2;
      var players = Object.values(allPlayers);
      if (
        (players[0].rank === 0 && players[1].rank === 0) ||
        players[0].rank === 1
      ) {
        // &emsp;    This tag is used for displaying four spaces.
        leader1 =
          players[0].rank +
          "&emsp;" +
          players[0].name +
          "&emsp;" +
          players[0].score;
  
        leader2 =
          players[1].rank +
          "&emsp;" +
          players[1].name +
          "&emsp;" +
          players[1].score;
      }
  
      if (players[1].rank === 1) {
        leader1 =
          players[1].rank +
          "&emsp;" +
          players[1].name +
          "&emsp;" +
          players[1].score;
  
        leader2 =
          players[0].rank +
          "&emsp;" +
          players[0].name +
          "&emsp;" +
          players[0].score;
      }
  
      this.leader1.html(leader1);
      this.leader2.html(leader2);
    }
  
    play() 
    {
      this.handleElements();
      this.handleResetButton();
      
      Player.getPlayersInfo();
  
      if (allPlayers !== undefined) 
      {
        this.backgroundY += this.speed; 
  
        if (this.backgroundY > height) 
        {
          this.backgroundY = 0;
        }
  
        image(spaceImage, 0, this.backgroundY, 400, 500);
        image(spaceImage, 0, this.backgroundY - height, 400, 500);

        this.showFuelBar();
        this.showLife();
        this.showLeaderboard();
  
        if (frameCount % 200 === 0) 
        {
          var asteroid = createSprite(Math.round(0, random(50, width - 50)));
          asteroid.depth = rocket1.depth + 1;
          asteroid.addImage("asteroid", this.asteroidImage);
          asteroid.scale = random(0.1, 0.3);
          asteroid.velocity.x = this.speed + 1.5;
          asteroid.velocity.y = this.speed + 1.5;
          asteroid.setCollider("rectangle", 0, 0, asteroid.width, asteroid.height); 
          this.asteroidsGroup.add(asteroid);
        }
          
        if (frameCount % 100 === 0)
        {
          var star = createSprite(Math.round(random(50, width - 50)), -50);
          star.depth = rocket1.depth + 1;
          star.addImage("star", this.starImage);
          star.scale = 0.1;
          star.velocity.y = this.speed; 
          this.starsGroup.add(star);
        }

        if (frameCount % 700 === 0)
        {
          var fuel = createSprite(Math.round(random(50, width - 50)), - 50);
          fuel.depth = rocket1.depth + 1;
          fuel.addImage("fuel",fuelImage);
          fuel.scale = 0.01;
          fuel.velocity.y = this.speed;
          this.fuelsGroup.add(fuel);

          var enemyShipPosX = Math.round(random(50, width - 50));

          var enemyShip = createSprite(enemyShipPosX, -200);
          enemyShip.depth = rocket1.depth + 1;
          enemyShip.addImage("enemyShip", this.enemyShipImg);
          enemyShip.scale = 0.25;
          enemyShip.velocity.y = this.speed;
          this.enemyShipsGroup.add(enemyShip);

          var missile = createSprite (enemyShipPosX, -200);
          missile.depth = enemyShip.depth - 1;
          missile.addImage("missile", this.missileImage);
          missile.scale = 0.2;
          missile.velocity.y = this.speed + 1;
          missile.setCollider("rectangle", 0, 0, missile.width, missile.height);
          this.missilesGroup.add(missile);
        }
  
        var index = 0;
        for (var plr in allPlayers) 
        {
          index = index + 1;
      
          var x = allPlayers[plr].positionX;
          var y = height - allPlayers[plr].positionY;
      
          rockets[index - 1].position.x = x;
          rockets[index - 1].position.y = y;

            if (index === player.index) 
            {
              rockets[index - 1].visible = true;
              stroke(10);
              fill("purple");
              ellipse(x, y, 60, 60);

              this.handleLaser();
              this.handlePlayerControls();
              this.handleFuel(index);
              this.handleStars(index);
              this.handleObstacleCollision(index);
  
              if (keyIsDown(32)) 
              {
                if (!this.laserActive)
                {
                  var a = rockets[index - 1].position.x;
                  var b = rockets[index - 1].position.y 
                  var laser = createSprite(a, b); 
                  laser.depth = rocket1.depth - 1;
                  laser.addImage("laser", this.laserImage);
                  laser.scale = 0.1;
                  laser.velocity.y = -2;
                  laser.lifetime = 260;
                
                  this.lasersGroup.add(laser);
                  this.laserActive = true;
                }
              }

              else
              {
                this.laserActive = false;
              }
              
            
            }

            if (player.life <= 0)
            {
              gameState = 2;
              this.gameOver();
            }

            const finish = 1000;

            if (player.score == finish) 
            {
              gameState = 2;
              player.rank += 1;
              Player.updateRocketsAtEnd(player.rank);
              player.update();
              this.showRank();
            }
        }
        drawSprites()
      }
  
      
     }

     showRank() 
     {
      swal({
        title: `Awesome!${"\n"}Rank${"\n"}${player.rank}`,
        text: "Congratulations! You have invaded the Enemy Planet",
        imageUrl:
          "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
        imageSize: "100x100",
        confirmButtonText: "Ok"
      });
    }
  
    gameOver() 
    {
      swal({
        title: `Game Over`,
        text: "Your rocket team has failed. Returning to Earth...",
        imageUrl:
          "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
        imageSize: "100x100",
        confirmButtonText: "Thanks For Playing"
      });
    }
  }
  
  
  