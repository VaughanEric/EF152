// Written by Dean C. Forrest, Nuclear Engineering Major
// For the EF 152 Project, Spring of 2021

// Initialization
console.log("Rooftop Rocket by Dean Forrest")
var score = 0;
var defaultCategory = 0x0001,
    background = 0x0002,
    indicator = 0x0003;

var landingsFuel = [],
    landingsAmount,
    landingsStackCount,
    landingsSensorsStackCount,
    levelsAmount,
    setDifficulty,
    setMode,
    enableSound,
    active,
    inactive,
    landings,
    landingsWidth,
    landingsSensors,
    x_ini,
    y_ini,
    lastLoc,
    nextLoc,
    lastScore,
    lander,
    initialBodies,
    ground,
    background,
    currLevel;

//Audio initialization
enableSound = true;
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const audioElement = document.querySelector('audio');
const track = audioCtx.createMediaElementSource(audioElement);
audioElement.pause();

const audioGain = audioCtx.createGain();

track.connect(audioGain).connect(audioCtx.destination);

function updateVolume(vol){ // 0 < vol < 1
    audioGain.gain.value = vol;
}
function setSoundState(state) {
    if (state) {
        enableSound = true;
        if (!paused) {
            audioElement.play();
        }
    }
    else {
        enableSound = false;
        audioElement.pause();
    }
}

// Key Controls
const keys = [];
document.body.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});
document.body.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
});
var delta = 1 / 60 // Time step between engine updates in ms
// Module Aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    World = Matter.World,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Body = Matter.Body,
    Bounds = Matter.Bounds,
    Bodies = Matter.Bodies,
    Events = Matter.Events,
    MouseConstraint = Matter.MouseConstraint,
    mouse = Matter.Mouse,
    Vector = Matter.Vector,
    Vertices = Matter.Vertices,
    mouseConstraint = Matter.MouseConstraint;
// Create engine & render objects
var engine = Engine.create(),
    world = engine.world;

var width = window.innerWidth*0.6,
    height = window.innerHeight*0.6;
var render = Render.create({
    canvas: cv,
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false,
        showAngleIndicator: false,
        showCollisions: false,
        //showVelocity: false,
        hasBounds: true,
        background: 'transparent'
    }
});

engine.world.gravity.y = .98;

var runner = Runner.create();
runner.delta = delta;
Runner.run(runner, engine, render);
runner.enabled = false;
// Create bodies
function randomBias(min, max, bias, influence) { // bias means the value the function is biased to produce
    var rnd = Math.random() * (max - min) + min,   // random in range
    mix = Math.random() * influence;           // bias weight (0 < x <= 1)
    return Math.round( rnd * (1 - mix) + bias * mix );           // mix full range and bias
}
var landingsPosData = [
    [0,0]
];
landingsWidth = 125;
const defaultFuel = 10000;
fuel = defaultFuel;
var mediaPath = "media/game/";
var themes = [
    ["t1_r.png", "t1_bg.jpg"],
    ["t2_r.png", "t2_bg.png"],
    ["t3_r.png", "t3_bg.jpg"],
    ["t4_r.png", "t4_bg.jpg"],
    ["t5_r.png", ""],
    ["t6_r.png", ""]
];
var rocketTheme = "",
    backgroundTheme = "";
