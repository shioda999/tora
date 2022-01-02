import * as PIXI from "pixi.js"
import { WIDTH, HEIGHT, GlobalParam, G, POS_X, SPEED } from './global'
import { Screen } from './Screen'
import { GraphicManager } from './GraphicManager'
import { Ground } from "./Ground";
import { Sound } from "./Sound";

export class Shot {
    private static id_counter: number = 0
    private sprite: PIXI.Sprite
    public id: number
    private radius: number
    private cnt: number = 0
    public flag: boolean = true
    constructor(private x, private y, private v, private angle: number, name) {
        let graph = GraphicManager.GetInstance()
        this.sprite = graph.GetSprite(name)

        let container = Screen.init().getContainer()
        container.addChild(this.sprite)
        this.sprite.anchor.set(0.5)
        this.sprite.angle = this.angle
        this.sprite.position.set(this.x, this.y)
        this.id = Shot.id_counter++
        this.radius = this.sprite.height / 2
    }
    public update() {
        if(this.sprite == null)return
        this.x += this.v * Math.cos(this.angle) - SPEED
        this.y += this.v * Math.sin(this.angle)
        this.sprite.position.set(this.x, this.y - this.radius)
        this.cnt++
        if(this.cnt >= 300 || this.x < -SPEED * 3 || this.x > WIDTH + SPEED * 3
            || this.y < -SPEED * 3 || this.y > HEIGHT + SPEED * 3)this.release()
    }
    public collision(px: number, py: number, r: number = 0) {
        if(this.sprite == null)return false
        return Math.sqrt(Math.pow(this.x - px, 2) + Math.pow(this.y - py, 2)) <= this.radius + r
    }
    public check_fall() {
        return this.y > HEIGHT * 1.3
    }
    public getx() {
        return this.x
    }
    public gety() {
        return this.y
    }
    public release() {
        this.flag = false
        let container = Screen.init().getContainer()
        container.removeChild(this.sprite)
        this.sprite.destroy()
        this.sprite = null
    }
}