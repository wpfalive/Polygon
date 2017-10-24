/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

(function () {
    var canvas = document.createElement('canvas');
    var width = window.innerWidth;
    var height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    var points = [];
    var PolygonState;
    (function (PolygonState) {
        PolygonState[PolygonState["POLYGON_INIT"] = 0] = "POLYGON_INIT";
        PolygonState[PolygonState["POLYGON_OUTER"] = 1] = "POLYGON_OUTER";
        PolygonState[PolygonState["POLYGON_INNER"] = 2] = "POLYGON_INNER";
        PolygonState[PolygonState["POLYGON_DONE"] = 3] = "POLYGON_DONE";
    })(PolygonState || (PolygonState = {}));
    var Point = /** @class */ (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        Object.defineProperty(Point.prototype, "x", {
            get: function () {
                return this._x;
            },
            set: function (v) {
                this._x = Math.floor(v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Point.prototype, "y", {
            get: function () {
                return this._y;
            },
            set: function (v) {
                this._y = Math.floor(v);
            },
            enumerable: true,
            configurable: true
        });
        Point.prototype.dis2 = function (p2) {
            return (p2.x - this.x) * (p2.x - this.x) +
                (p2.y - this.y) * (p2.y - this.y);
        };
        Point.prototype.dis = function (p2) {
            return Math.sqrt(this.dis2(p2));
        };
        Point.prototype.on = function (p1, p2) {
            return (p1.x - this.x) * (p2.y - this.y) ===
                (p1.y - this.y) * (p2.x - this.x);
        };
        Point.prototype.in = function (poly2) {
            var n = poly2.outerPoints.length;
            var angle = 0;
            for (var i = 0; i < n; ++i) {
                var p1 = poly2.outerPoints[i];
                var p2 = poly2.outerPoints[(i + 1) % n];
                var a2 = p1.dis2(p2);
                var b2 = this.dis2(p1);
                var c2 = this.dis2(p2);
                var b = Math.sqrt(b2);
                var c = Math.sqrt(c2);
                var cosv = (b2 + c2 - a2) / (2 * b * c);
                var v = Math.acos(cosv);
                angle += (cross(this, p1, p2) > 0) ? v : -v;
            }
            return Math.abs(angle) > 1e-6;
        };
        Point.prototype.equal = function (p2) {
            return this.x === p2.x && this.y === p2.y;
        };
        return Point;
    }());
    function cross(p1, p2, p3) {
        return (p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y);
    }
    function cross2(p1, p2, p3, p4) {
        return (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
    }
    function intersect(p1, p2, p3, p4) {
        var cross1 = cross(p3, p4, p1);
        var cross2 = cross(p3, p4, p2);
        var cross3 = cross(p1, p2, p3);
        var cross4 = cross(p1, p2, p4);
        var p;
        if (((cross1 > 0 && cross2 < 0) || (cross1 < 0 && cross2 > 0)) &&
            ((cross3 < 0 && cross4 > 0) || (cross3 > 0 && cross4 < 0))) {
            var nx = (p3.x * cross4 - p4.x * cross3) / (cross4 - cross3);
            var ny = (p3.y * cross4 - p4.y * cross3) / (cross4 - cross3);
            p = new Point(nx, ny);
            return p;
        }
        else if (p1.on(p3, p4)) {
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
    var Polygon = /** @class */ (function () {
        function Polygon(outerPoints, innerPoints) {
            if (outerPoints === void 0) { outerPoints = []; }
            if (innerPoints === void 0) { innerPoints = []; }
            this.outerPoints = outerPoints.slice();
            this.innerPoints = innerPoints.slice();
            this.state = PolygonState.POLYGON_OUTER;
        }
        Object.defineProperty(Polygon.prototype, "center", {
            get: function () {
                var psum = this.outerPoints.reduce(function (op, np) {
                    return new Point(op.x + np.x, op.y + np.y);
                });
                var n = this.outerPoints.length;
                return new Point(psum.x / n, psum.y / n);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Polygon.prototype, "segments", {
            get: function () {
                var s = [];
                for (var i = 0; i < this.outerPoints.length; ++i) {
                    s.push([
                        this.outerPoints[i],
                        this.outerPoints[(i + 1) % this.outerPoints.length],
                    ]);
                }
                for (var i = 0; i < this.innerPoints.length; ++i) {
                    s.push([
                        this.innerPoints[i],
                        this.innerPoints[(i + 1) % this.innerPoints.length],
                    ]);
                }
                return s;
            },
            enumerable: true,
            configurable: true
        });
        Polygon.prototype.drawBorder = function () {
            {
                ctx.beginPath();
                var n = this.outerPoints.length;
                for (var i = 0; i < n; ++i) {
                    ctx.moveTo(this.outerPoints[i].x, this.outerPoints[i].y);
                    ctx.lineTo(this.outerPoints[(i + 1) % n].x, this.outerPoints[(i + 1) % n].y);
                }
                ctx.stroke();
            }
            {
                ctx.beginPath();
                var n = this.innerPoints.length;
                for (var i = 0; i < n; ++i) {
                    ctx.moveTo(this.innerPoints[i].x, this.innerPoints[i].y);
                    ctx.lineTo(this.innerPoints[(i + 1) % n].x, this.innerPoints[(i + 1) % n].y);
                }
                ctx.stroke();
            }
        };
        Polygon.prototype.fill = function (color) {
            if (color === void 0) { color = new Color(0, 0, 0); }
            if (this.state !== PolygonState.POLYGON_DONE) {
                return;
            }
            ctx.fillStyle = color.toString();
            var _a = [width, height, 0, 0], minX = _a[0], minY = _a[1], maxX = _a[2], maxY = _a[3];
            for (var _i = 0, _b = this.outerPoints; _i < _b.length; _i++) {
                var point = _b[_i];
                minX = Math.min(minX, point.x);
                minY = Math.min(minY, point.y);
                maxX = Math.max(maxX, point.x);
                maxY = Math.max(maxY, point.y);
            }
            --minX;
            --minY;
            ++maxX;
            ++maxY;
            var mw = maxX - minX + 1;
            var mh = maxY - minY + 1;
            var signMap = (new Uint8Array(mw * mh)).fill(0);
            function doSign(points) {
                var n = points.length;
                if (n < 3) {
                    return;
                }
                for (var i = 0; i < n; ++i) {
                    var pl = points[(i + n - 1) % n];
                    var p = points[i];
                    var pr = points[(i + 1) % n];
                    if ((pl.y <= p.y && p.y < pr.y) || (pl.y > p.y && p.y >= pr.y)) {
                        signMap[(p.y - minY) * mw + (p.x - minX)] += 1;
                    }
                    else {
                        signMap[(p.y - minY) * mw + (p.x - minX)] += 2;
                    }
                    if (p.y === pr.y) {
                        var _a = (p.x < pr.x) ? [p.x, pr.x] : [pr.x, p.x], st = _a[0], end = _a[1];
                        for (var j = st + 1; j < end; ++j) {
                            signMap[(p.y - minY) * mw + j - minX] += 2;
                        }
                    }
                    else {
                        var k = (pr.x - p.x) / (pr.y - p.y);
                        var _b = (p.y < pr.y) ? [p.y, pr.y, p.x] : [pr.y, p.y, pr.x], st = _b[0], end = _b[1], x1 = _b[2];
                        for (var j = st + 1; j < end; ++j) {
                            x1 += k;
                            signMap[(j - minY) * mw + Math.floor(x1) - minX] += 1;
                        }
                    }
                }
            }
            doSign(this.outerPoints);
            doSign(this.innerPoints);
            for (var i = minY; i <= maxY; ++i) {
                var inside = false;
                for (var j = minX; j <= maxX; ++j) {
                    var sign = signMap[(i - minY) * mw + (j - minX)];
                    if (sign % 2 === 1) {
                        inside = !inside;
                    }
                    if (inside) {
                        drawPixel(j, i);
                    }
                }
            }
        };
        Polygon.prototype.move = function (dx, dy) {
            for (var _i = 0, _a = this.innerPoints.concat(this.outerPoints); _i < _a.length; _i++) {
                var p = _a[_i];
                p.x += dx;
                p.y += dy;
            }
        };
        Polygon.prototype.rotate = function (angle) {
            var c = this.center;
            var rad = angle / 180 * Math.PI;
            var crad = Math.cos(rad);
            var srad = Math.sin(rad);
            for (var _i = 0, _a = this.innerPoints.concat(this.outerPoints); _i < _a.length; _i++) {
                var p = _a[_i];
                var posX = p.x - c.x;
                var posY = p.y - c.y;
                var newPosX = posX * crad - posY * srad;
                var newPosY = posX * srad + posY * crad;
                p.x = c.x + newPosX;
                p.y = c.y + newPosY;
            }
        };
        Polygon.prototype.scale = function (k) {
            var c = this.center;
            for (var _i = 0, _a = this.innerPoints.concat(this.outerPoints); _i < _a.length; _i++) {
                var p = _a[_i];
                var posX = p.x - c.x;
                var posY = p.y - c.y;
                var newPosX = posX * k;
                var newPosY = posY * k;
                p.x = c.x + newPosX;
                p.y = c.y + newPosY;
            }
        };
        Polygon.prototype.flipX = function () {
            var c = this.center;
            for (var _i = 0, _a = this.innerPoints.concat(this.outerPoints); _i < _a.length; _i++) {
                var p = _a[_i];
                p.y = 2 * c.y - p.y;
            }
        };
        Polygon.prototype.flipY = function () {
            var c = this.center;
            for (var _i = 0, _a = this.innerPoints.concat(this.outerPoints); _i < _a.length; _i++) {
                var p = _a[_i];
                p.x = 2 * c.x - p.x;
            }
        };
        Polygon.prototype.intersect = function (p1, p2, from) {
            var min = Infinity;
            var ans = [null, -1];
            for (var i = 0; i < this.outerPoints.length; ++i) {
                var p3 = this.outerPoints[i];
                var p4 = this.outerPoints[(i + 1) % this.outerPoints.length];
                var p = intersect(p1, p2, p3, p4);
                if (p) {
                    if (p1.dis2(p) > p1.dis2(from) && p1.dis2(p) < min) {
                        min = p1.dis2(p);
                        ans = [p, i];
                    }
                }
            }
            return ans;
        };
        Polygon.prototype.clip = function (poly2) {
            var st1;
            var st2;
            var flag;
            var p = null;
            out: for (var i_1 = 0; i_1 < this.outerPoints.length; ++i_1) {
                for (var j_1 = 0; j_1 < poly2.outerPoints.length; ++j_1) {
                    var p1 = this.outerPoints[i_1];
                    var p2 = this.outerPoints[(i_1 + 1) % this.outerPoints.length];
                    var p3 = poly2.outerPoints[j_1];
                    var p4 = poly2.outerPoints[(j_1 + 1) % poly2.outerPoints.length];
                    p = intersect(p1, p2, p3, p4);
                    if (p) {
                        st1 = i_1;
                        st2 = j_1;
                        flag = cross2(p1, p2, p3, p4) > 0;
                        break out;
                    }
                }
            }
            if (p === null) {
                console.log('no intersects found');
                if (this.outerPoints[0].in(poly2)) {
                    return this.outerPoints.slice();
                }
                else if (poly2.outerPoints[0].in(this)) {
                    return poly2.outerPoints.slice();
                }
                else {
                    return [];
                }
            }
            var i = st1;
            var j = st2;
            console.log(i, j, flag);
            var intersections = [p];
            do {
                if (flag) {
                    var idx = void 0;
                    do {
                        console.log(i, j);
                        var p3 = poly2.outerPoints[j];
                        var p4 = poly2.outerPoints[(j + 1) % poly2.outerPoints.length];
                        _a = this.intersect(p3, p4, p), p = _a[0], idx = _a[1];
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
                }
                else {
                    var idx = void 0;
                    do {
                        console.log(i, j);
                        var p1 = this.outerPoints[i];
                        var p2 = this.outerPoints[(i + 1) % this.outerPoints.length];
                        _b = poly2.intersect(p1, p2, p), p = _b[0], idx = _b[1];
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
            var _a, _b;
        };
        return Polygon;
    }());
    var poly = new Polygon();
    var clipPoly = new Polygon();
    clipPoly.state = PolygonState.POLYGON_INIT;
    var focus = null;
    var Color = /** @class */ (function () {
        function Color(r, g, b) {
            this.r = r;
            this.g = g;
            this.b = b;
        }
        Color.prototype.toString = function () {
            return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
        };
        return Color;
    }());
    function drawPixel(x, y) {
        ctx.fillRect(x, y, 1, 1);
    }
    var repaint_flag = false;
    function repaint() {
        if (repaint_flag === false) {
            repaint_flag = true;
            setTimeout(function () {
                repaint_flag = false;
            }, 20);
        }
        else {
            return;
        }
        ctx.clearRect(0, 0, width, height);
        if (((poly.state !== PolygonState.POLYGON_DONE) ||
            (clipPoly.state !== PolygonState.POLYGON_INIT) ||
            (clipPoly.state !== PolygonState.POLYGON_DONE)) &&
            points.length >= 1) {
            ctx.beginPath();
            var n = points.length;
            for (var i = 0; i < n - 1; ++i) {
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
    canvas.addEventListener('mousemove', function (event) {
        focus = new Point(event.pageX, event.pageY);
        repaint();
    });
    canvas.addEventListener('contextmenu', function (event) {
        console.log(poly);
        if (poly.state === PolygonState.POLYGON_OUTER) {
            poly.state = PolygonState.POLYGON_INNER;
            poly.outerPoints = points.slice();
        }
        else if (poly.state === PolygonState.POLYGON_INNER) {
            poly.state = PolygonState.POLYGON_DONE;
            poly.innerPoints = points.slice();
        }
        else if (clipPoly.state === PolygonState.POLYGON_OUTER) {
            // TODO: inner hole of clip polygon
            console.log(poly, clipPoly);
            clipPoly.state = PolygonState.POLYGON_DONE;
            clipPoly.outerPoints = points.slice();
            setTimeout(function () {
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
    canvas.addEventListener('click', function (event) {
        points.push(new Point(event.pageX, event.pageY));
        repaint();
    });
    document.addEventListener('keypress', function (event) {
        if (poly.state != PolygonState.POLYGON_DONE) {
            return;
        }
        switch (event.charCode) {
            case 109:// m
                var dx = parseInt(prompt('move x:', '0'));
                var dy = parseInt(prompt('move y:', '0'));
                poly.move(dx, dy);
                break;
            case 114:// r
                var angle = Number(prompt('rotate r: (in degree)'));
                poly.rotate(angle);
                break;
            case 115:// s
                var k = Number(prompt('scale k: '));
                poly.scale(k);
                break;
            case 102:// f
                var dir = prompt('flip in which axis (x or y)') === 'x';
                poly[dir ? 'flipX' : 'flipY']();
                break;
            case 99:// c
                points.length = 0;
                clipPoly.state = PolygonState.POLYGON_OUTER;
                console.log('clipping');
                break;
        }
        repaint();
    });
})();


/***/ })
/******/ ]);