//路径
type PathsItem = Array<number>
//坐标
interface Coordinate {
  x: number //坐标x
  y: number //坐标y
}
//线段选项
interface LineOption {
  lineWidth?: number //线段宽度
  arrowSize?: number //箭头大小
  arrowRoundSize?: number //箭头圆角大小
  color?: string //颜色
  lineCap?: string //箭头样式
  lineJoin?: string //箭头连接处样式
  lineImgSplit?: number //图片和线段的连接间隔
}
//流动效果选项
interface FlowOption {
  isDrawFlow?: boolean //是否流动
  flowWidth?: number //流动箭头宽度
  color?: Array<number>, //箭头颜色
  lineCap?: string //箭头样式
}
interface SplitLine {
  angle?: number
  length?: number
  originLength?: number
  paths?: Array<PathsItem>
  endLines?: Array<SplitLine>
  startLines?: Array<SplitLine>
  fromPixel?: Coordinate
  toPixel?: Coordinate
}
//线段对象
interface LineObj {
  points: Array<Coordinate> //点坐标数组
  arrowDirection: string //箭头方向
  lineOption?: LineOption //线段选项
  paths?: Array<PathsItem> //路径数组
  lineSpace?: number //线段间隔
  flowOption?: FlowOption //流动效果选项
  originLength?: number //原始长度
  splitLines?: Array<SplitLine> //线段数据
}
//文案选项
interface TextOption {
  text?: string //文案
  show?: boolean //是否显示
  style?: { //样式
    fontWeight?: string //字体浓淡
    position?: string //字体位置
    color?: string //字体颜色
    fontFamily?: string //字体风格
    fontSize?: number //字体东西
    imgTextSplit?: number //图片和文案间隔
  }
}
//图片
interface ImgObj extends Coordinate {
  imgUrl: string //图片url
  width: number //图片宽度
  height: number //图片高度
  textOption?: TextOption //文案选项
}

/**
 * 计算角度
 * @param {*} fromPixel 起始点 {x,y} 
 * @param {*} toPixel 终点 {x,y} 
 * @param {*} origin (0.0) 在哪个方向 bottom:左下角 top:左上角
 * @returns 0 - 2PI
 */
function getAngle(fromPixel: Coordinate, toPixel: Coordinate, origin = 'top') {
  let flag = 1
  if (origin != 'top') flag = -1
  let angle = Math.atan((toPixel.y - fromPixel.y) * flag / (toPixel.x - fromPixel.x));
  if ((toPixel.x - fromPixel.x) < 0) angle += Math.PI;
  return angle
}

/**
 * 获取屏幕坐标
 * @param {Object} originPoint 主canvas坐标点 {x,y}
 * @param {Object} referencePoint 参考点 canvas原点
 */
function getScreen(originPoint: Coordinate, referencePoint: Coordinate) {
  let point = {
    x: 0,
    y: 0
  }
  point.x = +originPoint.x - +referencePoint.x
  point.y = +originPoint.y - +referencePoint.y
  point.x = Math.round(point.x) // 减少绘图锯齿化处理时间
  point.y = Math.round(point.y) // 减少绘图锯齿化处理时间
  return point
}

