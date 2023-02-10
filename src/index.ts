import CreateImgLineFlow from './core/index';
// let canvas: HTMLCanvasElement = document.querySelector('#canvas');
// let flowCanvas: HTMLCanvasElement = document.querySelector('#flowCanvas');
// let { clientHeight, clientWidth } = canvas;
// let { clientHeight: flowClientHeight, clientWidth: flowClientWidth } = canvas;
// canvas.width = clientWidth;
// canvas.height = clientHeight;
// flowCanvas.width = flowClientWidth;
// flowCanvas.height = flowClientHeight;
// let ctx: any = canvas.getContext('2d');
// let flowCtx: any = flowCanvas.getContext('2d');
// ctx.clearRect(0, 0, 500, 500);
// flowCtx.clearRect(0, 0, 500, 500);
// let imgData = [{
//   imgUrl: 'https://img0.baidu.com/it/u=151392495,873552640&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
//   textOption: {
//     text: '测试1',
//     show: true,
//     style: {
//       fontWeight: '600',
//       position: 'bottom',
//     }
//   },
//   x: 200,
//   y: 200,
//   width: 50,
//   height: 50
// }, {
//   imgUrl: 'https://img0.baidu.com/it/u=151392495,873552640&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
//   textOption: {
//     text: '测试2',
//     show: true,
//     style: {
//       fontWeight: '600',
//       position: 'bottom',
//     }
//   },
//   x: 400,
//   y: 200,
//   width: 50,
//   height: 50
// }]
// let lineData = [{
//   points: [{
//     x: 260,
//     y: 225
//   }, {
//     x: 390,
//     y: 225
//   }],
//   arrowDirection: 'right'
// }]
// let createImgLineFlow = new CreateImgLineFlow({
//   lineData,
//   imgData,
//   canvas,
//   flowCanvas,
//   ctx,
//   flowCtx
// })
// createImgLineFlow.draw();
export default CreateImgLineFlow