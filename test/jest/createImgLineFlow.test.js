import { CreateImgLineFlow } from '@/index';
test('测试 CreateImgLineFlow', () => {
  let canvas = document.createElement('canvas');
  let flowCanvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 500;
  flowCanvas.width = 500;
  flowCanvas.height = 500;
  document.body.appendChild(canvas);
  document.body.appendChild(flowCanvas);
  setTimeout(() => {
    let ctx = canvas.getContext('2d');
    let flowCtx = flowCanvas.getContext('2d');
    ctx.clearRect(0, 0, 500, 500);
    flowCtx.clearRect(0, 0, 500, 500);
    let imgData = [{
        imgUrl: require('https://img0.baidu.com/it/u=151392495,873552640&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'),
        textOption: {
          text: '测试1',
          show: true,
          style: {
            fontWeight: '600',
            position: 'bottom',
          }
        },
        x: 200,
        y: 200,
        width: 21,
        height: 16
      }, {
        imgUrl: require('https://img0.baidu.com/it/u=151392495,873552640&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'),
        textOption: {
          text: '测试1',
          show: true,
          style: {
            fontWeight: '600',
            position: 'bottom',
          }
        },
        x: 400,
        y: 200,
        width: 21,
        height: 16
    }]
    let lineData = [{
        points: [{
          x: 200,
          y: 200
        }, {
          x: 400,
          y: 200
        }],
        arrowDirection: 'right'
    }]
    expect(new CreateImgLineFlow({
      lineData,
      imgData,
      canvas: canvas,
      flowCanvas: flowCanvas,
      ctx: ctx,
      flowCtx: flowCtx
    }))
  }, 1000);
})