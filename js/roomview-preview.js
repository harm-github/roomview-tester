export const roomviewPreview = customElements.define('roomview-preview', class extends HTMLElement {
  constructor() {
    super();

    this._config = {};
    this.wallHeightPx = 639;
  }

  clear() {
    this.shadowRoot.querySelector('.background').style.backgroundImage = ``;
    this.shadowRoot.querySelectorAll('.background *').forEach(el => {
      el.style.display = 'none';
    });
  }

  setRoom(room, productData) {
    this.shadowRoot.querySelector('.background').style.backgroundImage = `url(${room.img})`;
    const cmPerPixel = room.wallHeight.cm / this.wallHeightPx;
    const productHeight = (productData.heightMm / 10) / cmPerPixel;
    const productWidth = (productData.widthMm / 10) / cmPerPixel;
    const productRatio = productHeight / productWidth;
    const horizontalSpace = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]);
    const verticalSpace = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]);
    const workCenterHorizontal = room.availableSpace.leftTop[0] + (horizontalSpace/2);
    const workCenterVertical = room.availableSpace.leftTop[1] + (verticalSpace/2);
    const posX = workCenterHorizontal - ((productWidth )/2);
    const posY = workCenterVertical - (productHeight/2);

    this.calculateAvailableSpace(room);

    this.shadowRoot.querySelector('.work').style.cssText = `
      height: ${productHeight}px;
      width: ${productWidth}px;
      left: ${posX}px;
      top: ${posY}px;
    `;

    if (productRatio >= 1.5) {
      return this.calculatePortraitException(room);
    } else if (productRatio <= .55) {
      return this.calculateWideException(room)
    } else if (productRatio <= .3) {
      return this.calculatePanoramaException(room);
    }

    return this.calculateWorkSize(room);
  };

  set config(value) {
    try {
      if (typeof value === 'object') {
        this._config = value;
      } else {
        this._config = eval('(' + value + ')');
      }
    } catch (e) {
      this.shadowRoot.querySelector('.error').hidden = false;
      return;
    }
    const config = this._config;
    this.shadowRoot.querySelector('.error').hidden = true;
    this.shadowRoot.querySelector('.background').style.backgroundImage = `url(${config.img})`;
    this.calculateAvailableSpace(config);
    this.calculateWorkSize(config);
    this.calculateWideException(config);
    this.calculatePanoramaException(config);
    this.calculatePortraitException(config);
  }

  set exception(value) {
    this.shadowRoot.querySelectorAll('.exception-size, .work-size').forEach(el => {
      el.style.display = 'none';
    });
    if (value === '') {
      this.shadowRoot.querySelector('.work-size').style.display = 'block';
      return;
    }
    this.shadowRoot.querySelector(`.exception-${value}`).style.display = 'block';
  }

  set product(parts) {
    const el = this.shadowRoot.querySelector('.work');
    const room = this._config;
    const conversion = room.wallHeight.cm / this.wallHeightPx;
    const spaceHeight = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]);
    const spaceWidth = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]);
    const width = Number(parts[1]/10) / conversion;
    const height = Number(parts[0]/10) / conversion;
    el.style.cssText = `
        width: ${width}px;
        height: ${height}px;
        left: ${this._config.availableSpace.leftTop[0] + (spaceWidth / 2) - (width / 2)}px;
        top: ${this._config.availableSpace.leftTop[1] + (spaceHeight / 2) - (height / 2)}px;
      `
  }

  calculateAvailableSpace(room) {
    const el = this.shadowRoot.querySelector('.available-space');
    const height = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]);
    const width = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]);
    const conversion = room.wallHeight.cm / this.wallHeightPx;
    el.innerHTML = `${Math.round(width * conversion)}cm x ${Math.round(height * conversion)}cm`;
    el.style.cssText = `
            height: ${room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]}px;
            width: ${room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]}px;
            left: ${room.availableSpace.leftTop[0]}px;
            top: ${room.availableSpace.leftTop[1]}px;
        `;
  }

  calculateWorkSize(room) {
    const el = this.shadowRoot.querySelector('.work-size');
    const minWorkSize = typeof room.minWorkSize !== 'undefined' ? room.minWorkSize : .7;
    const height = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]);
    const width = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]);
    const workHeight = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]) * minWorkSize;
    const workWidth = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]) * minWorkSize;
    const conversion = room.wallHeight.cm / this.wallHeightPx;
    el.innerHTML = `${Math.round(workWidth * conversion)}cm x ${Math.round(workHeight * conversion)}cm`;
    el.style.cssText = `
            height: ${workHeight}px;
            width: ${workWidth}px;
            left: ${room.availableSpace.leftTop[0] + ((width - workWidth) / 2)}px;
            top: ${room.availableSpace.leftTop[1] + ((height - workHeight) / 2)}px;
        `;
  }

  calculateWideException(room) {
    const el = this.shadowRoot.querySelector('.exception-wide');
    const minWorkSize = typeof room.minWorkSize !== 'undefined' ? room.minWorkSize : .7;
    const height = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]);
    const width = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]);
    const workHeight = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]) * .4;
    const workWidth = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]) * minWorkSize;
    const conversion = room.wallHeight.cm / this.wallHeightPx;
    el.innerHTML = `${Math.round(workWidth * conversion)}cm x ${Math.round(workHeight * conversion)}cm`;
    el.style.cssText = `
            height: ${workHeight}px;
            width: ${workWidth}px;
            left: ${room.availableSpace.leftTop[0] + ((width - workWidth) / 2)}px;
            top: ${room.availableSpace.leftTop[1] + ((height - workHeight) / 2)}px;
            display: block;
        `;
  }

  calculatePanoramaException(room) {
    const el = this.shadowRoot.querySelector('.exception-panorama');
    const minWorkSize = typeof room.minWorkSize !== 'undefined' ? room.minWorkSize : .7;
    const height = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]);
    const width = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]);
    const workHeight = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]) * .15;
    const workWidth = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]) * minWorkSize;
    const conversion = room.wallHeight.cm / this.wallHeightPx;
    el.innerHTML = `${Math.round(workWidth * conversion)}cm x ${Math.round(workHeight * conversion)}cm`;
    el.style.cssText = `
            height: ${workHeight}px;
            width: ${workWidth}px;
            left: ${room.availableSpace.leftTop[0] + ((width - workWidth) / 2)}px;
            top: ${room.availableSpace.leftTop[1] + ((height - workHeight) / 2)}px;
            display: block;
        `;
  }

  calculatePortraitException(room) {
    const el = this.shadowRoot.querySelector('.exception-portrait');
    const minWorkSize = typeof room.minWorkSize !== 'undefined' ? room.minWorkSize : .7;
    const height = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]);
    const width = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]);
    const workHeight = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]) * minWorkSize;
    const workWidth = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]) * .4;
    const conversion = room.wallHeight.cm / this.wallHeightPx;
    el.innerHTML = `${Math.round(workWidth * conversion)}cm x ${Math.round(workHeight * conversion)}cm`;
    el.style.cssText = `
            height: ${workHeight}px;
            width: ${workWidth}px;
            left: ${room.availableSpace.leftTop[0] + ((width - workWidth) / 2)}px;
            top: ${room.availableSpace.leftTop[1] + ((height - workHeight) / 2)}px;
            display: block;
        `;
  }

  template() {
    return `
          <div class="background">
            <div class="error" hidden>Config contains an error</div>
            <div class="available-space"></div>
            <div class="work-size"></div>
            <div class="exception-wide exception-size"></div>
            <div class="exception-panorama exception-size"></div>
            <div class="exception-portrait exception-size"></div>
            <div class="work"></div>
          </div>
        `
  }

  css() {
    return `
            .background {
                width: 1058.5px;
                height: 639px;
                background-position: top;
                background-repeat: no-repeat;
                background-size: auto 100%;
                position: relative;
                font-size: .8rem;
                color: white;
            }
            .available-space {
                background-color: #00ff00aa;
                position: absolute;
                z-index: 1;
            }
            .work-size {
                background-color: #f00;
                position: absolute;
                z-index: 2;
            }
            .exception-size {
                background-color: #f00;
                position: absolute;
                z-index: 3;
                display: none;
            }
            .work {
                background-color: #0000ffaa;
                position: absolute;
                z-index: 4;

            }
            .error {
                padding: .5rem;
                color: white;
                background: red;
                text-align: center;
            }
        `
  }

  connectedCallback() {
    this.attachShadow({mode: 'open'});

    const style = document.createElement('style');
    style.textContent = this.css();
    this.shadowRoot.appendChild(style);

    const template = document.createElement('template');
    template.innerHTML = this.template();
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
});