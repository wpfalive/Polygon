(() => {
  function drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillRect(x, y, 1, 1);
  }

  const canvas = <HTMLCanvasElement>document.createElement('canvas');
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, width, height);
})();
