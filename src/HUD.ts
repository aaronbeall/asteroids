import { Game } from './Game';

export interface HUDState {
  playerHealth: number;
  playerMaxHealth: number;
}

export class HUD {
  el!: HTMLDivElement;
  canvas!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D;

  constructor(public game: Game) {
    this.el = document.createElement('div');
    this.el.style.cssText = 'position: absolute; left: 0; top: 0; pointer-events: none; width: 100%; height: 100%;';

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.game.viewport.width;
    this.canvas.height = this.game.viewport.height;
    this.canvas.style.cssText = 'width: 100%; height: 100%; display: block; position: absolute; left: 0; top: 0;';

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('2D context not available');
    this.ctx = ctx;

    this.el.appendChild(this.canvas);

    // attach to game's container
    this.game.container.style.position = this.game.container.style.position || 'relative';
    this.game.container.appendChild(this.el);
  }

  resize() {
    this.canvas.width = this.game.viewport.width;
    this.canvas.height = this.game.viewport.height;
  }

  update(state: HUDState) {
    // clear the overlay
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const padding = 12;
    this.drawHealth(state, padding);

    // if the player is dead, show a centered message
      if (state.playerHealth <= 0) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.ctx.save();
        this.ctx.textAlign = 'center';

        // Prepare texts
        const title = '💀 You died';
        const subtitle = 'Press Enter to play again';
        this.ctx.font = '28px sans-serif';
        const titleW = this.ctx.measureText(title).width;
        this.ctx.font = '16px sans-serif';
        const subW = this.ctx.measureText(subtitle).width;
        const panelW = Math.max(titleW, subW) + 40;
        const panelH = 64;

        // draw red rounded panel
        const px = centerX - panelW / 2;
        const py = centerY - panelH / 2;
        const r = 8;
        this.ctx.fillStyle = '#b71c1c';
        this.ctx.beginPath();
        this.ctx.moveTo(px + r, py);
        this.ctx.lineTo(px + panelW - r, py);
        this.ctx.quadraticCurveTo(px + panelW, py, px + panelW, py + r);
        this.ctx.lineTo(px + panelW, py + panelH - r);
        this.ctx.quadraticCurveTo(px + panelW, py + panelH, px + panelW - r, py + panelH);
        this.ctx.lineTo(px + r, py + panelH);
        this.ctx.quadraticCurveTo(px, py + panelH, px, py + panelH - r);
        this.ctx.lineTo(px, py + r);
        this.ctx.quadraticCurveTo(px, py, px + r, py);
        this.ctx.closePath();
        this.ctx.fill();

        // draw text
        this.ctx.fillStyle = 'white';
        this.ctx.font = '28px sans-serif';
        this.ctx.fillText(title, centerX, centerY - 6);
        this.ctx.font = '16px sans-serif';
        this.ctx.fillText(subtitle, centerX, centerY + 18);
        this.ctx.restore();
    }
  }

  drawHealth(state: HUDState, padding = 12) {
    const barWidth = 120;
    const barHeight = 18;
    const segments = state.playerMaxHealth || 1;
    const segWidth = (barWidth - (segments - 1) * 6) / segments;
    const healthX = this.canvas.width - padding - barWidth;
    const y = padding;

    for (let i = 0; i < segments; i++) {
      const sx = healthX + i * (segWidth + 6);
      if (i < state.playerHealth) {
        // choose color based on remaining health
        const remaining = state.playerHealth;
        let color = '#6ee36e'; // green
        if (remaining === state.playerMaxHealth) color = '#6ee36e';
        else if (remaining === state.playerMaxHealth - 1) color = '#ffd24d'; // yellow
        else if (remaining === state.playerMaxHealth - 2) color = '#ff9a3c'; // orange
        else color = '#ff5c5c'; // red
        this.ctx.fillStyle = color;
      } else {
        this.ctx.fillStyle = '#333';
      }
      this.ctx.fillRect(sx, y, segWidth, barHeight);
      // segment border
      this.ctx.strokeStyle = '#000';
      this.ctx.strokeRect(sx, y, segWidth, barHeight);
    }

    // health label
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'right';
    this.ctx.fillText('Health', healthX + barWidth, y + barHeight + 12);
    this.ctx.textAlign = 'left';
  }
}