// Make a difficulty function that will change the random function values as a function of a fraction between 0 and 1.
var randFuelLimit = [];
var randLandings_xPosLimits = [];
var randLandings_hLimits = [];
var paused = false;
var settingsParams = [
    setMode,
    setDifficulty,
    landingsAmount,
    levelsAmount
];
function setGameState(state, difficulty, pillarAmt, lvlsAmt) {
    settingsParams[0] = state;
    settingsParams[1] = difficulty;
    settingsParams[2] = pillarAmt;
    settingsParams[3] = lvlsAmt;
    runner.enabled = false;
    background = 0;
    World.clear(world);
    Engine.clear(engine);
    switch(difficulty) { // leave minimum height value above 400 to prevent launch teleportion code from malfunctioning
        case 0:
            randFuelLimit = [5, 20, 18, 0.95];
            randLandings_hLimits = [400, 650, 500, 0.8];
            randLandings_xPosLimits = [100, 200, 125, 0.75];
            fuel = 50;
            break;
        case 1:
            randFuelLimit = [5, 20, 10, 0.95];
            randLandings_hLimits = [400, 650, 500, 0.75];
            randLandings_xPosLimits = [200, 300, 275, 0.75];
            fuel = 50;
            break;
        case 2:
            randFuelLimit = [5, 20, 10, 0.95];
            randLandings_hLimits = [400, 800, 700, 0.75];
            randLandings_xPosLimits = [400, 600, 500, 0.75];
            fuel = 35;
            break;
    }
    landingsAmount = pillarAmt;
    // state 0: normal, difficulty selected mode, 1: level up mode, 2: time mode
    // 98: stop & clear world, 99: stop & clear everything
    switch(state) {
        case 0:
            createObjects(randFuelLimit, randLandings_hLimits, randLandings_xPosLimits);
            addObjects();
            levelsAmount = lvlsAmt;
            currLevel = 1;
            document.getElementById("level").textContent = String(currLevel) + "/" + String(levelsAmount);
            runner.enabled = true;
            paused = false;
            if (enableSound) {
                audioElement.play();
            }
            break;
        case 1:
            createObjects(randFuelLimit, randLandings_hLimits, randLandings_xPosLimits);
            addObjects();
            document.getElementById("level").textContent = String(currLevel) + "/" + String(levelsAmount);
            runner.enabled = true;
            paused = false;
            if (enableSound) {
                audioElement.play();
            }
            break;
        case 98:
            runner.enabled = false;
            World.clear(world);
            Engine.clear(engine);
            audioElement.pause();
            break;
        case 99:
            currLevel = 1;
            score = 0;
            fuel = defaultFuel;
            runner.enabled = false;
            World.clear(world);
            Engine.clear(engine);
            audioElement.pause();
            break;
    }
    document.getElementById("ploc").textContent = String(0) + "/" + String(landingsAmount);
}
var rocketScaleCorrection = 0;
var bgScaleCorrection = 0.25;
function setTheme(rt_index, bg_index) {
    if (rt_index > 0) {
        rocketScaleCorrection = 0.012;
    }
    else {
        rocketScaleCorrection = 0;
    }
    if (bg_index > 0) {
        bgScaleCorrection = 1.25;
    }
    else {
        bgScaleCorrection = 0.25;
    }
    rocketTheme = mediaPath + "rocket" + "/" + themes[rt_index][0];
    backgroundTheme = mediaPath + "background" + "/" + themes[bg_index][1];
}
function pause() {
    if (paused) {
        runner.enabled = true;
        if (enableSound) {
            audioElement.play();
        }
        paused = false;
    }
    else {
        runner.enabled = false;
        audioElement.pause();
        paused = true;
    }
    console.log("Game paused: " + paused);
}

