(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var me = document.createElement('div');
me.innerHTML = '@';
document.body.appendChild(me);

me.style.position = 'absolute';
me.style.color = 'red';

me.x = 100;
me.y = 200.0;
me.dx = 0.0;
me.dy = 0.0;

EMPTY = 0; WALL = 1;
map = [];
S_shift = 3;
S = 2<<(S_shift-1); //map discretization
for(var x=0; x<window.innerWidth>>S_shift; x++) {
  map[x] = [];
  for(var y=0; y<window.innerHeight>>S_shift; y++) {
    map[x][y] = EMPTY;
  }
}

SW = window.innerWidth>>S_shift;
SH = window.innerHeight>>S_shift;

var request=new XMLHttpRequest();
request.open("GET","js/script.js",false);
request.send(null);
var code_lines = request.responseText.split('\n');
for(var i=0; i<100; i++) {
  var mx = Math.random()*(SW-20)|0;
  var my = Math.random()*(SH-5)|0;
  var block = document.createElement('div');
  block.style.position = 'absolute';
  block.style.left = (mx*S)+'px';
  block.style.bottom = (my*S)+'px';
  block.innerHTML = code_lines[i].slice(0,20);
  document.body.appendChild(block);
  var mw = block.offsetWidth>>S_shift;
  var mh = block.offsetHeight>>S_shift;
  for(var x=mx; x<mx+mw; x++) {
    for(var y=my; y<my+mh; y++) {
      map[x][y] = WALL;
    }
  }
  /*mx += (10 - Math.random()*20 + 0.5)|0;
  my += (1 - Math.random()*5 + 0.5)|0;
  if(mx<0) x=0;  if(my<0) my=0;
  if(mx>SW-20) mx=SW-20;  if(my>SH-5) mx=SH-5;*/
}

UP = 38; DOWN = 40; LEFT = 37; RIGHT = 39;
SPACE = 32;
keys_pressed = [];
for(var i=0; i<256; i++) {
  keys_pressed[i] = false;
}
window.onkeyup = function(k) {
  keys_pressed[k.which] = false;
}
window.onkeydown = function(k) {
  keys_pressed[k.which] = true;
  //console.log(k.which);
}

var ground_bounce = -0.2;

function render(time){
  if(!window.old_time) {
    old_time = time;
  }
  dt = time-old_time;
  if(dt>200.0) { //animation is not active
    dt = 16.0;
  }
  old_time = time;
  
  var standing = me.y<0.5 || (map[me.x>>S_shift][(me.y-0.5)>>S_shift]!=EMPTY);
  var near_standing = me.y<5.0 || (map[me.x>>S_shift][(me.y-5.0)>>S_shift]!=EMPTY);
  
  if(keys_pressed[UP]) {
    if(near_standing) {
      me.dy = 0.3;
    }
    if(!near_standing && me.dx<0.2) { //fall slower
      //me.dy += 0.0002*dt;
    }
  }
  if(keys_pressed[DOWN]) {
    if(near_standing) {
      me.dx *= 0.8; me.dy *= 0.8;
      if(Math.abs(me.dx)<0.02) me.dx = 0.0;
      if(Math.abs(me.dy)<0.02) me.dy = 0.0;
    }
    if(!near_standing && me.dx>-0.2) { //fall faster
      me.dy -= 0.0002*dt;
    }
  }
  if(keys_pressed[LEFT]) {
    if(near_standing && me.dx>-0.2) me.dx -= 0.003*dt;
    if(!near_standing && me.dx>-0.2) { //directional fall
      me.dx -= 0.0002*dt;
    }
  }
  if(keys_pressed[RIGHT]) {
    if(near_standing && me.dx<0.2) me.dx += 0.003*dt;
    if(!near_standing && me.dx<0.2) { //directional fall
      me.dx += 0.0002*dt;
    }
  }
  if(keys_pressed[SPACE]) {
    console.log(me.x,me.y);
  }
  if(!standing) { //gravity
    me.dy -= 0.001*dt;
  }
  if(near_standing) {
    if(Math.abs(me.dx) < 0.002*dt) { //zero out x-velocity
      me.dx = 0.0;
    }
    else { //apply friction
      me.dx -= (me.dx>0.0 ? 0.002 : -0.002)*dt;
    }
  }
  
  if(Math.abs(me.dx*dt)>S) {//speed limit, for collision testing
    me.dx = me.dx>0.0 ? S/dt : -S/dt;
  }
  if(Math.abs(me.dy*dt)>S) {//speed limit, for collision testing
    me.dy = me.dy>0.0 ? S/dt : -S/dt;
  }
  
  var new_x = me.x + me.dx*dt;
  var new_y = me.y + me.dy*dt;
  
  if(new_y<0.0) { //bounce off ground
    me.y = 0.0;
    if(me.dy<0.0) me.dy *= ground_bounce;
    if(Math.abs(me.dy)<0.05) me.dy = 0.0;
  }
  if(new_y>window.innerHeight-me.offsetHeight) { //bounce off ceiling
    me.y = window.innerHeight-me.offsetHeight;
    if(me.dy>0.0) me.dy *= ground_bounce;
  }
  if(new_x<0.0) { //bounce off left wall
    me.x = 0.0;
    if(me.dx<0.0) me.dx *= -0.8;
  }
  if(new_x>window.innerWidth-me.offsetWidth) { //bounce off right wall
    me.x = window.innerWidth-me.offsetWidth;
    if(me.dx>0.0) me.dx *= -0.8;
  }
  
  if(near_standing && me.dy<0.0) { //bounce off platform from above
    me.dy *= ground_bounce;
    if(Math.abs(me.dy)<0.05) me.dy = 0.0;
  }
  if(map[me.x>>S_shift][(me.y+10.0)>>S_shift]!=EMPTY && me.dy>0.0) { //bounce off platform from below
    me.dy *= ground_bounce;
  }
  if((me.x+15.0<window.innerWidth-S && map[(me.x+15.0)>>S_shift][me.y>>S_shift]!=EMPTY && me.dx>0.0) ||
     (me.x-5.0>0.0 && map[(me.x-5.0)>>S_shift][me.y>>S_shift]!=EMPTY && me.dx<0.0)) { //bounce off platform from sides
    me.dx *= ground_bounce;
  }
  
  me.x += me.dx*dt;
  me.y += me.dy*dt;
  
  me.style.left = (me.x+0.5|0)+'px'; //update screen image
  me.style.bottom = (me.y+0.5|0)+'px';
  requestAnimationFrame(render);
}
requestAnimationFrame(render);


