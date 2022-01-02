import * as PIXI from "pixi.js"
import { Scene } from './Scene';
import { WIDTH, HEIGHT, GlobalParam, load } from './global'
import { Sound } from './Sound';
import { GraphicManager } from "./GraphicManager";
const fontsize = HEIGHT / 25

const str = "\
In 2XXX, the year of the tiger,\n\
the Earth was on the verge of being\n\
destroyed by a mysterious\n\
tiger-shaped outer-space creature ...\
"
const INTERVAL = 3
export class Explain extends Scene {
	private loopID: any
	private text: PIXI.Text
    private next: PIXI.Text
    private style
    private pos: number = 0
    private cnt: number = 0
    private interval: number = INTERVAL
	constructor(private container: PIXI.Container) {
		super()
		this.release = () => {
			clearInterval(this.loopID)
		}
        const sprite = GraphicManager.GetInstance().GetSprite("earth")
        sprite.anchor.set(0.5)
        sprite.position.set(WIDTH * 0.15, HEIGHT / 2)
        sprite.scale.set(2)
        container.addChild(sprite)

		this.style = new PIXI.TextStyle({
			fontFamily: "Arial",
			fontWeight: "normal",
			fontSize: 18,
            breakWords: true,
			fill: [0xffffff, 0xeeeeee],
            letterSpacing: 2,
            lineHeight: 50
		})

		this.next = new PIXI.Text("Click Here", new PIXI.TextStyle({
			fontFamily: "Arial",
			fontWeight: "normal",
			fontSize: fontsize,
			fill: [0xffffff, 0xeeeeee]
		}))
        this.next.anchor.set(0.5)
        this.next.position.set(WIDTH * 0.85, HEIGHT * 0.8)
        this.next.alpha = 0
        this.next.interactive = true
        this.next.addListener("mousedown", () => {
            if(this.pos == str.length){
                this.gotoScene("game")
                Sound.play("decide", false, 0.5)
            }
        })
        this.container.addChild(this.next)
		this.loopID = setInterval(() => this.loop(), 80)
	}
    private push_sound(c){
        if(c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c == '.')
            Sound.play("push", false, 1 + (c.charCodeAt(0) % 20) / 20)
    }
	private loop() {
        if(this.pos < str.length){
            if(this.pos >= 1 && str[this.pos - 1] == ','){
                if(this.interval == 0)this.interval = INTERVAL
                else {
                    this.interval--
                    return
                }
            }
            this.push_sound(str[this.pos])
            this.pos++
            if(this.text)this.container.removeChild(this.text)
            this.text = new PIXI.Text(str.substr(0,this.pos), this.style)
            this.text.position.set(WIDTH * 0.6, HEIGHT / 2)
            this.text.anchor.set(0.5, 0.5)
            this.container.addChild(this.text)
        }
        else{
            if(this.cnt % 3 == 0)this.next.alpha = 1 - this.next.alpha
        }
        this.cnt++
	}
}