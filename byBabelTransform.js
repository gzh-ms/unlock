'use strict';

(function (w) {
  var CORRECT_COLOR = 'rgba(0, 255, 0, .6)';
  var WRONG_COLOR = 'rgba(128, 128, 128, .5)';
  var POINT_RADIUS = 3;
  w.Unlock = function (options) {
    this.width = options.width || 300;
    this.height = options.height || 300;
    this.type = options.type || 3;
    this.style = options.style || 'hollow';
    this.wrap = document.getElementById(options.container);
    this.init();
    this.buildCircle();
  };
  Unlock.prototype = {
    constructor: Unlock,
    init: function init() {
      this._initDom();
      this.canvas = document.getElementById('unlockCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.title = document.querySelector('.title');
      this.isInCircle = false;
      this.bindEvents();
    },
    _initDom: function _initDom() {
      var html = '';
      html += '<h4 class="title">请解锁</h4>';
      html += '<canvas id="unlockCanvas" class="unlockCanvas" width="' + this.width + 'px" height="' + this.height + 'px">您的浏览器不支持canvas！</canvas>';
      this.wrap.innerHTML = html;
    },
    buildCircle: function buildCircle() {
      var r = this.r = this.width / (this.type * 4 + 2);
      this.pointRadius = this.style === 'hollow' ? this.r : POINT_RADIUS;
      this.centerOfCirs = [];
      this.activeCirls = [];
      this.copyCircles = [];
      for (var i = 0; i < this.type; i++) {
        for (var j = 0; j < this.type; j++) {
          this.centerOfCirs.push({
            x: 3 * r * (i + 1) + i * r,
            y: 3 * r * (j + 1) + j * r
          });
          this.copyCircles.push({
            x: 3 * r * (i + 1) + i * r,
            y: 3 * r * (j + 1) + j * r
          });
        }
      }
      var amount = this.type * this.type;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (var _i = 0; _i < amount; _i++) {
        this.copyCircles[_i].index = _i + 1;
        this.drawCircLe(this.centerOfCirs[_i]);
      }
    },
    drawCircLe: function drawCircLe(xy) {
      this.ctx.beginPath();
      if (this.style === 'hollow') {
        this.ctx.strokeStyle = '#fff';
        this.ctx.arc(xy.x, xy.y, this.r, 0, Math.PI * 2, true);
        this.ctx.stroke();
      } else {
        this.ctx.fillStyle = '#fff';
        this.ctx.arc(xy.x, xy.y, POINT_RADIUS, 0, Math.PI * 2, true);
        this.ctx.fill();
      }
      this.ctx.closePath();
    },
    redrawCircle: function redrawCircle() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (var i = 0; i < this.centerOfCirs.length; i++) {
        this.drawCircLe(this.centerOfCirs[i]);
      }
    },
    bindEvents: function bindEvents() {
      var self = this;
      this.canvas.addEventListener('touchstart', function (e) {
        var po = self.getPosition(e);
        for (var i = 0; i < self.copyCircles.length; i++) {
          if (Math.abs(self.copyCircles[i].x - po.x) < self.r && Math.abs(self.copyCircles[i].y - po.y) < self.r) {
            self.isInCircle = true;
            self.activeCirls.push(self.copyCircles[i]);
            self.copyCircles.splice(i, 1);
            break;
          }
        }
      }, false);
      this.canvas.addEventListener('touchmove', function (e) {
        if (self.isInCircle) {
          self.po = self.getPosition(e);
          self.update();
        }
      }, false);
      this.canvas.addEventListener('touchend', function (e) {
        if (!self.isInCircle) return;
        if (self.checkStatus()) {
          self.title.innerHTML = '解锁成功';
          self.redraw(CORRECT_COLOR);
          setTimeout(function () {
            self.reset();
          }, 1000);
        } else {
          self.title.innerHTML = '解锁失败';
          self.redraw(WRONG_COLOR);
          setTimeout(function () {
            self.reset();
          }, 1000);
        }
      }, false);
    },
    getPosition: function getPosition(e) {
      var rect = e.currentTarget.getBoundingClientRect(),
        po = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      return po;
    },
    update: function update() {
      var self = this;
      this.redrawCircle();
      this.drawPoint();
      this.drawLine(function () {
        self.ctx.lineTo(self.po.x, self.po.y);
      });
      for (var i = 0; i < this.copyCircles.length; i++) {
        if (Math.abs(this.copyCircles[i].x - this.po.x) < this.r && Math.abs(this.copyCircles[i].y - this.po.y) < this.r) {
          this.activeCirls.push(this.copyCircles[i]);
          this.drawPoint();
          this.copyCircles.splice(i, 1);
          break;
        }
      }
    },
    drawPoint: function drawPoint() {
      for (var i = 0; i < this.activeCirls.length; i++) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.pointColor || '#fff';
        this.ctx.arc(this.activeCirls[i].x, this.activeCirls[i].y, this.pointRadius / 2, 0, Math.PI * 2, true);
        this.ctx.fill();
        this.ctx.closePath();
      }
    },
    drawLine: function drawLine(callback) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = this.lineColor || 'rgba(255, 255, 255, .4)';
      this.ctx.moveTo(this.activeCirls[0].x, this.activeCirls[0].y);
      for (var i = 0; i < this.activeCirls.length; i++) {
        this.ctx.lineTo(this.activeCirls[i].x, this.activeCirls[i].y);
      }
      callback && callback();
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.restore();
    },
    checkStatus: function checkStatus() {
      var key = '14569',
        str = '';
      for (var i = 0; i < this.activeCirls.length; i++) {
        str += this.activeCirls[i].index;
      }
      return key === str;
    },
    changeCirclesColor: function changeCirclesColor(color) {
      for (var i = 0; i < this.activeCirls.length; i++) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.arc(this.activeCirls[i].x, this.activeCirls[i].y, this.pointRadius, 0, Math.PI * 2, true);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
      }
    },
    reset: function reset() {
      this.title.innerHTML = '请解锁';
      this.pointColor = '';
      this.lineColor = '';
      this.isInCircle = false;
      this.buildCircle();
    },
    redraw: function redraw(color) {
      if (!this.isInCircle) return;
      this.redrawCircle();
      this.changeCirclesColor(color);
      this.pointColor = color;
      this.lineColor = color;
      this.drawPoint();
      this.drawLine();
    }
  };
})(window);
