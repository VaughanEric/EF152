var vel_range = document.getElementById("input_vel"),
    ang_range = document.getElementById("vel_angle");
var vel_disp = document.getElementById("vel_disp"),
    ang_disp = document.getElementById("ang_disp");
vel_disp.innerHTML = vel_range.value;
ang_disp.innerHTML = ang_range.value;
vel_range.oninput = function() {
    vel_disp.innerHTML = this.value;
}
ang_range.oninput = function() {
    ang_disp.innerHTML = this.value;
}