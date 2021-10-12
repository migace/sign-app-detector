import { LitElement, html } from "lit-element";

class DrawableBox extends LitElement {
  static get properties() {
    return {
      id: { type: String },
      reset: { type: Boolean },
    };
  }

  constructor() {
    super();

    this.isPainting = false;
    this.x = [];
    this.y = [];
    this.moves = [];
  }

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
  }

  async firstUpdated() {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));

    this.canvas = this.renderRoot.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = 160;
    this.canvas.height = 160;

    this.addEventListener("mousedown", this._handleMouseDown);
    this.addEventListener("mousemove", this._handleMouseMove);
    this.addEventListener("mouseup", () => {
      this.isPainting = false;
    });
    this.addEventListener("mouseleave", () => {
      this.isPainting = false;

      const myEvent = new CustomEvent("my-event", {
        detail: { id: this.id, vector: this._getVector() },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(myEvent);
    });
  }

  render() {
    return html`
      <div class="w-40 h-40 flex justify-center flex-col">
        <canvas class="border-2 border-gray-300 border-dotted"></canvas>
        ${this.reset
          ? html`<button
              @click=${this._reset}
              class="bg-purple-600 py-1 px-4 text-white mt-2"
            >
              Reset
            </button>`
          : html``}
      </div>
    `;
  }

  _getVector(debug = false) {
    const w = 160;
    const h = 160;
    const p = 160 / 10;
    const xStep = w / p;
    const yStep = h / p;
    const vector = [];

    for (let x = 0; x < w; x += xStep) {
      for (let y = 0; y < h; y += yStep) {
        const data = this.ctx.getImageData(x, y, xStep, yStep);

        let nonEmptyPixelsCount = 0;
        for (let i = 0; i < data.data.length; i += 4) {
          const isEmpty = data.data[i] === 0;

          if (!isEmpty) {
            nonEmptyPixelsCount += 1;
          }
        }

        // if (nonEmptyPixelsCount > 1 && debug) {
        //   cell(x, y, xStep, yStep);
        // }

        vector.push(nonEmptyPixelsCount > 1 ? 1 : 0);
      }
    }

    // if (debug) {
    //   grid();
    // }
    return vector;
  }

  _clear() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  _reset() {
    this._clear();
    this.x = [];
    this.y = [];
    this.moves = [];
  }

  _addPoint(x, y, isMoving) {
    this.x.push(x);
    this.y.push(y);
    this.moves.push(isMoving);
  }

  _redraw() {
    this._clear();
    this.ctx.strokeStyle = "red";
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = 10;

    for (let i = 0; i < this.moves.length; i++) {
      this.ctx.beginPath();
      if (this.moves[i] && i) {
        this.ctx.moveTo(this.x[i - 1], this.y[i - 1]);
      } else {
        this.ctx.moveTo(this.x[i] - 1, this.y[i]);
      }
      this.ctx.lineTo(this.x[i], this.y[i]);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }

  _handleMouseDown(event) {
    if (event.target.tagName.toLowerCase() === "canvas") {
      const bounds = event.target.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;

      this.isPainting = true;
      this._addPoint(x, y, false);
      this._redraw();
    }
  }

  _handleMouseMove(event) {
    if (event.target.tagName.toLowerCase() === "canvas") {
      const bounds = event.target.getBoundingClientRect();
      const x = event.clientX - bounds.left;
      const y = event.clientY - bounds.top;

      if (this.isPainting) {
        this._addPoint(x, y, true);
        this._redraw();
      }
    }
  }
}

customElements.define("drawable-box", DrawableBox);

export { DrawableBox };
