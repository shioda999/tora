import * as PIXI from "pixi.js"
import { Scene } from './Scene';
import { WIDTH, HEIGHT, GlobalParam, G, SPEED } from './global'
import { Key } from './key'
import { Screen } from './Screen'
import { GraphicManager } from './GraphicManager'
import { Ground } from "./Ground";
import { Sound } from "./Sound";
import { Shot } from "./Shot";
import { Effect } from "./Effect";
const style = new PIXI.TextStyle({
    fill: [
        "#d6d6d6",
    ],
    fontFamily: "Arial Black",
    fontSize: 25,
    fontWeight: "bold",
    letterSpacing: 2,
    miterLimit: 1,
    padding: 40,
    textBaseline: "middle"
});

export class Tora {
    private key: Key
    private x: number = WIDTH / 2
    private y: number = HEIGHT / 2
    private vx: number = 0
    private vy: number = 0
    private ax: number = 0
    private ay: number = 0
    private sprite: PIXI.Sprite
    private is_click: boolean = false
    private prev_key_state: boolean = false
    private cnt: number = 0
    private container
    private dying_cnt:number = 0
    public death: boolean = false
    constructor(private ground, private create_shot) {
        this.key = Key.GetInstance()

        let graph = GraphicManager.GetInstance()
        this.sprite = graph.GetSprite("tora")

        this.container = Screen.init().getContainer()
        this.container.addChild(this.sprite)
        this.sprite.anchor.set(0.5)
        this.sprite.position.set(this.x, this.y)
    }
    private onclick = () => {
        this.is_click = true
    }
    private offclick = () => {
        this.is_click = false
    }
    private distance(dy, dx) {
        return Math.sqrt(dy*dy+dx*dx)
    }
    public update() {
        if(this.sprite == null)return
        const mouse = Screen.init().app.renderer.plugins.interaction.mouse.getLocalPosition(this.container);
        const angle = Math.atan2(mouse.y - this.y + this.sprite.height * 0.3,mouse.x - this.x)
        const r = Math.min(this.distance(mouse.y - this.y + this.sprite.height * 0.3,mouse.x - this.x), 10)
        this.vx = r * Math.cos(angle)
        this.vy = r * Math.sin(angle)
        let prev_y = this.y
        let prev_x = this.x
        let border_y =  this.ground.get_groundHeight(this.x)
        this.x += this.vx
        this.y += this.vy
        if (this.y > border_y) {
            let dx, loss = 1000000000, ans = -20
            for (dx = -10;dx <= 10; dx++){
                if(this.y <= this.ground.get_groundHeight(prev_x + dx)){
                    if (loss > Math.abs(dx)){
                        loss = Math.abs(dx)
                        ans = dx
                    }
                }
            }
            if(Math.abs(this.y - border_y) < Math.abs(ans)){
                this.y = border_y
            }
            else this.x = prev_x + ans
        }
        this.x = Math.min(WIDTH, Math.max(0, this.x))
        this.y = Math.min(HEIGHT, Math.max(20, this.y))
        if(this.x == 0 && this.y > this.ground.get_groundHeight(this.x)){
            this.dying_cnt++
            if(this.dying_cnt > 20){
                this.death = true
                new Effect(this.x, this.y - 10, "explosion", 1)
            }
        }
        else this.dying_cnt = 0
        this.sprite.position.set(this.x, this.y - this.sprite.height / 2)

        if (this.prev_key_state == false && this.key.IsPress_Now("decide")) {
            this.prev_key_state = true
        }
        if (this.prev_key_state == true && !this.key.IsPress_Now("decide")) {
            this.prev_key_state = false
        }
        if (this.cnt % 15 == 0)this.create_shot(this.x + 20, this.y, 5 + SPEED, 0)
        this.cnt++
    }
    public check_fall() {
        return this.y > HEIGHT * 1.3
    }5
    public getx() {
        return this.x
    }
    public gety() {
        return this.y
    }
    public release() {
        let container = Screen.init().getContainer()
        container.removeChild(this.sprite)
        this.sprite.destroy()
        this.sprite = null
    }
}