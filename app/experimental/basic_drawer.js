
import Util from "common/util";
import Color from "common/color";
import * as d3 from "d3";
import App from 'experimental/components/app';
import ReactDOM from 'react-dom';
import React from 'react';
import * as PIXI from "pixi.js";

export default class BasicDrawer {
  constructor(regime) {
    this.size = 800;
    this.regime = regime;
    this.ticks = 0;
    this.delay = 0;
    this.basic_interval = 100;
    this.speed = 1;

    document.addEventListener('DOMContentLoaded', () => {
      ReactDOM.render(<App />, document.querySelector('#app'));
      this.init();
    });
  }

  init() {
    //let PIXI = require('pixi.js');
    this.pixi = new PIXI.Application(this.size, this.size, {
      backgroundColor : Color.to_pixi([0, 0, 0]),
      antialias: true,
      view: document.getElementById('view'),
    });
    this.pixi.stage.interactive = true; // ??
    console.log('renderer', this.pixi.renderer);

    this.base_container = new PIXI.Container();
    if (this.regime == 'square') {
      // do nothing
    } else if (this.regime == 'circle') {
      this.base_container.position.x = this.size / 2 | 0;
      this.base_container.position.y = this.size / 2 | 0;
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
      this.delay += 100; // DEBUG! set pixi.delay here
      this.ticks++;
      if (this.ticks % 10 == 0) {
        d3.select('#fps_counter').html(this.pixi.ticker.FPS | 0);
      }
      if (this.delay >= this.basic_interval * this.speed) {
        this.delay = 0;
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
