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

me.x = window.innerWidth-100;
me.y = 200.0;
me.dx = 0.0;
me.dy = 0.0;

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
  if(k.which==SPACE) {
    console.log(me.x, me.y, me.dx, me.dy);
  }
}

function render(time){
  if(!window.old_time) {
    old_time = time;
  }
  dt = time-old_time;
  if(dt>200.0) { //animation is not active
    dt = 16.0;
  }
  old_time = time;
  
  if(keys_pressed[UP]) {
    if(me.y<10.0 && Math.abs(me.dy)<0.1) {
      me.dy += me.dy>0.0 ? 0.1 : -0.1;
    }
  }
  if(keys_pressed[DOWN]) {
    if(me.y<10.0 && Math.abs(me.dy)>0.05) {
      me.dy *= 0.5;
      if(Math.abs(me.dy)<0.02) me.dy = 0.0;
    }
  }
  if(keys_pressed[LEFT]) {
    if(me.y<10.0 && me.dx>-0.2) me.dx += -0.03;
  }
  if(keys_pressed[RIGHT]) {
    if(me.y<10.0 && me.dx<0.2) me.dx += 0.03;
  }
  
  if(me.y>0.0) {
    me.dy -= 0.0005*dt;
  }
  if(me.y<10.0) {
    if(me.dx<0.005 && me.dx>-0.005) { //slow to zero in x-direction
      me.dx = 0.0;
    }
    else { //apply friction
      me.dx -= (me.dx>0 ? 0.0005 : -0.0005)*dt;
    }
  }
  me.x += me.dx*dt; //integrate
  me.y += me.dy*dt;
  if(me.y<0.0) { //bounce off ground
    me.y = 0.0;
    if(me.dy<0.0) me.dy *= -0.4;
  }
  if(me.x<0.0) { //bounce off left wall
    me.x = 0.0;
    if(me.dx<0.0) me.dx *= -0.8;
  }
  if(me.x>window.innerWidth-me.offsetWidth) { //bounce off right wall
    me.x = window.innerWidth-me.offsetWidth;
    if(me.dx>0.0) me.dx *= -0.8;
  }
  if(me.y<2.0 && me.dy<0.005 && me.dy>-0.005) { //stop bounce in y-direction
    me.y = 0.0
    me.dy = 0.0;
  }
  me.style.left = (me.x+0.5|0)+'px'; //update screen image
  me.style.bottom = (me.y+0.5|0)+'px';
  requestAnimationFrame(render);
}
requestAnimationFrame(render);