class CreateImgLineFlow {
  public imgData //图片列表
  public lineData //线段列表
  public fps //频率
  public stepSize //移动步数
  public flowLength //流动箭头长度
  public canvas //主canvas
  public flowCanvas //流动效果canvas
  public ctx //主canvas context
  public flowCtx //流动效果canvas context
  private arrowRunPx: number //流动箭头移动px
  private arrowAnimation: any //流动箭头动画实例
  constructor({
    imgData,
    lineData = [], 
    fps = 24,
    stepSize = 60,
    flowLength = 20,
    canvas,
    flowCanvas,
    ctx,
    flowCtx
  }: {
    imgData: Array<ImgObj>,
    lineData?: Array<LineObj>,
    fps?: number,
    stepSize?: number,
    flowLength?: number,
    canvas: HTMLCanvasElement,
    flowCanvas: HTMLCanvasElement,
    ctx: any,
    flowCtx: any
  }) {
    this.lineData = lineData;
    this.imgData = imgData;
    this.fps = fps;
    this.stepSize = stepSize;
    this.arrowRunPx = 0; //流动箭头已经移动的距离
    this.flowLength = flowLength;
    this.canvas = canvas;
    this.ctx = ctx;
    this.flowCanvas = flowCanvas;
    this.flowCtx = flowCtx;
    this.arrowAnimation = null; //动画实例
    this.init();
  }
  private init() {
    this.combLine();
    this.handleDataBeforeDraw();
  }
  public draw() {
    this.drawImage();
    this.drawLine();
    this.drawFlow();
  }
  public clear() {
    if (this.arrowAnimation) {
      cancelAnimationFrame(this.arrowAnimation)
      this.arrowAnimation = null
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.flowCtx.clearRect(0, 0, this.flowCanvas.width, this.flowCanvas.height);
  }
  // 梳理线段关系
  private combLine() {
    this.lineData.forEach((lineObj: LineObj) => {
      lineObj.paths = lineObj.points.map(v => [v.x, v.y]);
      if (!lineObj.splitLines) lineObj.splitLines = [];
      lineObj.paths.forEach((v, i) => {
        if (i > 0) {
          lineObj.splitLines.push({
            paths: [
              [lineObj.paths[i - 1][0], lineObj.paths[i - 1][1]],
              [v[0], v[1]]
            ]
          })
        }
      })
    })
    // 梳理管线的关联关系
    this.lineData.forEach((lineObj: LineObj) => {
      lineObj.originLength = 0
      lineObj.splitLines.forEach((v: SplitLine, i) => {
        let x = Math.abs(v.paths[0][0] - v.paths[1][0]);
        let y = Math.abs(v.paths[0][1] - v.paths[1][1]);
        v.originLength = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        lineObj.originLength += v.originLength
        v.startLines = []
        v.endLines = []
      })
    })
    this.lineData.forEach(lineObj => {
      lineObj.splitLines.forEach((v, i) => {
        this.lineData.forEach(lineObj2 => {
          if (lineObj == lineObj2) return false
          lineObj2.splitLines.forEach((v2, i) => {
            if (v.paths[1][0] == v2.paths[0][0] && v.paths[1][1] == v2.paths[0][1]) {
              v.endLines.push(v2)
              v2.startLines.push(v)
            }
          })
        })
      })
    })
  }
  //绘制箭头前的处理
  private handleDataBeforeDraw() {
    const referencePoint = {
      x: 0,
      y: 0
    }
    this.lineData.forEach(lineObj => {
      lineObj.originLength = 0
      lineObj.splitLines.forEach((v, i) => {
        // 屏幕坐标
        if (i == 0 || !lineObj.splitLines[i - 1].toPixel) {
          v.fromPixel = getScreen({
            x: v.paths[0][0],
            y: v.paths[0][1]
          }, referencePoint)
        } else v.fromPixel = Object.assign({}, lineObj.splitLines[i - 1].toPixel)
        v.toPixel = getScreen({
          x: v.paths[1][0],
          y: v.paths[1][1]
        }, referencePoint)
        // 计算角度
        if (v.angle === undefined) v.angle = getAngle({
          x: v.paths[0][0],
          y: v.paths[0][1]
        }, {
          x: v.paths[1][0],
          y: v.paths[1][1]
        }, 'top')
        // 长度
        if (v.length === undefined) v.length = v.originLength
      })
    })
  }
  //画图片
  private drawImage() {
    this.ctx.save();
    this.imgData.forEach(imgObj => {
      let {
        imgUrl,
        x,
        y,
        width,
        height,
        textOption = {//文字参数
          show: false,
          text: '',
          style: {}
        },
      } = imgObj;
      let img = new Image();
      img.src = imgUrl;
      img.onload = () => {
        this.ctx.drawImage(img, x, y, width, height);
      }
      //绘制文字
      if(textOption && textOption.show) {
        let { text, style } = textOption;
        let { 
          color = '#666',
          fontFamily = '微软雅黑',
          fontSize = 13,
          fontWeight = 'normal',
          position = 'bottom',
          imgTextSplit = 5
        } = style;
        this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        
        let fontX = 0, fontY = 0;//绘制文字的位置
        this.ctx.fillStyle = color;

        let textWidth = this.ctx.measureText(text).width;//文字总宽度
        let imgCenterX = Number(x) + width/ 2;//图片中心点x
        let imgCenterY = Number(y) + height/ 2;//图片中心点y
        switch (position) {
          case 'top':
            fontX = imgCenterX - textWidth / 2;
            fontY = y - imgTextSplit - fontSize;
            break;
          case 'bottom':
            fontX = imgCenterX - textWidth / 2;
            fontY = y + height + imgTextSplit + fontSize;
            break;
          case 'left':
            fontX = x - textWidth - imgTextSplit;
            fontY = imgCenterY - fontSize / 2;
            break;
          case 'right':
            fontX = x + width + textWidth + imgTextSplit;
            fontY = imgCenterY - fontSize / 2;
            break;
          default:
            break;
        }
        this.ctx.fillText(text, fontX , fontY);
      }
    })
    this.ctx.restore();
  }
  //画线
  private drawLine() {
    let ctx = this.ctx;
    this.lineData.forEach((line: LineObj) => {
      ctx.save();
      let {
        points,
        lineOption = {},
        arrowDirection
      }: LineObj = line;
      let {
        lineWidth = 3, //线段宽度
        arrowSize = 8, //箭头大小
        arrowRoundSize = 3, //箭头圆角大小
        color = '#B83538', //线颜色
        lineCap = 'round', //线样式
        lineJoin = 'round', //线连接处样式
        lineImgSplit = 6, //线段与图片间隔（起点和终点偏移距离）
      } = lineOption;
      //画连接线
      ctx.beginPath();
      let lastPoint = points[points.length - 1];
      let originX, originY; //箭头原点
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineCap = lineCap;
      ctx.lineJoin = lineJoin;
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1, points.length).forEach(point => {
        ctx.lineTo(point.x, point.y);
      })
      ctx.stroke();
      //画线末箭头
      ctx.beginPath();
      switch (arrowDirection) {
        case 'left':
          originX = lastPoint.x - lineImgSplit / 2;
          originY = lastPoint.y;
          ctx.moveTo(originX + arrowRoundSize - 1, originY + arrowRoundSize - 1);
          ctx.lineTo(originX + arrowSize - arrowRoundSize, originY + arrowSize - arrowRoundSize);
          ctx.quadraticCurveTo(originX + arrowSize, originY + arrowSize, originX + arrowSize, originY + arrowSize - arrowRoundSize);
          ctx.lineTo(originX + arrowSize, originY - arrowSize + arrowRoundSize);
          ctx.quadraticCurveTo(originX + arrowSize, originY - arrowSize, originX + arrowSize - arrowRoundSize, originY - arrowSize + arrowRoundSize);
          ctx.lineTo(originX + arrowRoundSize - 1, originY - arrowRoundSize + 1);
          ctx.quadraticCurveTo(originX, originY, originX + arrowRoundSize - 1, originY + arrowRoundSize - 1);
          break;
        case 'right':
          originX = lastPoint.x + lineImgSplit / 2;
          originY = lastPoint.y;
          ctx.moveTo(originX - arrowRoundSize + 1, originY + arrowRoundSize - 1);
          ctx.lineTo(originX - arrowSize + arrowRoundSize, originY + arrowSize - arrowRoundSize);
          ctx.quadraticCurveTo(originX - arrowSize, originY + arrowSize, originX - arrowSize, originY + arrowSize - arrowRoundSize);
          ctx.lineTo(originX - arrowSize, originY - arrowSize + arrowRoundSize);
          ctx.quadraticCurveTo(originX - arrowSize, originY - arrowSize, originX - arrowSize + arrowRoundSize, originY - arrowSize + arrowRoundSize);
          ctx.lineTo(originX - arrowRoundSize + 1, originY - arrowRoundSize + 1);
          ctx.quadraticCurveTo(originX, originY, originX - arrowRoundSize + 1, originY + arrowRoundSize - 1);
          break;
        case 'up':
          originX = lastPoint.x;
          originY = lastPoint.y - lineImgSplit / 2;
          ctx.moveTo(originX + arrowRoundSize - 1, originY + arrowRoundSize - 1);
          ctx.lineTo(originX + arrowSize - arrowRoundSize, originY + arrowSize - arrowRoundSize);
          ctx.quadraticCurveTo(originX + arrowSize, originY + arrowSize, originX + arrowSize - arrowRoundSize, originY + arrowSize);
          ctx.lineTo(originX - arrowSize + arrowRoundSize, originY + arrowSize);
          ctx.quadraticCurveTo(originX - arrowSize, originY + arrowSize, originX - arrowSize + arrowRoundSize, originY + arrowSize - arrowRoundSize);
          ctx.lineTo(originX - arrowRoundSize + 1, originY + arrowRoundSize - 1);
          ctx.quadraticCurveTo(originX, originY, originX + arrowRoundSize - 1, originY + arrowRoundSize - 1);
          break;
        case 'down':
          originX = lastPoint.x;
          originY = lastPoint.y + lineImgSplit / 2;
          ctx.moveTo(originX + arrowRoundSize - 1, originY - arrowRoundSize + 1);
          ctx.lineTo(originX + arrowSize - arrowRoundSize, originY - arrowSize + arrowRoundSize);
          ctx.quadraticCurveTo(originX + arrowSize, originY - arrowSize, originX + arrowSize - arrowRoundSize, originY - arrowSize);
          ctx.lineTo(originX - arrowSize + arrowRoundSize, originY - arrowSize);
          ctx.quadraticCurveTo(originX - arrowSize, originY - arrowSize, originX - arrowSize + arrowRoundSize, originY - arrowSize + arrowRoundSize);
          ctx.lineTo(originX - arrowRoundSize + 1, originY - arrowRoundSize + 1);
          ctx.quadraticCurveTo(originX, originY, originX + arrowRoundSize - 1, originY - arrowRoundSize + 1);
          break;
        default:
          break;
      }
      ctx.fill();
      ctx.restore();
    })
  }
  // 绘制箭头
  private drawFlow() {
    let flowCanvas = this.flowCanvas
    let ctx = this.flowCtx
    let fps = this.fps
    let timeout = 1000 / fps
    // 创建渐变
    let getLinearGradient = (x: number, color: Array<number>) => {
      var grd = ctx.createLinearGradient(x, 0, x + this.flowLength, 0);
      let minNum = (this.flowLength - 1) / this.flowLength
      if (minNum < 0) minNum = 0
      grd.addColorStop(0, `rgba(${color.join()}, 0)`);
      grd.addColorStop(minNum, `rgba(${color.join()}, 1)`);
      grd.addColorStop(1, `rgba(${color.join()}, 1)`);
      return grd
    }
    let drawOneArrow = () => {
      ctx.clearRect(0, 0, flowCanvas.width, flowCanvas.height);
      this.setLineSpace();
      this.lineData.forEach((lineObj, lineIndex) => {
        let { flowOption = {} } = lineObj;
        let { 
          flowWidth = 3, //箭头宽度
          color = [255, 255, 255], //箭头颜色
          isDrawFlow = true, //是否进行流动
          lineCap = 'round' //箭头样式
         } = flowOption
        if (!isDrawFlow) return;
        let allLength = 0 // 线段长度和
        let lineSpace = lineObj.lineSpace
        lineSpace -= this.flowLength
        lineObj.splitLines.forEach((v, i) => {
          let lastAllLength = allLength
          allLength += v.length
          // 折线首尾长度太短不画
          if ((i == 0 || i == lineObj.splitLines.length - 1) && v.length < this.flowLength) return
          // 总长度小于箭头不画
          if (allLength < lineSpace) return
          // 对于v这个线段的开头间距 = step - ( ( 前面线段长度和 - 箭头已经前进的距离 ) % step )
          let step = +this.flowLength + this.stepSize
          let splitLineSpace = 0
          let remain = (lastAllLength - lineSpace) % step
          if (remain == 0) splitLineSpace = 0
          else splitLineSpace = -remain
          let nextDrawLength = splitLineSpace // 下一个箭头需要绘制的距离
          ctx.save();
          ctx.translate(v.fromPixel.x, v.fromPixel.y);
          let angleTrend = lineObj.splitLines[i].angle
          ctx.rotate(angleTrend);
          ctx.lineWidth = flowWidth;
          ctx.lineCap = lineCap;
          let drawArrow = (nextDrawLength: number) => {
            // 动态
            if (-this.flowLength < nextDrawLength && nextDrawLength < 0) {
              let arrowRightlenght = Math.min(this.flowLength + nextDrawLength, v.length)
              if (arrowRightlenght < 0.5) return
              ctx.beginPath();
              ctx.strokeStyle = getLinearGradient(nextDrawLength, color)
              ctx.moveTo(0, 0);
              ctx.lineTo(arrowRightlenght, 0);
              ctx.stroke();
            } else if (nextDrawLength > 0 && nextDrawLength > v.length - this.flowLength) {
              if (v.length - nextDrawLength < 0.5) return
              ctx.beginPath();
              ctx.strokeStyle = getLinearGradient(nextDrawLength, color)
              ctx.moveTo(nextDrawLength, 0);
              ctx.lineTo(v.length, 0);
              ctx.stroke();
            } else if (nextDrawLength >= 0 && nextDrawLength <= v.length - this.flowLength) {
              ctx.beginPath();
              ctx.strokeStyle = getLinearGradient(nextDrawLength, color)
              ctx.moveTo(nextDrawLength, 0);
              ctx.lineTo(nextDrawLength + this.flowLength, 0);
              ctx.stroke();
            }
          }
          while (nextDrawLength < v.length) {
            drawArrow(nextDrawLength)
            nextDrawLength += step
          }
          ctx.restore();
        })
      })
    }
    let lastTime = 0
    let drawFrame = () => {
      this.arrowAnimation = requestAnimationFrame(() => {
        drawFrame()
      })
      let nowTime = +new Date()
      if (nowTime - lastTime < timeout) return
      lastTime = nowTime
      this.arrowRunPx = (this.arrowRunPx + 1) % (this.stepSize + this.flowLength)
      drawOneArrow()
    }
    drawFrame()
  }
  // 设置线段开头间距
  private setLineSpace() {
    let setSpace = (lineObj: LineObj) => {
      let {
        lineOption: {
          lineImgSplit = 6
        } = {}
      } = lineObj;
      let lineSpace = this.arrowRunPx + lineImgSplit; // 线段开头间距
      if (lineObj.lineSpace === null) {
        lineObj.lineSpace = lineSpace;
      }
    }
    this.lineData.forEach((lineObj, i) => {
      lineObj.lineSpace = null
      setSpace(lineObj)
    })
  }
}
export default CreateImgLineFlow;