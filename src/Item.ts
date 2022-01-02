import * as PIXI from "pixi.js"
export class Item{
    private focusGraph: PIXI.Graphics
    private active: boolean = true
    private alpha :number
    constructor(public itemContainer: PIXI.Container, private background: PIXI.Container, private id: number, private padding: number, private color = 0xFFFF33){
        this.alpha = this.itemContainer.getChildByName("textdata").alpha
        this.draw()
    }
    public draw(){
        this.background.addChild(this.itemContainer)
    }
    public setActiveFlag(active: boolean){
        this.active = active
        this.itemContainer.getChildByName("textdata").alpha = (active ? 1.0 : 0.5) * this.alpha
        //this.draw()
    }
    private setFocusFlag(flag: boolean){
        const text: any = this.itemContainer.getChildByName("textdata")
        const graph: any = this.itemContainer.getChildByName("graph")
        if(flag){
            if(this.focusGraph === undefined){
                let w = graph.width
                let h = graph.height
                this.focusGraph = new PIXI.Graphics()
                this.focusGraph.blendMode = PIXI.BLEND_MODES.ADD;
                for(let i = 0; i < 3; i++){
                    w += this.padding / 10, h += this.padding / 10
                    this.focusGraph.lineStyle(this.padding / 4, this.color, 0.3);
                    this.focusGraph.drawRoundedRect(
                        - w / 2, - h / 2, w, h, graph.height / 3);
                }
                this.focusGraph.endFill();
            }
            graph.addChild(this.focusGraph)
        }
        else if(this.focusGraph)graph.removeChild(this.focusGraph)
    }
    public sendCurrentSelectingItemID(id: number){
        this.setFocusFlag(this.id === id)
    }
    public IsActive() {
        return this.active
    }
}