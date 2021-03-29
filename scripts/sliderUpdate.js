var vel_range = document.getElementById("input_vel"),
    ang_range = document.getElementById("vel_angle");
var vel_disp = document.getElementById("vel_disp"),
    ang_disp = document.getElementById("ang_disp");
var difficulty_range = document.getElementById("difficulty_input"),
    totalPillar_range = document.getElementById("totalPillar_input"),
    totalLvls_range = document.getElementById("totalLevels_input");
var difficulty_disp = document.getElementById("difficulty_disp"),
    pillarNum_disp = document.getElementById("totalPillar_disp"),
    levelAmt_disp = document.getElementById("totalLevels_disp");
vel_disp.innerHTML = vel_range.value;
ang_disp.innerHTML = ang_range.value;
vel_range.oninput = function() {
    vel_disp.innerHTML = this.value;
}
ang_range.oninput = function() {
    ang_disp.innerHTML = this.value;
}
difficulty_range.oninput = function() {
    difficulty_disp.innerHTML = this.value;
}
totalPillar_range.oninput = function() {
    pillarNum_disp.innerHTML = this.value;
}
totalLvls_range.oninput = function() {
    levelAmt_disp.innerHTML = this.value;
}