declare type PathsItem = Array<number>;
interface Coordinate {
    x: number;
    y: number;
}
interface LineOption {
    lineWidth?: number;
    arrowSize?: number;
    arrowRoundSize?: number;
    color?: string;
    lineCap?: string;
    lineJoin?: string;
    lineImgSplit?: number;
}
interface FlowOption {
    isDrawFlow?: boolean;
    flowWidth?: number;
    color?: Array<number>;
    lineCap?: string;
}
interface SplitLine {
    angle?: number;
    length?: number;
    originLength?: number;
    paths?: Array<PathsItem>;
    endLines?: Array<SplitLine>;
    startLines?: Array<SplitLine>;
    fromPixel?: Coordinate;
    toPixel?: Coordinate;
}
interface LineObj {
    points: Array<Coordinate>;
    arrowDirection: string;
    lineOption?: LineOption;
    paths?: Array<PathsItem>;
    lineSpace?: number;
    flowOption?: FlowOption;
    originLength?: number;
    splitLines?: Array<SplitLine>;
}
interface TextOption {
    text?: string;
    show?: boolean;
    style?: {
        fontWeight?: string;
        position?: string;
        color?: string;
        fontFamily?: string;
        fontSize?: number;
        imgTextSplit?: number;
    };
}
interface ImgObj extends Coordinate {
    imgUrl: string;
    width: number;
    height: number;
    textOption?: TextOption;
}
declare class CreateImgLineFlow {
    imgData: ImgObj[];
    lineData: LineObj[];
    fps: number;
    stepSize: number;
    flowLength: number;
    canvas: HTMLCanvasElement;
    flowCanvas: HTMLCanvasElement;
    ctx: any;
    flowCtx: any;
    private arrowRunPx;
    private arrowAnimation;
    constructor({ imgData, lineData, fps, stepSize, flowLength, canvas, flowCanvas, ctx, flowCtx }: {
        imgData: Array<ImgObj>;
        lineData?: Array<LineObj>;
        fps?: number;
        stepSize?: number;
        flowLength?: number;
        canvas: HTMLCanvasElement;
        flowCanvas: HTMLCanvasElement;
        ctx: any;
        flowCtx: any;
    });
    private init;
    draw(): void;
    clear(): void;
    private combLine;
    private handleDataBeforeDraw;
    private drawImage;
    private drawLine;
    private drawFlow;
    private setLineSpace;
}
export default CreateImgLineFlow;