function createObjects(fuel_vals, landings_hData, landings_xData) {
    landingsFuel = []
    for (let i = 0; i < landingsAmount; i++) {
        landingsFuel[i] = [Math.ceil(randomBias(fuel_vals[0],fuel_vals[1],fuel_vals[2],fuel_vals[3]))];
    }
    landingsStackCount = -1;
    landings = Composites.stack(0, height*0.95, landingsAmount, 1, 0, 0, function(x, y) {
        landingsStackCount++;
        let landingHeight = randomBias(landings_hData[0],landings_hData[1],landings_hData[2],landings_hData[3]);
        if (landingsStackCount == 0) {
            landingsPosData[landingsStackCount] = [0, landingHeight];
            return Bodies.rectangle(x, y, landingsWidth, landingHeight, {
            isStatic: true,
            friction: 1,
            render: {
                fillStyle: 'grey'
            }
        });
            }
            else{
            let x_pos = x + randomBias(landings_xData[0]+landingsWidth*0.5,landings_xData[1]+(landingsWidth*0.5),landings_xData[2],landings_xData[3]);
            landingsPosData[landingsStackCount] = [x_pos, landingHeight];
            return Bodies.rectangle(x_pos, y, landingsWidth, landingHeight, {
            isStatic: true,
            friction: 0.75,
            render: {
                fillStyle: 'grey'
            }
        });
            }
    });
    // Landing sensors
    active_pillar = -1;
    active = '#f55a3c';
    inactive = '#f5d259';
    landingsSensorsStackCount = -1;
    Composite.scale(landings,1,-2,{x:width*0.5,y:height*.98});
    landingsSensors = Composites.stack(0, height*0.95, landingsAmount, 1, 100, 0, function(x, y) {
        landingsSensorsStackCount++;
        if (landingsStackCount == 0) {
            return Bodies.rectangle(landingsPosData[landingsSensorsStackCount][0]+landingsWidth*0.35, landingsPosData[landingsSensorsStackCount][1], 30, 10, {
            isStatic: true,
            isSensor: true,
            friction: 1,
            collisionFilter: {
                category: defaultCategory
            },
            render: { strokeStyle: inactive,
                        lineWidth: 1,
                        fillStyle: 'transparent' }
            });
            }
            else{
            return Bodies.rectangle(landingsPosData[landingsSensorsStackCount][0]+landingsWidth*0.37, landingsPosData[landingsSensorsStackCount][1], 30, 10, {
            isStatic: true,
            isSensor: true,
            friction: 0.75,
            render: { strokeStyle: inactive,
                        lineWidth: 1,
                        fillStyle: 'transparent'}
                });
            }
    });
    Composite.scale(landingsSensors,1,-2,{x:width*0.5,y:height*0.34});
    x_ini = landingsPosData[0][0]+20,
    y_ini = (-1)*(landingsPosData[0][1]+landingsPosData[0][1]*0.5);
    lastLoc = [ x_ini, y_ini + 5 ];
    nextLoc = [ x_ini + distPillar(0)[0], y_ini + distPillar(0)[1] ];
    lastScore = score;
    lander = Bodies.rectangle(x_ini+landingsWidth*0.3,y_ini,96,170.75, {
            collisionFilter: {
                mask: defaultCategory
            },
            render: {
                fillStyle: 'black',
                strokeStyle: inactive,
                friction: 0.0,
                lineWidth: 5,
                sprite: {
                        texture: rocketTheme,
                        //xScale: 0.0757*1.125,
                        //yScale: 0.14
                        xScale: .125 + rocketScaleCorrection,
                        yScale: .125 + rocketScaleCorrection
                    }
            },
            density: .0000002
    });
    ground = Bodies.rectangle(width*2.5,height*0.55,landingsPosData[landingsAmount-1][0]+width*1.75+(landingsAmount*landingsWidth),60, {
            isStatic: true,
            friction: 0.75,
            collisionFilter: {
                category: defaultCategory
            },
            render: {
                fillStyle: 'grey'
            }
    });
    ceiling = Bodies.rectangle(width*2.5,height*0.65,landingsPosData[landingsAmount-1][0]+width*1.75+(landingsAmount*landingsWidth),60, {
        isStatic: true,
        friction: 0.75,
        collisionFilter: {
            category: defaultCategory
        },
        render: {
            fillStyle: 'grey'
        }
});
    background = Bodies.rectangle(x_ini,y_ini,width,height, {
        collisionFilter: {
            mask: background
        },
        render: {
            fillStyle: 'black',
            strokeStyle: inactive,
            lineWidth: 5,
            sprite: {
                texture: backgroundTheme,
                xScale: .5 + bgScaleCorrection,
                yScale: .5 + bgScaleCorrection
            }
        }
    });

}

function addObjects() {
    World.add(world, [ landings, landingsSensors, ground, ceiling, background, lander ]);
}


Render.run(render);
var launched = false;
function velInput() {
    var input_vel = document.getElementById("input_vel").value;
    var vel_angle = document.getElementById("vel_angle").value;
    if ( (fuel - fuel*0.05) > 0 ) {
        fuel = fuel - Math.ceil(fuel*0.05);
        Body.setVelocity(lander, {x: (input_vel*Math.cos(vel_angle*(Math.PI/180))), y: -(input_vel*Math.sin(vel_angle*(Math.PI/180)))})
        launched = true;
        console.log('Launched set to true');
    }
}
function launchMode_velInput() {
    var input_vel = document.getElementById("launchMode_vel_input").value;
    var vel_angle = document.getElementById("launchMode_vel_angle").value;
    if ( (fuel - fuel*0.05) > 0 ) {
        fuel = fuel - Math.ceil(fuel*0.05);
        Body.setVelocity(lander, {x: (input_vel*Math.cos(vel_angle*(Math.PI/180))), y: -(input_vel*Math.sin(vel_angle*(Math.PI/180)))})
        launched = true;
        console.log('Launched set to true');
    }
}
// Sensor manager
Events.on(engine, 'collisionStart', function(event) {
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        for (var k = 0; k < landingsSensors.bodies.length; k++) {

            if (pair.bodyA === landingsSensors.bodies[k]) {
                landingsSensors.bodies[k].render.strokeStyle = active;
                active_pillar = k;
            } else if (pair.bodyB === landingsSensors.bodies[k]) {
                lander.render.strokeStyle = active;
            }
        }
    }
});
Events.on(engine, 'collisionEnd', function(event) {
    var pairs = event.pairs;

    for (var i = 0, j = pairs.length; i != j; ++i) {
        var pair = pairs[i];

        for (var k = 0; k < landingsSensors.bodies.length; k++) {

            if (pair.bodyA === landingsSensors.bodies[k]) {
                landingsSensors.bodies[k].render.strokeStyle = inactive;
                active_pillar = -1;
            } else if (pair.bodyB === landingsSensors.bodies[k]) {
                lander.render.strokeStyle = inactive;
            }
        }
    }
});
function distPillar(pillarLoc) {
    if (pillarLoc < 0) {return [0,0]}
    else if (pillarLoc >= landingsSensors.bodies.length-1) {return [0,0]}
    else{
    let x_next = (landingsPosData[pillarLoc+1][0] - landingsPosData[pillarLoc][0]) + landingsWidth*0.5;
    let y_next = landingsPosData[pillarLoc+1][1] - landingsPosData[pillarLoc][1];
    return [x_next, y_next];
    }
}
var timeScaleTarget = 1,
timingCounter = 0;
// Keykey verifier
key_down = false;

