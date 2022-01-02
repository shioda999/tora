import * as PIXI from "pixi.js"
import { WIDTH, HEIGHT, GlobalParam } from './global'
import { Sound } from './Sound'
const size = 32
export class Screen {
    private static instance: Screen
    private container: PIXI.Container
    public app: PIXI.Application
    public OnresizeFunctions = []
    private scale: number = 1.0
    constructor() {
        Sound.set_master_volume(GlobalParam.master_volume)
        this.container = new PIXI.Container()
        this.setPosition()
        this.AddOnresizeFunc(this.setPosition)
        window.onresize = () => {
            this.OnresizeFunctions.forEach(n => n())
        }
    }
    public static get_scale() {
        return this.instance.scale
    }
    public static init() {
        if (!this.instance)
            this.instance = new Screen();
        return this.instance;
    }
    public getContainer() {
        return this.container
    }
    private setPosition = () => {
        let temp = this.app
        this.app = new PIXI.Application({
            backgroundColor: 0,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight - 10,
            antialias: true
        })
        if (temp) {
            document.body.removeChild(temp.view)
            temp.stage.removeChildren()
            temp.destroy()
        }
        document.body.appendChild(this.app.view)
        this.set_scale()
        this.app.stage.width = document.documentElement.clientWidth
        this.app.stage.height = document.documentElement.clientHeight
        this.container.x = (document.documentElement.clientWidth - WIDTH * this.scale) / 2
        this.container.y = (document.documentElement.clientHeight - HEIGHT * this.scale) / 2
        this.container.scale.set(this.scale)

        const frame = new PIXI.Graphics()
        frame.beginFill(0, 0)
        frame.lineStyle(Math.max(this.container.x, this.container.y), 0x1099bb, 1.0, 1)
        frame.drawRect(this.container.x, this.container.y, WIDTH * this.scale, HEIGHT * this.scale)
        frame.endFill()
        frame.zIndex = 1
        frame.name = "frame"
        this.app.stage.sortableChildren = true
        this.container.sortableChildren = true
        this.app.stage.addChild(frame)
        this.app.stage.addChild(this.container)
    }
    private set_scale() {
        this.scale = Math.min(document.documentElement.clientWidth / WIDTH,
            (document.documentElement.clientHeight - 10) / HEIGHT) - 0.02
    }
    public AddOnresizeFunc(func) {
        this.OnresizeFunctions.push(func)
    }
    public DeleteOnresizeFunc(func) {
        this.OnresizeFunctions = this.OnresizeFunctions.filter(n => n != func)
    }
}