const Bar = require('./bar');

function Stomach(game, outerMeterDimensions) {
  const stomachGroup = game.make.group();

  const padding = 1;
  const meterDimensions = {
    x: outerMeterDimensions.x + padding,
    y: outerMeterDimensions.y + padding,
    w: outerMeterDimensions.w - padding * 2,
    h: outerMeterDimensions.h - padding * 2
  }

  const outerBar = Bar(game, outerMeterDimensions, 0x00FF00);
  const innerBar = Bar(game, meterDimensions, 0xFF0000);

  stomachGroup.add(outerBar);
  stomachGroup.add(innerBar);

  return {
    render: function({ maxFullness, fullness }) {
      innerBar.width = (fullness / maxFullness) * meterDimensions.w;
    },
    group: stomachGroup
  }
};

module.exports = Stomach;
