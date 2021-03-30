// Traplot - Trajectory plotting utility for Rooftop Rocket
// Written by Dean C. Forrest
var graphCanvas,
    traplotCTX,
    next_pillar_xy,
    currLanderPos,
    transX,
    transY,
    plotSteps,
    launchMode_vel_range,
    launchMode_ang_range,
    launchMode_vel_disp,
    launchMode_ang_disp;

var totalScale = 1;
var plotScale = 0; // scale correction to try and match the game viewport scale

enableLaunchMode.onclick = function() {
    if (!prohibitNewModal) {
        launchMode_mdl.classList.add('show');
        prohibitNewModal = true;
        if (!paused) {
            pause();
            pauseButtonUpdate();
            traplotVarAssign();
            switch (settingsParams[1]) {
                case (0):
                    plotScale = 35;
                    break;
                case 1:
                    plotScale = 30;
                    break;
                case 2:
                    plotScale = 18;
            }
            setupTraplot();
            plot(launchMode_vel_range.value,launchMode_ang_range.value);
        }
    }
}
launchMode_btn.onclick = function() {
    launchMode_mdl.classList.remove('show');
    prohibitNewModal = false;
    if (paused) {
        pause();
        pauseButtonUpdate();
        launchMode_velInput();
    }
}

function traplotVarAssign() {
    graphCanvas = document.getElementById("traplot");
    traplotCTX = graphCanvas.getContext("2d");
    next_pillar_xy = [parseInt(x_next_pillar.textContent), parseInt(y_next_pillar.textContent)];
    currLanderPos = [parseInt(x_pos.textContent), parseInt(y_pos.textContent)];
    graphCanvas.width = window.innerWidth*0.5;
    graphCanvas.height = window.innerHeight*0.5;
    transX = graphCanvas.width * 0.15;
    transY = graphCanvas.height * 0.65;
    traplotCTX.translate(transX, transY);
    traplotCTX.lineWidth=2;
    plotSteps = 512;
    launchMode_vel_range = document.getElementById("launchMode_vel_input");
    launchMode_ang_range = document.getElementById("launchMode_vel_angle");
    graphZoom = document.getElementById("graphZoom");
    launchMode_vel_disp = document.getElementById("launchMode_vel_disp");
    launchMode_ang_disp = document.getElementById("launchMode_ang_disp");
    graphZoom_disp = document.getElementById("graphZoom_disp");
    launchMode_vel_disp.innerHTML = launchMode_vel_range.value;
    launchMode_ang_disp.innerHTML = launchMode_ang_range.value;
    graphZoom_disp.innerHTML = graphZoom.value;
    traplotCTX.font = "12px Arial";
}

document.getElementById("launchMode_vel_input").oninput = function() {
    launchMode_vel_disp.innerHTML = this.value;
    ctxClear();
    plot(launchMode_vel_range.value,launchMode_ang_range.value);
}
document.getElementById("launchMode_vel_angle").oninput = function() {
    launchMode_ang_disp.innerHTML = this.value;
    ctxClear();
    plot(launchMode_vel_range.value,launchMode_ang_range.value);
}
document.getElementById("graphZoom").oninput = function() {
    graphZoom_disp.innerHTML = this.value;
    totalScale = parseInt(graphZoom.value)/100;
    ctxClear();
    plot(launchMode_vel_range.value,launchMode_ang_range.value);
}
function plot(vel,angle) {
    let y0Diff = 0;
    let plotStepCompensation = (angle-44)*(plotSteps/8);
    for (var i = 0; i <= plotSteps+plotStepCompensation; i++) {
        let tempPoint = trajectory((next_pillar_xy[0]/(plotSteps+plotStepCompensation))*i, 0,currLanderPos[1],parseInt(launchMode_vel_range.value),-9.8,parseInt(launchMode_ang_range.value));
        let tempPoint_under = trajectory((next_pillar_xy[0]/(plotSteps+plotStepCompensation))*i, 0,currLanderPos[1],parseInt(launchMode_vel_range.value),-9.8,parseInt(launchMode_ang_range.value)-1);
        let tempPoint_over = trajectory((next_pillar_xy[0]/(plotSteps+plotStepCompensation))*i, 0,currLanderPos[1],parseInt(launchMode_vel_range.value),-9.8,parseInt(launchMode_ang_range.value)+1);
        if (i == 0) { 
            y0Diff = graphCanvas.height*0.5 - tempPoint[1];
        }
        pointPlot(totalScale*plotScale*tempPoint[0], totalScale*plotScale* (tempPoint[1] + y0Diff - graphCanvas.height*0.5),"#FF0000",1.5);
        pointPlot(totalScale*plotScale*tempPoint[0], totalScale*plotScale* (tempPoint_under[1] + y0Diff - graphCanvas.height*0.5),"#808080",1.5);
        pointPlot(totalScale*plotScale*tempPoint[0], totalScale*plotScale* (tempPoint_over[1] + y0Diff - graphCanvas.height*0.5),"#808080",1.5);
    }
    traplotCTX.fillStyle = "#00FF00";
    traplotCTX.fillText("Next Pillar", totalScale*next_pillar_xy[0]+10, -next_pillar_xy[1]*totalScale-10);
    pointPlot(totalScale*next_pillar_xy[0], -next_pillar_xy[1]*totalScale,"#00FF00",2.5);
}
function ctxClear() {
    traplotCTX.clearRect(-graphCanvas.width*0.5, -graphCanvas.height*0.75, graphCanvas.width*2, graphCanvas.height*2);
    setupTraplot();
}
function setupTraplot() {
    traplotCTX.fillStyle = "#FFFFFF"
    traplotCTX.fillRect(0, -transY, 1, graphCanvas.height);
    traplotCTX.fillRect(-transX, 0, graphCanvas.width, 1);
}
function trajectory(x,x0,y0,v0,ay,theta) {
    theta = theta * (Math.PI/180);
    y = y0 + ( Math.tan(theta) * (x-x0) ) + ( (ay/(2*(v0**2))) *  (1+((Math.tan(theta))**2)) * ((x-x0)**2) );
    return [x,-y];
}
function pointPlot(x, y,hexColor,pointSize) {
    traplotCTX.strokeStyle = hexColor;
    traplotCTX.fillStyle = hexColor;
    traplotCTX.beginPath();
    traplotCTX.arc(x, y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
    traplotCTX.fill(); // Close the path and fill.
    traplotCTX.stroke();
}