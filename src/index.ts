(() => {
  const canvas = <HTMLCanvasElement>document.createElement('canvas');
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';

  const points: Point[] = [];

  enum PolygonState {
    POLYGON_OUTER,
    POLYGON_INNER,
    POLYGON_DONE,
  }

  class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    nearBy(p2: Point): boolean {
      return Math.abs(p2.x - this.x) < 3 && Math.abs(p2.y - this.y) < 3;
    }

    draw() {
      ctx.fillRect(this.x, this.y, 3, 3);
    }
  }

  class Polygon {
    outerPoints: Point[];
    innerPoints: Point[];

    state: PolygonState;

    constructor(outerPoints: Point[] = [], innerPoints: Point[] = []) {
      this.outerPoints = outerPoints.slice();
      this.innerPoints = innerPoints.slice();
      this.state = PolygonState.POLYGON_OUTER;
    }

    drawBorder() {
      {
        ctx.beginPath();
        const n = this.outerPoints.length;
        for (let i = 0; i < n; ++i) {
          ctx.moveTo(this.outerPoints[i].x, this.outerPoints[i].y);
          ctx.lineTo(
              this.outerPoints[(i + 1) % n].x, this.outerPoints[(i + 1) % n].y);
        }
        ctx.stroke();
      }
      {
        ctx.beginPath();
        const n = this.innerPoints.length;
        for (let i = 0; i < n; ++i) {
          ctx.moveTo(this.innerPoints[i].x, this.innerPoints[i].y);
          ctx.lineTo(
              this.innerPoints[(i + 1) % n].x, this.innerPoints[(i + 1) % n].y);
        }
        ctx.stroke();
      }
    }

    fill(color = new Color(0, 0, 0)) {
      if (this.state !== PolygonState.POLYGON_DONE) {
        return;
      }

      ctx.fillStyle = color.toString();

      let [minX, minY, maxX, maxY] = [width, height, 0, 0];
      for (const point of this.outerPoints) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }

      --minX;
      --minY;
      ++maxX;
      ++maxY;

      const mw = maxX - minX + 1;
      const mh = maxY - minY + 1;
      const signMap = (new Uint8Array(mw * mh)).fill(0);

      function doSign(points: Point[]) {
        const n = points.length;
        if (n < 3) {
          return;
        }

        for (let i = 0; i < n; ++i) {
          const pl = points[(i + n - 1) % n];
          const p = points[i];
          const pr = points[(i + 1) % n];

          if ((pl.y <= p.y && p.y < pr.y) || (pl.y > p.y && p.y >= pr.y)) {
            signMap[(p.y - minY) * mw + (p.x - minX)] += 1;
          } else {
            signMap[(p.y - minY) * mw + (p.x - minX)] += 2;
          }

          if (p.y === pr.y) {
            const [st, end] = (p.x < pr.x) ? [p.x, pr.x] : [pr.x, p.x];
            for (let j = st + 1; j < end; ++j) {
              signMap[(p.y - minY) * mw + j - minX] += 2;
            }
          } else {
            const k = (pr.x - p.x) / (pr.y - p.y);
            let [st, end, x1] =
                (p.y < pr.y) ? [p.y, pr.y, p.x] : [pr.y, p.y, pr.x];
            for (let j = st + 1; j < end; ++j) {
              x1 += k;
              signMap[(j - minY) * mw + Math.floor(x1) - minX] += 1;
            }
          }
        }
      }

      doSign(this.outerPoints);
      doSign(this.innerPoints);

      for (let i = minY; i <= maxY; ++i) {
        let inside = false;
        for (let j = minX; j <= maxX; ++j) {
          const sign = signMap[(i - minY) * mw + (j - minX)];
          if (sign % 2 === 1) {
            inside = !inside;
          }
          if (inside) {
            drawPixel(j, i);
          }
        }
      }
    }
  }

  let poly = new Polygon();

  let focus: Point|null = null;

  class Color {
    r: number;
    g: number;
    b: number;

    constructor(r: number, g: number, b: number) {
      this.r = r;
      this.g = g;
      this.b = b;
    }

    toString(): string {
      return `rgb(${this.r},${this.g},${this.b})`;
    }
  }

  function drawPixel(x: number, y: number) {
    ctx.fillRect(x, y, 1, 1);
  }

  let repaint_flag = false;
  function repaint() {
    if (repaint_flag === false) {
      repaint_flag = true;
      setTimeout(() => {
        repaint_flag = false;
      }, 20);
    } else {
      return;
    }

    ctx.clearRect(0, 0, width, height);

    if (poly.state !== PolygonState.POLYGON_DONE && points.length >= 1) {
      ctx.beginPath();
      const n = points.length;
      for (let i = 0; i < n - 1; ++i) {
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
      }
      ctx.moveTo(points[n - 1].x, points[n - 1].y);
      ctx.lineTo(focus.x, focus.y);
      ctx.stroke();
    }

    if (poly) {
      poly.drawBorder();
      if (poly.state === PolygonState.POLYGON_DONE) {
        poly.fill();
      }
    }
  }

  canvas.addEventListener('mousemove', (event) => {
    focus = new Point(event.pageX, event.pageY);
    repaint();
  });

  canvas.addEventListener('contextmenu', (event) => {
    if (poly.state === PolygonState.POLYGON_OUTER) {
      poly.state = PolygonState.POLYGON_INNER;
      poly.outerPoints = points.slice();
    } else if (poly.state === PolygonState.POLYGON_INNER) {
      poly.state = PolygonState.POLYGON_DONE;
      poly.innerPoints = points.slice();
    } else {
      return;
    }
    points.length = 0;
    event.preventDefault();
    repaint();
  });

  canvas.addEventListener('click', (event) => {
    points.push(new Point(event.pageX, event.pageY));
    repaint();
  });
})();