Events.on(runner, 'afterUpdate', function(event) {
    if (!keys[37] & !keys[38] & !keys[39] & !keys[40]) {
        key_down = false;
    }
});

// Fuel Management & Level Coordinator
Events.on(runner, 'afterUpdate', function(event) {
    if (key_down || active_pillar > -1) {
        // tween the timescale for bullet time slow-mo
        engine.timing.timeScale += (timeScaleTarget - engine.timing.timeScale) * 0.05;

        timingCounter += 1;
        if (key_down) {
            // every 1.5 sec
            if (timingCounter >= 60 * (1/12)) {
                if (fuel > 0) {
                    fuel = fuel - 1;
                }
                // reset counter
                timingCounter = 0;
            }
        }
        else if (active_pillar > -1) {
            addFuel(active_pillar);
        }
    }
    if ((fuel <= 0) & ( (lander.position.y > 0) || (Math.abs(lander.velocity.y) <= 0.05) )) {
        characterAlert("Game over! You're all out of fuel! Click \"Okay\" to restart.");
        pause();
        pauseButtonUpdate();
    }
    //key_down = false;
});
function addFuel(pillarLoc) {
    if (((Math.abs(lander.velocity.x) <= 0.1) & (Math.abs(lander.velocity.y) <= 0.1)) & landingsFuel[pillarLoc] > 0) {
        fuel += landingsFuel[pillarLoc][0];
        console.log('Adding ' + String(landingsFuel[pillarLoc][0]) + " to fuel")
        landingsFuel[pillarLoc] = [ 0 ];
        lastLoc = [ lander.position.x, lander.position.y, active_pillar ];
        nextLoc = [ lastLoc[0] + distPillar(pillarLoc)[0], lastLoc[1] - distPillar(pillarLoc)[1] ];
        console.log("Last pillar location: " + lastLoc);
        score++;
        lastScore = score;
        console.log("Last score: " + lastScore);
        launched = false;
        if ( pillarLoc == (landingsAmount-1) ) {
            currLevel = currLevel + 1;
            updateLevel(currLevel);
        }
    }
}
function updateLevel(lvl) {
    if (lvl > levelsAmount) {
        console.log("Game finished.")
        characterAlert("Congratulations! You Won! You can choose different settings or a different rocket to play again.");
        pause();
        pauseButtonUpdate();
    }
    else {
        document.getElementById("level").textContent = String(currLevel) + "/" + String(levelsAmount);
        console.log("Level upgraded to: " + lvl)
        characterAlert("Awesome work! You're on level " + lvl + " of " + levelsAmount + "!");
        setGameState(98,settingsParams[1],settingsParams[2],settingsParams[3]);
        setGameState(1,settingsParams[1],settingsParams[2],settingsParams[3]);
    }
}
// Viewport follower
var targetScale = 1.45;
var scaleCheckBuffer = 5;
var renderBoundsXDiff = (Math.abs(render.bounds.max.x - render.bounds.min.x));
var renderBoundsYDiff = (Math.abs(render.bounds.max.y - render.bounds.min.y));
const defaultViewport = [renderBoundsXDiff, renderBoundsYDiff];
var currentViewport = [renderBoundsXDiff, renderBoundsYDiff];
var scaleProgress = 0;
var adjustedViewport = 0;

