import * as PIXI from "pixi.js"
import { Screen } from './Screen'
import { WIDTH } from "./global"
import { Sound } from "./Sound"
export class Laser{
    private graph: PIXI.Graphics
    private cnt: number = 0
    public flag: boolean = true
    public on: boolean = false
    constructor(private data, private thick, private time = 30, private color = 0xff00ff){
        this.graph = new PIXI.Graphics()
        this.graph.rotation = data.angle
        this.graph.zIndex = 100
        let container = Screen.init().getContainer()
        container.addChild(this.graph)
    }
    public update(){
        if(this.data.x < 0){
            this.release()
            return
        }
        this.graph.position.set(this.data.x, this.data.y)
        this.graph.rotation = this.data.angle
        const K = this.thick
        const TIME = 50
        this.graph.clear()
        if(this.cnt < TIME){
            let path = [0, 0, K, this.thick * this.cnt / TIME,
                WIDTH, this.thick * this.cnt / TIME,
                WIDTH,  - this.thick * this.cnt / TIME,
                K,  - this.thick * this.cnt / TIME]
            this.graph.lineStyle(1, 0xffffff)
            this.graph.beginFill(0, 0)
            this.graph.drawPolygon(path)
            this.graph.endFill()
            if(this.cnt == TIME - 1)Sound.play("laser", false, 0.5)
        }
        else if(this.cnt % 3 == 0){
            let path = [0, 0, K, this.thick,
                WIDTH, this.thick, WIDTH, - this.thick,
                K, - this.thick]
            this.graph.lineStyle(0)
            this.graph.beginFill(this.color, 0.8)
            this.graph.drawPolygon(path)
            path = [0, 0, K, this.thick * 0.5,
                WIDTH, this.thick * 0.5, WIDTH, - this.thick * 0.5,
                K, - this.thick * 0.5]
            this.graph.beginFill(0xffffff, 1)
            this.graph.drawPolygon(path)
            this.graph.endFill()
            this.on = true
            if(this.cnt >= TIME + this.time)this.release()
        }
        this.cnt++
    }
    public collision(px: number, py: number, r:number = 0){
        if(!this.on)return false
        let dx = px - this.data.x
        let dy = py - this.data.y
        let vx = Math.cos(this.graph.rotation)
        let vy = Math.sin(this.graph.rotation)
        return Math.abs(dx*vy-dy*vx) < r + this.thick
    }
    public release() {
        this.flag = false
        let container = Screen.init().getContainer()
        container.removeChild(this.graph)
        this.graph.destroy()
        this.graph = null
        this.data = null
        this.on = false
    }
}