module.exports = {
  range: function (first, second) {
    const end = !second ? first : second;
    const start = second ? first : 0;

    let array = [];
    for(let i = start; i < end; ++i) {
      array.push(i);
    }
    return array;
  }
}
