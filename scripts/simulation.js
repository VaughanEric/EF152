// Initialization
var score = 0;
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
var width = 900,
    height = 450;
var render = Render.create({
    canvas: cv,
    engine: engine,
    options: {
        width: width,
        height: height,
        background: 'transparent',
        wireframes: false,
        showAngleIndicator: false,
        showCollisions: true,
        showVelocity: true,
        hasBounds: true,
        background: 'DSCN0457-16x9.jpg'
    }
});
engine.world.gravity.y = .98;
// Create bodies
function randomNBias(min, max, bias, influence) {
    var rnd = Math.random() * (max - min) + min,   // random in range
    mix = Math.random() * influence;           // bias weight
    return rnd * (1 - mix) + bias * mix;           // mix full range and bias
}

/*size = 50;
stackCount = -1
preVert = 0;
var platformWidth = randomNBias(80,125,100,0.75);
//var mountainLength = randomNBias(300,600,475,0.85);
var mountainLength = 700;
var platformLoc = randomNBias(0,0.75,0.5,0.25);
var triangleMatrix = Vertices.create([
    {x:0,y:0},
    //{x:mountainLength*platformLoc,y:-325},
    //{x:(mountainLength*platformLoc)+platformWidth,y:-325},
    {x:0,y:-325},
    {x:mountainLength,y:-325},
    {x:mountainLength,y:0}
]);
console.log(platformLoc);
var terrainBody = Bodies.fromVertices(width*0.65,height*0.9,triangleMatrix,
{
    isStatic: true,
    render: {fillStyle: 'brown'}
});
var platformLanding = Bodies.rectangle((width*0.65)+mountainLength,height*0.9,
((mountainLength*platformLoc)+platformWidth)-mountainLength*platformLoc,
65, {
    isStatic: true
});*/

/*difficulty = .95
for (i = 0; i < mountains.length; i++) {
        let tempHeight = randomNBias(100,400,350,1);
        let tempWidth = 100
        mountains[i] = Bodies.trapezoid(2560*(i/24), height+(tempHeight*0.5), 100, tempHeight, 0.9, {
        isStatic: true,
        render: { fillStyle: 'brown' }
    });
    console.log(randomNBias(10,50,15,1))
}*/
// Landing pillars
var landingsPosData = [
    [0,0]
];
var landingsFuel = []
var landingsAmount = 24
for (var i = 0; i < landingsAmount; i++) {
    landingsFuel[i] = [Math.ceil(randomNBias(5,20,10,0.95))];
}
var landingsStackCount = -1;
var landings = Composites.stack(0, height*0.95, landingsAmount, 1, 0, 0, function(x, y) {
    landingsStackCount++;
    let landingHeight = randomNBias(200,1200,950,0.75);
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
        let x_pos = x + randomNBias(125,600,500,0.75);
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
var active_pillar = -1;
var active = '#f55a3c',
    inactive = '#f5d259';
var landingsSensorsStackCount = -1;
Composite.scale(landings,1,-2,{x:width*0.5,y:height*.98});
var landingsSensors = Composites.stack(0, height*0.95, landingsAmount, 1, 100, 0, function(x, y) {
    landingsSensorsStackCount++;
    if (landingsStackCount == 0) {
        return Bodies.rectangle(landingsPosData[landingsSensorsStackCount][0]+10, landingsPosData[landingsSensorsStackCount][1], 30, 10, {
        isStatic: true,
        isSensor: true,
        friction: 1,
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
var x_ini = landingsPosData[0][0]+20,
    y_ini = (-1)*(landingsPosData[0][1]+landingsPosData[0][1]*0.5);
var lander = Bodies.rectangle(x_ini,y_ini,40,190, {
    render: {
            fillStyle: 'white'
        },
        density: .0000002
});
var initialBodies = [
    ground = Bodies.rectangle(width*1,height*0.4,landingsPosData[15][0]+width*1.5,60, {
        isStatic: true,
        friction: 0.75,
        render: {
            fillStyle: 'transparent'
        }
    }
    )
];
/*var mountainTemplate = Vertices.fromPath('100 0 75 50 100 100 25 125 0 50 25 0');
var mountainPath = Bodies.fromVertices(width*0.5, height+300, mountainTemplate, {
    render: {
        fillStyle: 'black',
        strokeStyle: 'orange',
        lineWidth: 2
    }
});*/

//World.add(world,[terrainBody,platformLanding]);

World.add(world, [ lander, landings, landingsSensors, initialBodies[0] ]);
World.add(world, initialBodies[0]);
Render.run(render);

function velInput() {
    var input_vel = document.getElementById("input_vel").value;
    var vel_angle = document.getElementById("vel_angle").value;
    Body.setVelocity(lander, {x: (input_vel*Math.cos(vel_angle*(Math.PI/180))), y: -(input_vel*Math.sin(vel_angle*(Math.PI/180)))})
    console.log('vel data submitted');
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

// Fuel Management
key_down = false;
Events.on(engine, 'afterUpdate', function(event) {
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
    key_down = false;
});
function addFuel(pillarLoc) {
    if (((lander.velocity.x <= 0) & (lander.velocity.y <= 0)) & landingsFuel[pillarLoc] > 0) {
    fuel += landingsFuel[pillarLoc][0];
    landingsFuel[pillarLoc] = [ 0 ];
    score++;
    console.log('adding fuel')
}
}
// Viewport follower
Events.on(engine, 'beforeTick', function() {
    var world = engine.world,
        translate;
    var viewportCenter = {
        x: (render.options.width * 0.5) + lander.position.x,
        y: (render.options.height * 0.5) + lander.position.y
    };
    world.bounds.min.x = lander.position.x - width*0.25;
    world.bounds.min.y = lander.position.y - height*0.5;
    world.bounds.max.x = lander.position.x + width*0.75;
    world.bounds.max.y = lander.position.y + height*0.5;
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


    }
});

Engine.run(engine);
(function run() {
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

    window.requestAnimationFrame(run);
    Engine.update(engine, delta)
})();
