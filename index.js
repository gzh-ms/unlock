/*
  1. 生成dom结构
  2. 获取半径、 圆心位置
  3. 画圆
  4. 绑定touchstart / touchmove / touchend事件
  5. touchstart事件判断触点是否在圆内
  6. touchmove事件 画点 画线
  7. touchend事件判断解锁状态，并重置

  调用:
  new Unlock({
    width: 300, canvas宽
    height: 300, canvas高
    type: 3, 圆的个数。如：3 X 3、4 X 4
    style: solid、hollow 圆的类型：实心点，空心圆。
  });
*/

(function (w) {
  const CORRECT_COLOR = 'rgba(0, 255, 0, .6)'; // 解锁成功圆和线颜色
  const WRONG_COLOR = 'rgba(128, 128, 128, .5)'; // 解锁失败圆和线颜色
  const POINT_RADIUS = 3; // 点的半径

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

    init: function () {
      this._initDom();
      this.canvas = document.getElementById('unlockCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.title = document.querySelector('.title');
      this.isInCircle = false;
      this.bindEvents();
    },

    // dom
    _initDom: function () {
      var html = '';
      html += '<h4 class="title">请解锁</h4>';
      html += '<canvas id="unlockCanvas" class="unlockCanvas" width="' + this.width + 'px" height="' + this.height + 'px">您的浏览器不支持canvas！</canvas>';
      this.wrap.innerHTML = html;
    },

    // 圆心、半径
    buildCircle: function () {
      var r = this.r = this.width / (this.type * 4 + 2); // 圆的半径

      this.pointRadius = this.style === 'hollow' ? this.r : POINT_RADIUS; // 点的半径
      this.centerOfCirs = []; // 圆心坐标
      this.activeCirls = []; // 激活状态的圆心坐标
      this.copyCircles = []; // 圆心坐标副本

      for (let i = 0; i < this.type; i++) {
        for (let j = 0; j < this.type; j++) {
          this.centerOfCirs.push({
            x: (3 * r) * (i + 1) + i * r,
            y: (3 * r) * (j + 1) + j * r
          });
          this.copyCircles.push({
            x: (3 * r) * (i + 1) + i * r,
            y: (3 * r) * (j + 1) + j * r
          });
        }
      }

      var amount = this.type * this.type;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let i = 0; i < amount; i++) {
        this.copyCircles[i].index = (i + 1); // 位置标记
        this.drawCircLe(this.centerOfCirs[i]);
      }
    },

    // 圆 params: {} 圆心坐标
    drawCircLe: function (xy) {
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

    // 重新画圆
    redrawCircle: function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // 清空canvas
      for (let i = 0; i < this.centerOfCirs.length; i++) {
        this.drawCircLe(this.centerOfCirs[i]);
      }
    },

    // 绑定事件
    bindEvents: function () {
      var self = this;

      this.canvas.addEventListener('touchstart', function (e) { // 判断触点是否在圆内        
        var po = self.getPosition(e);

        for (let i = 0; i < self.copyCircles.length; i++) {
          if (Math.abs(self.copyCircles[i].x - po.x) < self.r && Math.abs(self.copyCircles[i].y - po.y) < self.r) {
            self.isInCircle = true;
            self.activeCirls.push(self.copyCircles[i]); // 激活状态的圆
            self.copyCircles.splice(i, 1);
            break;
          }
        }
      }, false);

      this.canvas.addEventListener('touchmove', function (e) { // 画点画线
        if (self.isInCircle) {
          self.po = self.getPosition(e);
          self.update();
        }
      }, false);

      this.canvas.addEventListener('touchend', function (e) { // 判断状态，并重置
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

    // 获取以canvas-0,0为起点的clientXY值，params: event 事件对象
    getPosition: function (e) {
      var rect = e.currentTarget.getBoundingClientRect(),
        po = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top
        };
      return po;
    },

    // 更新画布
    update: function () { 
      var self = this;
      this.redrawCircle(); // 清空画布，重新画圆
      this.drawPoint(); // 画点
      this.drawLine(function () { // 画运动中的线
        self.ctx.lineTo(self.po.x, self.po.y);
      });

      // 判断触点是否移动到下一个圆内,剔除已画圆
      for (let i = 0; i < this.copyCircles.length; i++) {
        if (Math.abs(this.copyCircles[i].x - this.po.x) < this.r && Math.abs(this.copyCircles[i].y - this.po.y) < this.r) {
          this.activeCirls.push(this.copyCircles[i]);
          this.drawPoint();
          this.copyCircles.splice(i, 1);
          break;
        }
      }
    },

    // 画点
    drawPoint: function () { 
      for (let i = 0; i < this.activeCirls.length; i++) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.pointColor || '#fff';
        this.ctx.arc(this.activeCirls[i].x, this.activeCirls[i].y, this.pointRadius / 2, 0, Math.PI * 2, true);
        this.ctx.fill();
        this.ctx.closePath();

      }
    },

    // 画线 params: function 
    drawLine: function (callback) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = this.lineColor || 'rgba(255, 255, 255, .4)';
      this.ctx.moveTo(this.activeCirls[0].x, this.activeCirls[0].y);

      for (let i = 0; i < this.activeCirls.length; i++) { // 画线，连接已画的圆
        this.ctx.lineTo(this.activeCirls[i].x, this.activeCirls[i].y);
      }
      callback && callback();
      this.ctx.stroke();
      this.ctx.closePath();
      this.ctx.restore();
    },

    // 检查状态
    checkStatus: function () { 
      var key = '14569', // 正确的顺序
        str = '';
      for (let i = 0; i < this.activeCirls.length; i++) {
        str += this.activeCirls[i].index;
      }
      return key === str;
    },

    // 状态对应颜色
    changeCirclesColor: function (color) { 
      for (let i = 0; i < this.activeCirls.length; i++) {
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

    // 重置
    reset: function () { 
      this.title.innerHTML = '请解锁';
      this.pointColor = '';
      this.lineColor = '';
      this.isInCircle = false;
      this.buildCircle();
    },

    // 静止时重绘,params: string 状态对应颜色
    redraw: function (color) {
      if (!this.isInCircle) return;
      this.redrawCircle();
      this.changeCirclesColor(color);
      this.pointColor = color;
      this.lineColor = color;
      this.drawPoint();
      this.drawLine(); // 静止的线
    }
  };
})(window);