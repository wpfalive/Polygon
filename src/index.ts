(() => {
  const canvas = <HTMLCanvasElement>document.createElement('canvas');
  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';

  let points: Point[] = [];

  enum PolygonState {
    POLYGON_INIT,
    POLYGON_OUTER,
    POLYGON_INNER,
    POLYGON_DONE,
  }

  class Point {
    private _x: number;
    private _y: number;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }

    get x(): number {
      return this._x;
    }

    set x(v: number) {
      this._x = Math.floor(v);
    }

    get y(): number {
      return this._y;
    }

    set y(v: number) {
      this._y = Math.floor(v);
    }

    dis2(p2: Point): number {
      return (p2.x - this.x) * (p2.x - this.x) +
          (p2.y - this.y) * (p2.y - this.y);
    }

    dis(p2: Point): number {
      return Math.sqrt(this.dis2(p2));
    }

    on(p1: Point, p2: Point): boolean {
      return (p1.x - this.x) * (p2.y - this.y) ===
          (p1.y - this.y) * (p2.x - this.x);
    }

    in(poly2: Polygon): boolean {
      const n = poly2.outerPoints.length;
      let angle = 0;
      for (let i = 0; i < n; ++i) {
        const p1 = poly2.outerPoints[i];
        const p2 = poly2.outerPoints[(i + 1) % n];
        const a2 = p1.dis2(p2);
        const b2 = this.dis2(p1);
        const c2 = this.dis2(p2);
        const b = Math.sqrt(b2);
        const c = Math.sqrt(c2);
        const cosv = (b2 + c2 - a2) / (2 * b * c);
        const v = Math.acos(cosv);
        angle += (cross(this, p1, p2) > 0) ? v : -v;
      }

      return Math.abs(angle) > 1e-6;
    }

    equal(p2: Point) {
      return this.x === p2.x && this.y === p2.y;
    }
  }

  function cross(p1: Point, p2: Point, p3: Point): number {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
  }

  function cross2(p1: Point, p2: Point, p3: Point, p4: Point): number {
    return (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  }

  function intersect(p1: Point, p2: Point, p3: Point, p4: Point): Point|null {
    const cross1 = cross(p3, p4, p1);
    const cross2 = cross(p3, p4, p2);
    const cross3 = cross(p1, p2, p3);
    const cross4 = cross(p1, p2, p4);

    let p: Point;
    if (((cross1 > 0 && cross2 < 0) || (cross1 < 0 && cross2 > 0)) &&
        ((cross3 < 0 && cross4 > 0) || (cross3 > 0 && cross4 < 0))) {
      const nx = (p3.x * cross4 - p4.x * cross3) / (cross4 - cross3);
      const ny = (p3.y * cross4 - p4.y * cross3) / (cross4 - cross3);
      p = new Point(nx, ny);
      return p;
    } else if (p1.on(p3, p4)) {
      p = p1;
      return null;
    }
    if (p2.on(p3, p4)) {
      p = p2;
      return null;
    }
    if (p3.on(p1, p2)) {
      p = p3;
      return null;
    }
    if (p4.on(p1, p2)) {
      p = p4;
      return null;
    }

    return null;
  }

  class Polygon {
    outerPoints: Point[];
    innerPoints: Point[];

    state: PolygonState;

    get center(): Point {
      const psum = this.outerPoints.reduce((op, np) => {
        return new Point(op.x + np.x, op.y + np.y);
      });
      const n = this.outerPoints.length;
      return new Point(psum.x / n, psum.y / n);
    }

    get segments(): [Point, Point][] {
      const s: [Point, Point][] = [];
      for (let i = 0; i < this.outerPoints.length; ++i) {
        s.push([
          this.outerPoints[i],
          this.outerPoints[(i + 1) % this.outerPoints.length],
        ]);
      }

      for (let i = 0; i < this.innerPoints.length; ++i) {
        s.push([
          this.innerPoints[i],
          this.innerPoints[(i + 1) % this.innerPoints.length],
        ]);
      }

      return s;
    }

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

    fill() {
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

    move(dx: number, dy: number) {
      for (let p of this.innerPoints.concat(this.outerPoints)) {
        p.x += dx;
        p.y += dy;
      }
    }

    rotate(angle: number) {
      const c = this.center;
      const rad = angle / 180 * Math.PI;
      const crad = Math.cos(rad);
      const srad = Math.sin(rad);
      for (let p of this.innerPoints.concat(this.outerPoints)) {
        const posX = p.x - c.x;
        const posY = p.y - c.y;
        const newPosX = posX * crad - posY * srad;
        const newPosY = posX * srad + posY * crad;
        p.x = c.x + newPosX;
        p.y = c.y + newPosY;
      }
    }

    scale(k: number) {
      const c = this.center;
      for (let p of this.innerPoints.concat(this.outerPoints)) {
        const posX = p.x - c.x;
        const posY = p.y - c.y;
        const newPosX = posX * k;
        const newPosY = posY * k;
        p.x = c.x + newPosX;
        p.y = c.y + newPosY;
      }
    }

    flipX() {
      const c = this.center;
      for (let p of this.innerPoints.concat(this.outerPoints)) {
        p.y = 2 * c.y - p.y;
      }
    }

    flipY() {
      const c = this.center;
      for (let p of this.innerPoints.concat(this.outerPoints)) {
        p.x = 2 * c.x - p.x;
      }
    }

    intersect(p1: Point, p2: Point, from: Point): [Point, number] {
      let min = Infinity;
      let ans: [Point, number] = [null, -1];
      for (let i = 0; i < this.outerPoints.length; ++i) {
        const p3 = this.outerPoints[i];
        const p4 = this.outerPoints[(i + 1) % this.outerPoints.length];

        const p = intersect(p1, p2, p3, p4);
        if (p) {
          if (p1.dis2(p) > p1.dis2(from) && p1.dis2(p) < min) {
            min = p1.dis2(p);
            ans = [p, i];
          }
        }
      }

      return ans;
    }

    clip(poly2: Polygon): any {
      let st1: number;
      let st2: number;
      let flag: boolean;
      let p: Point = null;
      out: for (let i = 0; i < this.outerPoints.length; ++i) {
        for (let j = 0; j < poly2.outerPoints.length; ++j) {
          const p1 = this.outerPoints[i];
          const p2 = this.outerPoints[(i + 1) % this.outerPoints.length];
          const p3 = poly2.outerPoints[j];
          const p4 = poly2.outerPoints[(j + 1) % poly2.outerPoints.length];
          p = intersect(p1, p2, p3, p4);
          if (p) {
            st1 = i;
            st2 = j;
            flag = cross2(p1, p2, p3, p4) > 0;
            break out;
          }
        }
      }

      if (p === null) {
        console.log('no intersects found');
        if (this.outerPoints[0].in(poly2)) {
          return this.outerPoints.slice();
        } else if (poly2.outerPoints[0].in(this)) {
          return poly2.outerPoints.slice();
        } else {
          return [];
        }
      }

      let i = st1;
      let j = st2;
      console.log(i, j, flag);

      const intersections: Point[] = [p];
      do {
        if (flag) {
          let idx;
          do {
            console.log(i, j);
            const p3 = poly2.outerPoints[j];
            const p4 = poly2.outerPoints[(j + 1) % poly2.outerPoints.length];
            [p, idx] = this.intersect(p3, p4, p);
            if (idx === -1) {
              j = (j + 1) % poly2.outerPoints.length;
              p = p4;
            }
          } while (idx === -1);

          while (i !== idx) {
            console.log(i, j);

            i = (i + 1) % this.outerPoints.length;
            intersections.push(this.outerPoints[i]);
          }
          intersections.push(p);
          flag = !flag;
        } else {
          let idx;
          do {
            console.log(i, j);
            const p1 = this.outerPoints[i];
            const p2 = this.outerPoints[(i + 1) % this.outerPoints.length];
            [p, idx] = poly2.intersect(p1, p2, p);
            if (idx === -1) {
              i = (i + 1) % this.outerPoints.length;
              p = p2;
            }
          } while (idx === -1);

          while (j !== idx) {
            console.log(i, j);

            j = (j + 1) % poly2.outerPoints.length;
            intersections.push(poly2.outerPoints[j]);
          }
          intersections.push(p);
          flag = !flag;
        }
      } while (i !== st1 || j !== st2);

      if (intersections[intersections.length - 1].equal(intersections[0])) {
        intersections.pop();
      }

      return intersections;
    }
  }

  let poly = new Polygon();
  let clipPoly = new Polygon();
  clipPoly.state = PolygonState.POLYGON_INIT;

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

  let color: Color = new Color(0, 0, 0);

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

    if (((poly.state !== PolygonState.POLYGON_DONE) ||
         (clipPoly.state !== PolygonState.POLYGON_INIT) ||
         (clipPoly.state !== <PolygonState>PolygonState.POLYGON_DONE)) &&
        points.length >= 1) {
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

    if (clipPoly) {
      clipPoly.drawBorder();
    }
  }

  canvas.addEventListener('mousemove', (event) => {
    focus = new Point(event.pageX, event.pageY);
    repaint();
  });

  canvas.addEventListener('contextmenu', (event) => {
    console.log(poly);
    if (poly.state === PolygonState.POLYGON_OUTER) {
      poly.state = PolygonState.POLYGON_INNER;
      poly.outerPoints = points.slice();
    } else if (poly.state === PolygonState.POLYGON_INNER) {
      poly.state = PolygonState.POLYGON_DONE;
      poly.innerPoints = points.slice();
    } else if (clipPoly.state === PolygonState.POLYGON_OUTER) {
      // TODO: inner hole of clip polygon
      console.log(poly, clipPoly);
      clipPoly.state = PolygonState.POLYGON_DONE;
      clipPoly.outerPoints = points.slice();
      setTimeout(() => {
        poly.outerPoints = poly.clip(clipPoly);
        poly.innerPoints = [];
        clipPoly.state = PolygonState.POLYGON_INIT;
        clipPoly.outerPoints = [];
        repaint();
      }, 30);
    }

    points.length = 0;
    event.preventDefault();
    repaint();
  });

  canvas.addEventListener('click', (event) => {
    points.push(new Point(event.pageX, event.pageY));
    repaint();
  });

  document.addEventListener('keypress', (event) => {
    if (poly.state != PolygonState.POLYGON_DONE) {
      return;
    }

    switch (event.charCode) {
      case 109:  // m
        const dx = parseInt(prompt('move x:', '0'));
        const dy = parseInt(prompt('move y:', '0'));
        poly.move(dx, dy);
        break;

      case 114:  // r
        const angle = Number(prompt('rotate r: (in degree)'));
        poly.rotate(angle);
        break;

      case 115:  // s
        const k = Number(prompt('scale k: '));
        poly.scale(k);
        break;

      case 102:  // f
        const dir = prompt('flip in which axis (x or y)') === 'x';
        poly[dir ? 'flipX' : 'flipY']();
        break;

      case 99:  // c
        points.length = 0;
        clipPoly.state = PolygonState.POLYGON_OUTER;
        console.log('clipping');
        break;

      case 105:  // i
        const r = parseInt(prompt('new color (r):', '0'));
        const g = parseInt(prompt('new color (g):', '0'));
        const b = parseInt(prompt('new color (b):', '0'));
        color = new Color(r, g, b);
        break;
    }

    repaint();
  });
})();
