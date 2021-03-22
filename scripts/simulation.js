// Written by Dean C. Forrest, Nuclear Engineering Major
// For the EF 152 Project, Spring of 2021

// Initialization
var score = 0;
var defaultCategory = 0x0001,
    background = 0x0002,
    indicator = 0x0003;
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
        showCollisions: true,
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
// Make a difficulty function that will change the random function values as a function of a fraction between 0 and 1.
var randFuelLimit = [];
var randLandings_xPosLimits = [];
var randLandings_hLimits = [];
var paused = false;
function setGameState(state, difficulty) {
    runner.enabled = false;
    background = 0;
    World.clear(world);
    Engine.clear(engine);
    switch(difficulty) {
        case 0:
            randFuelLimit = [5, 20, 18, 0.95];
            randLandings_hLimits = [20, 40, 30, 0.75];
            randLandings_xPosLimits = [25, 50, 35, 0.75];
            break;
        case 1:
            randFuelLimit = [5, 20, 10, 0.95];
            randLandings_hLimits = [200, 500, 450, 0.75];
            randLandings_xPosLimits = [100, 200, 175, 0.75];
            break;
        case 2:
            randFuelLimit = [5, 20, 10, 0.95];
            randLandings_hLimits = [200, 1200, 950, 0.75];
            randLandings_xPosLimits = [125, 600, 500, 0.75];
            break;
    }
    switch(state) { // state 0: normal, difficulty selected mode. 1: level up mode. 2: time mode. 4: stop & clear.
        case 0:
            createObjects(randFuelLimit, randLandings_hLimits, randLandings_xPosLimits);
            addObjects();
            runner.enabled = true;
            break;
    }
}
function pause() {
    if (paused) {
        runner.enabled = true;
        paused = false;
    }
    else {
        runner.enabled = false;
        paused = true;
    }
    console.log("Game paused: " + paused);
}
var landingsFuel = [],
    landingsAmount,
    landingsStackCount,
    landingsSensorsStackCount,
    active,
    inactive,
    landings,
    landingsSensors,
    x_ini,
    y_ini,
    lastLoc,
    nextLoc,
    lastScore,
    lander,
    initialBodies,
    ground,
    background;