function scaleCurve(x) {
    return ( 1 / (1 + Math.exp(18*(x-0.75))) );
}
function isViewportScaled(currViewport, wantedViewport) {
    if ( (currViewport[0] > wantedViewport[0] - scaleCheckBuffer) & (currViewport[0] < wantedViewport[0] + scaleCheckBuffer) ) {
        adjustedViewport = currViewport;
        return true;
    }
    else if ( (currViewport[0] < wantedViewport[0] - scaleCheckBuffer) | (currViewport[0] > wantedViewport[0] + scaleCheckBuffer) ) {
        scaleProgress = Math.abs(adjustedViewport[0] - currViewport[0]) / wantedViewport[0];
        return false;
    }
}
function scaleViewport(scaleFraction, zoomOut) {
    if (zoomOut) { // true means scale/zoom out
        render.bounds.max.x += (renderBoundsXDiff*(scaleFraction));
        render.bounds.max.y += (renderBoundsYDiff*(scaleFraction));
    }
    else {
        render.bounds.max.x -= (renderBoundsXDiff*(scaleFraction));
        render.bounds.max.y -= (renderBoundsYDiff*(scaleFraction));
    }
}
function getRBounds() {
    console.log("X delta  " + String(render.bounds.max.x - render.bounds.min.x) + "  X max,X min  " + render.bounds.max.x + " / " + render.bounds.min.x);
    console.log("Y delta  " + String(render.bounds.max.y - render.bounds.min.y) + "  Y max,Y min  " + render.bounds.max.y + " / " + render.bounds.min.y);
    console.log("wX delta  " + String(world.bounds.max.x - world.bounds.min.x) + "  X max,X min  " + world.bounds.max.x + " / " + world.bounds.min.x);
    console.log("wY delta  " + String(world.bounds.max.y - world.bounds.min.y) + "  Y max,Y min  " + world.bounds.max.y + " / " + world.bounds.min.y);
}

Events.on(runner, 'beforeTick', function() {

    renderBoundsXDiff = (Math.abs(render.bounds.max.x - render.bounds.min.x));
    renderBoundsYDiff = (Math.abs(render.bounds.max.y - render.bounds.min.y));
    currentViewport = [renderBoundsXDiff, renderBoundsYDiff];

    if ((launched | active_pillar != -1) && (!isViewportScaled(currentViewport, [defaultViewport[0]*targetScale, defaultViewport[1]*targetScale]))) {
        //let scaleDelta= (Math.abs(defaultViewport[0]-currentViewport[0])) / (Math.abs(defaultViewport[0]-(defaultViewport[0]*targetScale)));
        if (launched) {
            targetScale = 2;
        }
        else {
            targetScale = 1.45;
        }
        let scaleDelta =  ((Math.abs(currentViewport[0]-width)  / Math.abs(defaultViewport[0]*targetScale-width)));
        //console.log("scale delta: " + scaleDelta);
        scaleViewport(0.00175*scaleCurve(scaleDelta), true); // 0.01 for fast, 0.0019 for smooth and slow
        //console.log(renderBoundsXDiff + "  " + renderBoundsYDiff);
        //console.log("scale delta: " + scaleDelta);
    }
    if ((!isViewportScaled(currentViewport, defaultViewport)) && (active_pillar == -1)) {
        let scaleDelta =  1 - ((Math.abs(defaultViewport[0])  / Math.abs(currentViewport[0])));
        scaleViewport(0.001*scaleCurve(scaleDelta), false);
        //console.log("scale delta: " + scaleCurve(scaleDelta));
    }

    var world = engine.world,
        translate;
    var viewportCenter = {
        x: (renderBoundsXDiff * 0.5) + lander.position.x,
        y: (renderBoundsYDiff * 0.5) + lander.position.y
    };
    world.bounds.min.x = lander.position.x - renderBoundsXDiff*0.25;
    world.bounds.min.y = lander.position.y - renderBoundsYDiff*0.5;
    world.bounds.max.x = lander.position.x + renderBoundsXDiff*0.75;
    world.bounds.max.y = lander.position.y + renderBoundsYDiff*0.5;
    // get vector from lander relative to centre of viewport
    var deltaCenter = Vector.sub(lander.position, viewportCenter),
        centreDist = Vector.magnitude(deltaCenter);

    // translate the view if lander has moved over 50px from the centre of viewport
    if (centreDist > 200) {
        // create a vector to translate the view, allowing the user to control view speed
        var direction = Vector.normalise(deltaCenter),
            speed = Math.min(10, Math.pow(centreDist - 50, 2) * 0.0002);

        translate = Vector.mult(direction, speed);

        // prevent the view moving outside the world/lander bounds
        var correctionRate = 1.5;
        var bufferZone = 50;
        if (render.bounds.min.x + translate.x < world.bounds.min.x)
        translate.x = world.bounds.min.x - render.bounds.min.x;

        if (render.bounds.max.x + translate.x > world.bounds.max.x)
        translate.x = world.bounds.max.x - render.bounds.max.x;

        if (render.bounds.min.y + translate.y < world.bounds.min.y)
        translate.y = world.bounds.min.y - render.bounds.min.y;

        if (render.bounds.max.y + translate.y > world.bounds.max.y)
        translate.y = world.bounds.max.y - render.bounds.max.y;

        // move the view
        Bounds.translate(render.bounds, translate);
        /*console.log('MIN X:' + render.bounds.min.x + ' // MAX X:' + render.bounds.max.x);
        console.log('MIN Y:' + render.bounds.min.y + ' // MAX Y:' + render.bounds.max.y);*/

        // move the background in accordance with the viewport

        Body.setPosition(background,
            {
                x: ( (landingsSensors.bodies[0].position.x)+(lander.position.x*0.9) ) + 600,
                y: (landingsSensors.bodies[0].position.y*0.1)+(lander.position.y*0.9) - height*0.15
            })
        Render.bodyVelocity(render, lander, render.context);

    }
});
function teleportBack() {
    Body.setPosition(lander,
        {
            x: landingsPosData[lastLoc[2]][0]+(landingsWidth*0.5),
            y: lastLoc[1]
        })
    Body.setVelocity(lander,
        {
            x: 0,
            y: 0
        })
}
Events.on(runner, 'afterUpdate', function(event) {
    if ( (launched & ( (lander.position.y > 0 )  ) ) == 1 ) {
        teleportBack();
        console.log("Launch failed. Reverting...")
        launched = false;
    }
    if ( lander.position.y > 1000 ) { teleportBack(); }
    if ( lander.position.y < -5000 ) { teleportBack(); }
    if ( ( lander.position.x < landingsPosData[0][0]-200 ) | ( lander.position.x > landingsPosData[landingsAmount-1][0]+300 ) ) { teleportBack(); }
});

