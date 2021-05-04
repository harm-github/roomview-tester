export class Configurator {
  _wallHeightPx = 639;
  availableRooms = [];

  set product(parts) {
    this._product = {
      heightMm: parts[0],
      widthMm: parts[1]
    }
  }

  set config(value) {
    try {
      const config = eval('(' + value + ')');
      if (Object.keys(this._product).length > 0) {
        this.calculateAvailableSpaces(config);
      }
    } catch (e) {
      alert(e);
    }
  }

  calculateAvailableSpaces(config) {
    const productData = this._product;
    const availableRooms = [];
    for (const group in config.rooms) {
      const sorted = config.rooms[group].sort((a, b) => {
        return a.wallHeight.cm - b.wallHeight.cm
      });
      sorted.forEach((room, i) => {
        const minWorkSize = typeof room.minWorkSize !== 'undefined' ? room.minWorkSize : config.minWorkSize;
        const cmPerPixel = room.wallHeight.cm / this._wallHeightPx;
        const height = (productData.heightMm / 10) / cmPerPixel;
        const width = (productData.widthMm / 10) / cmPerPixel;
        const ratio = productData.heightMm / productData.widthMm;
        const horizontalSpace = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]);
        const verticalSpace = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]);
        let isValid = (height < verticalSpace && width < horizontalSpace) && (height > (minWorkSize * verticalSpace) && width > (minWorkSize * horizontalSpace));
        if (ratio < .55) { // barely panorama
          isValid = height < verticalSpace && width < horizontalSpace && width > (minWorkSize * horizontalSpace) && height > (.4 * verticalSpace);
        }
        if (ratio < .3) { // very panorama
          isValid = height < verticalSpace && width < horizontalSpace && width > (minWorkSize * horizontalSpace) && height > (.15 * verticalSpace);
        }
        if (ratio > 1.5) { // portrait
          isValid = height < verticalSpace && width < horizontalSpace && height > (minWorkSize * verticalSpace) && width > (.4 * horizontalSpace);
        }
        if (isValid) {
          availableRooms.push(room);
        }
      });
    }
    this.availableRooms = availableRooms;
  }

  updateProduct(room) {
    const el = this.shadowRoot.querySelector('.work');
    const conversion = room.wallHeight.cm / this.wallHeightPx;
    const spaceHeight = (room.availableSpace.rightBottom[1] - room.availableSpace.leftTop[1]);
    const spaceWidth = (room.availableSpace.rightBottom[0] - room.availableSpace.leftTop[0]);
    const width = Number(parts[1]) / conversion;
    const height = Number(parts[0]) / conversion;
    el.style.cssText = `
            width: ${width}px;
            height: ${height}px;
            left: ${this._config.availableSpace.leftTop[0] + (spaceWidth / 2) - (width / 2)}px;
            top: ${this._config.availableSpace.leftTop[1] + (spaceHeight / 2) - (height / 2)}px;
        `;
  }
}