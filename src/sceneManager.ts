import * as PIXI from "pixi.js"
import { Title } from './Title'
import { Key } from './key'
import { SceneType, Scene } from './Scene'
import { Fade } from './Fade'
import { GraphicManager } from './GraphicManager'
import { Sound } from './Sound'
import { Game } from "./Game"
import { GRAPH_FNAME } from './global'
import { GameClear } from "./GameClear"
import { Explain } from "./Explain"
export class SceneManager {
    private key: Key
    private static instance: SceneManager
    private sceneName: SceneType[] = []
    private scene
    private constructor(private container: PIXI.Container) {
        Scene.SetGotoSceneFunction((v) => this.gotoScene(v), this.exitCurrentScene)
        const inst = GraphicManager.GetInstance()
        inst.loadGraphics(GRAPH_FNAME)
        Sound.load("sound\\bgm.mp3", "bgm")
        Sound.load("sound\\explosion.mp3", "explosion")
        Sound.load("sound\\decide.mp3", "decide")
        Sound.load("sound\\back.mp3", "back")
        Sound.load("sound\\shot.mp3", "shot")
        Sound.load("sound\\laser.mp3", "laser")
        Sound.load("sound\\hit.mp3", "hit")
        Sound.load("sound\\push.mp3", "push")
        Sound.load("sound\\powerup.mp3", "powerup")
        //Sound.load("sound\\damage.mp3", "damage")
        //Sound.load("sound\\game_over.mp3", "over")
        //Sound.set_master_volume(0)

        this.key = Key.GetInstance()
        this.key.key_register({ code: ["Enter", "PadA"], name: "decide" })
        this.key.key_register({ code: ["Backspace", "PadB"], name: "cancel" })
        this.key.key_register({ code: ["r"], name: "r" })
        this.gotoScene("title")
    }
    public static init(container: PIXI.Container) {
        if (!this.instance)
            this.instance = new SceneManager(container);
        return this.instance;
    }
    private exitCurrentScene = () => {
        this.sceneName.pop()
    }
    private gotoScene(name: SceneType) {
        if (name === "back") {
            name = this.sceneName.pop()
            if (this.sceneName.length > 0) name = this.sceneName.pop()
        }
        this.sceneName.push(name)
        if (this.scene) {
            if (this.scene.release !== undefined) this.scene.release()
            delete this.scene
        }
        const fade = new Fade(this.container, () => {
            this.container.removeChildren()
            this.scene = new {
                title: Title,
                game: Game,
                clear: GameClear,
                explain: Explain
            }[name](this.container)
        })
    }
}