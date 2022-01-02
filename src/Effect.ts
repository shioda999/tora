import * as PIXI from "pixi.js"
import { GraphicManager } from './GraphicManager'
import { Screen } from './Screen'
import { Sound } from "./Sound"
export class Effect{
    private sprite: PIXI.AnimatedSprite
    constructor(x: number, y:number, type:string, large = 1.0){
        const container = Screen.init().getContainer()
        let graph = GraphicManager.GetInstance()
        this.sprite = graph.GetSprite(type)
        container.addChild(this.sprite)
        this.sprite.anchor.set(0.5, 0.8)
        this.sprite.position.set(x, y)
        this.sprite.play()
        this.sprite.loop = false
        this.sprite.blendMode = PIXI.BLEND_MODES.ADD
        this.sprite.scale.set(0.5 * large)
        Sound.play("explosion", false, 0.5)
        this.sprite.onComplete = () => {
            container.removeChild(this.sprite)
            this.sprite = null
        }
    }
}