function getRandom(min = 0, max = 100) {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a)) + a;
}

export default getRandom;
