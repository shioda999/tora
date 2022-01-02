import * as PIXI from "pixi.js"
import { FileManager } from "./FileManager"
export class GraphicManager{
    private callback: () => any
    private preloadList: string[] = []
    private loadedList: string[] = []
    private loadingList: string[] = []
    private texture: PIXI.Texture[][] = []
    private loader: PIXI.Loader
    private frames_json_loaded: boolean = false
    private frames_num: any
    private static instance: GraphicManager
    public static GetInstance(){
        if(!this.instance)this.instance = new GraphicManager()
        return this.instance
    }
    private constructor(){
        this.loader = PIXI.Loader.shared
        FileManager.loadFile("graphic\\frames_num", () => {
            this.frames_json_loaded = true
            this.frames_num = FileManager.getData("graphic\\frames_num")
            this.load()
        })
    }
    public loadGraphics(spriteName: string[]){
        spriteName.forEach(n => this.loadGraphic(n))
    }
    public loadGraphic(spriteName: string){
        if(!this.is_registered(spriteName)){
            this.preloadList.push(spriteName)
            this.load()
        }
    }
    private load(){
        if (this.frames_json_loaded == false || this.loader.loading || this.preloadList.length == 0) return
        const spriteName = this.preloadList.pop()
        const jsonFileName = './asset\\graphic\\' + spriteName + '_sprite.json'
        this.loadingList.push(spriteName)
        this.loader.add(jsonFileName).load(()=>{
            let texture: PIXI.Texture
            this.texture.push([])
            const k = this.texture.length - 1
            for (let i = 0; i < this.frames_num[jsonFileName]; i++) {
                texture = PIXI.Texture.from(spriteName + '_' + i + '.png')
                if(!texture.valid)break
                this.texture[k].push(texture)
            }
            this.loadingList = this.loadingList.filter(n => n !== spriteName)
            this.loadedList.push(spriteName)
            if(!this.is_loading()){
                if(this.callback)this.callback()
                this.callback = undefined
            }
            else{
                this.load()
            }
        })
    }
    public SetLoadedFunc(callback: () => any){
        this.callback = callback
        if(!this.is_loading() && this.callback){
            this.callback()
            this.callback = undefined
        }
    }
    public GetSprite(spriteName: string, index?: number[]){
        const i = this.loadedList.indexOf(spriteName)
        if (i === -1) {
            console.log(spriteName + " did not load.")
            return undefined
        }
        let sprite: PIXI.AnimatedSprite
        let textures
        if(index == undefined)textures = this.texture[i]
        else textures = this.texture[i].filter((n, x) => index.indexOf(x) !== -1)
        sprite = new PIXI.AnimatedSprite(textures)
        if(!index || index && index.length > 1){
            sprite.animationSpeed = 0.5
            sprite.play()
        }
        sprite.name = spriteName
        sprite.anchor.x = sprite.anchor.y = 0.5
        return sprite
    }
    private is_loading(){
        return this.loadingList.length || this.preloadList.length
    }
    private is_registered(spriteName: string){
        return !(this.preloadList.indexOf(spriteName) === -1
        && this.loadingList.indexOf(spriteName) === -1
        && this.loadedList.indexOf(spriteName) === -1)
    }
}