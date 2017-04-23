const Bar = require('./bar');

function Stomach(game, dimensions) {
  const stomachGroup = game.make.group();
  stomachGroup.x = dimensions.x;
  stomachGroup.y = dimensions.y;

  const padding = 1;

  const outerMeterDimensions = {
    x: 0,
    y: 0,
    w: dimensions.w,
    h: dimensions.h
  }

  const meterDimensions = {
    x: 0,
    y: padding,
    w: dimensions.w - padding * 2,
    h: dimensions.h - padding * 2
  }

  const outerBar = Bar(game, outerMeterDimensions, 0x00FF00);
  const innerBar = Bar(game, meterDimensions, 0xFF0000);

  stomachGroup.add(outerBar);
  stomachGroup.add(innerBar);

  return {
    update: function({ maxFullness, fullness }) {
      innerBar.width = (Math.max(fullness, 0) / maxFullness) * meterDimensions.w;
    },
    group: stomachGroup
  }
};

module.exports = Stomach;
