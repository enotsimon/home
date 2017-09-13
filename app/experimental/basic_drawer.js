
import Util from "common/util";
import Color from "common/color";
import * as d3 from "d3";
import App from 'experimental/components/app';
import ReactDOM from 'react-dom';
import React from 'react';
import * as PIXI from "pixi.js";

export default class BasicDrawer {
  constructor(regime) {
    this.real_size = 800;
    this.regime = regime;
    this.ticks = 0;
    this.tick_delay = 0;
    this.basic_interval = 25;
    this.tick_speed = 1;
    document.addEventListener('DOMContentLoaded', () => {
      ReactDOM.render(<App />, document.querySelector('#app'));
      this.init();
    });
  }

  init() {
    this.pixi = new PIXI.Application(this.real_size, this.real_size, {
      backgroundColor : Color.to_pixi([0, 0, 0]),
      antialias: true,
      view: document.getElementById('view'),
    });
    this.pixi.stage.interactive = true; // ??
    console.log('renderer', this.pixi.renderer);

    this.base_container = new PIXI.Container();
    if (this.regime == 'square') {
      // square map is 100x100 size
      this.size = 100;
      let scale = this.real_size/this.size | 0;
      this.base_container.scale = {x: scale, y: scale};
    } else if (this.regime == 'circle') {
      // circle map is circle with radils=100, coords from -100 to 100
      this.size = 200;
      let scale = this.real_size/this.size | 0;
      this.base_container.scale = {x: scale, y: scale};
      this.base_container.position.x = this.real_size / 2 | 0;
      this.base_container.position.y = this.real_size / 2 | 0;
    } else if (!this.regime) {
      throw('regime is not set');
    } else {
      throw('unknown regime: '+regime);
    }

    this.pixi.stage.addChild(this.base_container);
    document.getElementById('view_container').appendChild(this.pixi.view);

    // copy-paste from Interation
    document.addEventListener('mousemove', this.mouse_move_handler.bind(this), false);
    
    this.ticks = 0; // here?
    this.pixi.ticker.add(() => {
      // this prevents from leaps on pixi FPS peaks
      this.tick_delay += this.pixi.ticker.elapsedMS;
      if (this.tick_delay >= this.basic_interval / this.tick_speed) {
        this.ticks++;
        if (this.ticks % 10 == 0) {
          d3.select('#fps_counter').html(this.pixi.ticker.FPS | 0);
        }
        this.tick_delay = 0;
        this.redraw();
      }
    });
    //////////////////////////////////
    this.init_graphics();
  }

  clear_all() {
    this.base_container.removeChildren();
  }

  init_graphics() {
    
  }

  redraw() {
    
  }






  mouse_move_handler(event) {
    if (event.target != this.pixi.view) {
      return false;
    }
    let mouse_coords = this.get_mouse_coords(event);
    d3.select('#mouse_pos').html('{x: '+mouse_coords.x+', y: '+mouse_coords.y+'}');
  }

  get_mouse_coords(event) {
    return {x: event.offsetX, y: event.offsetY};
  }
}
