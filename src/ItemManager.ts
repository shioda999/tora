import { Item } from './Item'
import * as PIXI from "pixi.js"
import { WIDTH, HEIGHT, GlobalParam } from './global'
import { Key } from './key'
import { Sound } from './Sound'
export class ItemManager {
    private currentFocusId: number = 0
    private key: Key
    private padding = HEIGHT / 20
    private items: Item[] = []
    private textcontainers: PIXI.Container[] = []
    private show_flag: boolean = true
    private text: string[] = []
    private styles: PIXI.TextStyle[] = []
    private no_focus_flag: boolean = false
    private click_flag: boolean = false
    constructor(private sx: number, private sy: number, private width: number, private height: number, private container: PIXI.Container,
        private decide: () => any, private cancel: () => any, private anchor_x = 0.5, private anchor_y = 0.5,
        private sound_decide = "decide", private sound_cancel = "back", private sound_fail = "back", private bk_color = 0x00004B) {
        this.key = Key.GetInstance()
    }
    public appendItem = (text: string, size: number, color = [0x000000], bold = false, active = true, bk_color = this.bk_color) => {
        const style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontWeight: bold ? "bold" : "normal",
            fontSize: size,
            fill: color
        });
        this.styles.push(style)
        this.text.push(text)
        const textContainer = new PIXI.Container()
        const graph = new PIXI.Graphics()
        const textdata = new PIXI.Text(text, style)
        const w = this.width
        const h = this.height
        graph.beginFill(bk_color)
        graph.drawRoundedRect(-w / 2, -h / 2, w, h, h / 10);
        graph.endFill();
        graph.interactive = true
        let v = this.items.length
        graph.on("pointerdown", () => { this.onclick(v) })
        graph.name = "graph"
        this.textcontainers.push(textContainer)
        textContainer.addChild(graph)
        textdata.anchor.x = 0.5
        textdata.anchor.y = 0.5
        textdata.name = "textdata"
        textContainer.addChild(textdata)
        let new_item = new Item(textContainer, this.container, this.items.length, WIDTH / 40)
        new_item.sendCurrentSelectingItemID(0)
        new_item.setActiveFlag(active)
        this.items.push(new_item)

        let H = this.items.length * (h + this.padding) - this.padding
        for (let i = 0; i < this.items.length; i++) {
            let text = this.items[i].itemContainer
            text.position.x = this.sx - w * (this.anchor_x - 0.5)
            text.position.y = this.sy - H * this.anchor_y + i * (h + this.padding) + h * 0.5
        }
    }
    private onclick(id: number) {
        this.currentFocusId = id
        this.click_flag = true
    }
    public update() {
        if (this.key.IsPress("Up")) { this.up() }
        if (this.key.IsPress("Down")) { this.down() }
        if ((this.key.IsPress("decide") || this.click_flag) && this.decide) {
            if (this.items[this.currentFocusId].IsActive()) {
                Sound.play(this.sound_decide, false, GlobalParam.se_volume)
                this.decide()
            }
            else Sound.play(this.sound_fail, false, GlobalParam.se_volume)
        }
        if (this.key.IsPress("cancel") && this.cancel) {
            Sound.play(this.sound_cancel, false, GlobalParam.se_volume), this.cancel()
        }
    }
    public SetPadding(padding: number) {
        this.padding = padding
    }
    private up() {
        this.currentFocusId += this.items.length - 1
        this.updateFocusID()
    }
    private down() {
        this.currentFocusId += 1
        this.updateFocusID()
    }
    private updateFocusID() {
        if (this.items.length === 0) this.currentFocusId = 0
        else this.currentFocusId %= this.items.length
        if (this.no_focus_flag) this.currentFocusId = -1
        for (let i = 0; i < this.items.length; i++) {
            this.items[i].sendCurrentSelectingItemID(this.currentFocusId)
        }
    }
    public setFocus(ID: number) {
        this.currentFocusId = ID
        this.updateFocusID()
    }
    public getFocus() {
        return this.currentFocusId
    }
    public delete() {
        this.textcontainers.forEach(n => {
            n.removeChildren()
            this.container.removeChild(n)
        })
    }
    public hide() {
        if (!this.show_flag) return
        this.show_flag = false
        this.items.forEach(n => this.container.removeChild(n.itemContainer))
    }
    public show() {
        if (this.show_flag) return
        this.show_flag = true
        this.items.forEach(n => this.container.addChild(n.itemContainer))
    }
    public getstr() {
        return this.text[this.getFocus()]
    }
    public no_focus() {
        this.no_focus_flag = true
        this.updateFocusID()
    }
    public change_str(id: number, str: string) {
        this.textcontainers[id].removeChild(this.textcontainers[id].getChildByName("textdata"))
        this.text[id] = str
        const textdata = new PIXI.Text(str, this.styles[id])
        textdata.anchor.x = 0.5
        textdata.anchor.y = 0.5
        textdata.name = "textdata"
        this.textcontainers[id].addChild(textdata)
    }
}