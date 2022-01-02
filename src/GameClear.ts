import * as PIXI from "pixi.js"
import { Scene } from './Scene';
import { WIDTH, HEIGHT, GlobalParam, load } from './global'
import { Key } from './key'
import { ItemManager } from './ItemManager';
import { Sound } from './Sound';
import { GraphicManager } from "./GraphicManager";
const fontsize = HEIGHT / 25
export class GameClear extends Scene {
	private key: Key
	private loopID: any
	private item_manager: ItemManager
	private text: PIXI.Text
	constructor(container: PIXI.Container) {
		super()
		this.key = Key.GetInstance()
		this.release = () => {
			clearInterval(this.loopID)
		}
        const sprite = GraphicManager.GetInstance().GetSprite("clear")
        sprite.anchor.set(0.5)
        sprite.position.set(WIDTH / 2, HEIGHT / 2)
        sprite.scale.set(0.7)
        container.addChild(sprite)

		const style = new PIXI.TextStyle({
			dropShadow: true,
			dropShadowAngle: 0,
			dropShadowBlur: 20,
			dropShadowColor: "#fffafa",
			dropShadowDistance: 0,
			fill: [
				"#0008ff",
				"#00fffb"
			],
			fillGradientType: 1,
			fillGradientStops: [
				1,
				0,
				0
			],
			fontFamily: "Arial Black",
			fontSize: 50,
			fontStyle: "normal",
			fontWeight: "bold",
			letterSpacing: 2,
			lineJoin: "round",
			miterLimit: 1,
			stroke: "#250033",
			padding: 40,
			strokeThickness: 17,
			textBaseline: "middle"
		});
		this.text = new PIXI.Text("Game Clear!!!", style)
		this.text.position.set(WIDTH / 2, HEIGHT / 5)
		this.text.anchor.set(0.5, 0.5)
		container.addChild(this.text)
		this.item_manager = new ItemManager(WIDTH / 2, HEIGHT * 0.85, WIDTH / 2.5, HEIGHT / 10, container,
			() => this.decide(), undefined)
		this.item_manager.appendItem("Back to Home", HEIGHT / 15, [0xffffff, 0xcccccc, 0x555555], true)

		const text2 = new PIXI.Text("Your score is " + GlobalParam.data.score + ".\nThank you for Playing.", new PIXI.TextStyle({
			fontFamily: "Arial",
			fontWeight: "normal",
			fontSize: fontsize,
			fill: [0xffffff, 0xeeeeee]
		}))
		text2.position.set(WIDTH / 2, HEIGHT * 0.7)
		text2.anchor.set(0.5)
		container.addChild(text2)

		if (!load()) {
			container.removeChildren()
			Sound.play("boo", true, GlobalParam.se_volume)
			return
		}
		this.loopID = setInterval(() => this.loop(), 30)
	}
	private decide() {
		switch (this.item_manager.getFocus()) {
			case 0:
				this.gotoScene("title")
				break
		}
	}
	private loop() {
		if (GlobalParam.pause_flag) return
		this.key.RenewKeyData()
		this.item_manager.update()
	}
}