Events.on(runner, 'tick', function(event) {
    if (fuel > 0) {
        if (keys[38]) { // UP
            let F_APPLIED = (-1500 * lander.mass);
            Body.applyForce(lander,lander.position,{x: 0, y: F_APPLIED});
            //console.log('up pess' + F_APPLIED);
            key_down = true;
        }
        if (keys[40]) { // DOWN
            let F_APPLIED = (1500 * lander.mass);
            Body.applyForce(lander,lander.position,{x: 0, y: F_APPLIED});
            //console.log('up pess' + F_APPLIED);
            key_down = true;
    
        }
        if (keys[39]) { // RIGHT
            let F_APPLIED = (500 * lander.mass);
            Body.applyForce(lander,{x: 0, y: lander.position.y},{x: F_APPLIED, y: 0});
            //console.log('up pess' + F_APPLIED);
            key_down = true;
    
        }
        if (keys[37]) { // LEFT
            let F_APPLIED = (-500 * lander.mass);
            Body.applyForce(lander,{x: 0, y: lander.position.y},{x: F_APPLIED, y: 0});
            //console.log('up pess' + F_APPLIED);
            key_down = true;
        }
    }
    
    // Control thruster sound effect
    if (key_down) {
        updateVolume(0.6);
    }
    else {
        updateVolume(0.075);
    }

    //if ((lander.velocity.y > 0.15) & (lander.velocity.y > 0)) {}
    Body.setAngle(lander,0); // lock rotation of the lander

    // Update debug info:
    let reverse_yPos = lander.position.y * -1;
    if (active_pillar != -1) {
        document.getElementById("ploc").textContent = String(active_pillar+1) + "/" + String(landingsAmount);
    }
    document.getElementById("x_next_pillar").textContent = String(distPillar(active_pillar)[0].toFixed(2));
    document.getElementById("y_next_pillar").textContent = String(distPillar(active_pillar)[1].toFixed(2));
    document.getElementById("x_pos").textContent = String(lander.position.x.toFixed(2));
    document.getElementById("y_pos").textContent = String(reverse_yPos.toFixed(2));
    document.getElementById("fuel").textContent = String(fuel);
    document.getElementById("score").textContent = String(score);

    Engine.update(engine, delta)
});