function createObjects(fuel_vals, landings_hData, landings_xData) {
    landingsFuel = []
    landingsAmount = 24
    for (let i = 0; i < landingsAmount; i++) {
        landingsFuel[i] = [Math.ceil(randomBias(fuel_vals[0],fuel_vals[1],fuel_vals[2],fuel_vals[3]))];
    }
    landingsStackCount = -1;
    landings = Composites.stack(0, height*0.95, landingsAmount, 1, 0, 0, function(x, y) {
        landingsStackCount++;
        let landingHeight = randomBias(landings_hData[0],landings_hData[1],landings_hData[2],landings_hData[3]);
        if (landingsStackCount == 0) {
            landingsPosData[landingsStackCount] = [0, landingHeight];
            return Bodies.rectangle(x, y, 50, landingHeight, {
            isStatic: true,
            friction: 1,
            render: {
                fillStyle: 'grey'
            }
        });
            }
            else{
            let x_pos = x + randomBias(landings_xData[0],landings_xData[1],landings_xData[2],landings_xData[3]);
            landingsPosData[landingsStackCount] = [x_pos, landingHeight];
            return Bodies.rectangle(x_pos, y, 50, landingHeight, {
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
            return Bodies.rectangle(landingsPosData[landingsSensorsStackCount][0]+10, landingsPosData[landingsSensorsStackCount][1], 30, 10, {
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
            return Bodies.rectangle(landingsPosData[landingsSensorsStackCount][0]+10, landingsPosData[landingsSensorsStackCount][1], 30, 10, {
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
    lander = Bodies.rectangle(x_ini,y_ini,40,190, {
            collisionFilter: {
                mask: defaultCategory
            },
            render: {
                fillStyle: 'black',
                strokeStyle: inactive,
                friction: 0.0,
                lineWidth: 5,
                sprite: {
                        texture: 'media/game/rocket/rocket_cropped.png',
                        xScale: 0.0757*1.125,
                        yScale: 0.14
                    }
            },
            density: .0000002
    });
    ground = Bodies.rectangle(width*1,height*0.2,landingsPosData[15][0]+width*1.5,60, {
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
                texture: 'media/game/background/background169.jpg',
                xScale: .5,
                yScale: .5
            }
        }
    });

}

function addObjects() {
    World.add(world, [ landings, landingsSensors, ground, background, lander ]);
}


Render.run(render);
var launched = false;
function velInput() {
    var input_vel = document.getElementById("input_vel").value;
    var vel_angle = document.getElementById("vel_angle").value;
    Body.setVelocity(lander, {x: (input_vel*Math.cos(vel_angle*(Math.PI/180))), y: -(input_vel*Math.sin(vel_angle*(Math.PI/180)))})
    launched = true;
    console.log('Launched set to true');
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
    let x_next = landingsPosData[pillarLoc+1][0] - landingsPosData[pillarLoc][0];
    let y_next = landingsPosData[pillarLoc+1][1] - landingsPosData[pillarLoc][1];
    return [x_next, y_next];
    }
}
var timeScaleTarget = 1,
timingCounter = 0;
fuel = 10000;
// Keykey verifier
key_down = false;

Events.on(runner, 'afterUpdate', function(event) {
    if (!keys[37] & !keys[38] & !keys[39] & !keys[40]) {
        key_down = false;
    }
});

// Fuel Management
Events.on(runner, 'afterUpdate', function(event) {
    if (key_down || active_pillar > -1) {
        // tween the timescale for bullet time slow-mo
        engine.timing.timeScale += (timeScaleTarget - engine.timing.timeScale) * 0.05;

        timingCounter += 1;
        if (key_down) {
            // every 1.5 sec
            if (timingCounter >= 60 * (1/12)) {
                fuel = fuel - 1;
                // reset counter
                timingCounter = 0;
            }
        }
        else if (active_pillar > -1) {
            addFuel(active_pillar);
        }
    }
    //key_down = false;
});
function addFuel(pillarLoc) {
    if (((lander.velocity.x <= 0) & (lander.velocity.y <= 0)) & landingsFuel[pillarLoc] > 0) {
    fuel += landingsFuel[pillarLoc][0];
    console.log('Adding ' + String(landingsFuel[pillarLoc][0]) + " to fuel")
    landingsFuel[pillarLoc] = [ 0 ];
    lastLoc = [ lander.position.x, lander.position.y ];
    nextLoc = [ lastLoc[0] + distPillar(pillarLoc)[0], lastLoc[1] - distPillar(pillarLoc)[1] ];
    console.log("Last pillar location: " + lastLoc);
    score++;
    lastScore = score;
    console.log("Last score: " + lastScore);
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

// chances are you will have to rewrite this in terms of render bounds, not render width/height
// old curve: 1 / (1 + Math.exp(10(x-0.5)))
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

    if (active_pillar != -1 && (!isViewportScaled(currentViewport, [defaultViewport[0]*targetScale, defaultViewport[1]*targetScale]))) {
        //let scaleDelta = (Math.abs(defaultViewport[0]-currentViewport[0])) / (Math.abs(defaultViewport[0]-(defaultViewport[0]*targetScale)));
        let scaleDelta =  ((Math.abs(currentViewport[0]-width)  / Math.abs(defaultViewport[0]*targetScale-width)));
        //console.log("scale delta: " + scaleDelta);
        scaleViewport(0.00175*scaleCurve(scaleDelta), true); // 0.01 for fast, 0.0019 for smooth and slow
        //console.log(renderBoundsXDiff + "  " + renderBoundsYDiff);
        //console.log("scale delta: " + scaleDelta);
    }
    if ((!isViewportScaled(currentViewport, defaultViewport)) && active_pillar == -1) {
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
            {x: ( (landingsSensors.bodies[0].position.x)+(lander.position.x*0.9) ) + 600,
             y: (landingsSensors.bodies[0].position.y*0.1)+(lander.position.y*0.9)})
        Render.bodyVelocity(render, lander, render.context);

    }
});

Events.on(runner, 'afterUpdate', function(event) {
    if ( (launched & ( (lander.position.y > 0 ) | (lander.position.x > nextLoc[0]*1.125) ) ) == 1 ) {
        Body.setPosition(lander,
            {
                x: lastLoc[0],
                y: lastLoc[1]
            })
        Body.setVelocity(lander,
            {
                x: 0,
                y: 0
            })
        console.log("Launch failed. Reverting...")
        launched = false;
    }
});

Events.on(runner, 'tick', function(event) {
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

    //if ((lander.velocity.y > 0.15) & (lander.velocity.y > 0)) {}
    Body.setAngle(lander,0); // lock rotation of the lander

    // Update debug info:

    document.getElementById("ploc").textContent = String(active_pillar) + "/" + String(landingsAmount-1);
    document.getElementById("x_next_pillar").textContent = String(distPillar(active_pillar)[0].toFixed(2));
    document.getElementById("y_next_pillar").textContent = String(distPillar(active_pillar)[1].toFixed(2));
    document.getElementById("x_pos").textContent = String(lander.position.x.toFixed(2));
    document.getElementById("y_pos").textContent = String(lander.position.y.toFixed(2));
    document.getElementById("fuel").textContent = String(fuel);
    document.getElementById("score").textContent = String(score);

    Engine.update(engine, delta)
});