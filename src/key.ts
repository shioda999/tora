const KEY_INTERVAL = 20
const KEY_INTERVAL2 = 18
export class Key {
    private active: boolean = true
    private gamepadFlag: boolean = true
    private name: string[] = []
    private code: string[] = []
    private name_to_codeIndex: number[][] = []
    private count: number[] = []
    private is_press: boolean[] = []
    private autoRenewKeyFlag: boolean = false
    private static instance: Key
    public static GetInstance() {
        if (!this.instance) this.instance = new Key()
        return this.instance
    }
    private constructor() {
        document.addEventListener('keydown', (event) => {
            let index = this.code.indexOf(event.code)
            if (index === -1) return
            if (this.is_press[index] !== undefined) this.is_press[index] = true
        })
        document.addEventListener('keyup', (event) => {
            let index = this.code.indexOf(event.code)
            if (index === -1) return
            if (this.is_press[index] !== undefined) this.is_press[index] = false
        })
        window.addEventListener("gamepadconnected", () => this.GamePadConnect());
        window.addEventListener("gamepaddisconnected", () => this.GamePadDisconnect());
    }
    public key_register(data: { code: string[], name: string }) {
        if (this.name.indexOf(data.name) === -1) {
            this.name.push(data.name)
            this.name_to_codeIndex.push([])
        }
        data.code.forEach(c => {
            if (this.code.indexOf(c) === -1) {
                this.code.push(c)
                this.is_press.push(false)
                this.count.push(0)
            }
            this.name_to_codeIndex[this.name.indexOf(data.name)].push(this.code.indexOf(c))
        })
    }
    public RenewKeyData() {
        const len = this.code.length
        if (this.autoRenewKeyFlag) setTimeout(() => this.RenewKeyData(), 1000 / 60)
        if (!this.active) return
        if (this.gamepadFlag) this.GamePadCheck()
        for (let i = 0; i < len; i++) {
            if (this.is_press[i]) {
                this.count[i]++
                if (this.count[i] > KEY_INTERVAL) this.count[i] = KEY_INTERVAL2
            }
            else this.count[i] = 0
        }
    }
    public IsPress(name: string) {
        if (this.name.indexOf(name) === -1 || !this.active) return
        let list = this.name_to_codeIndex[this.name.indexOf(name)]
        let len = list.length, i
        for (i = 0; i < len; i++) {
            if (this.count[list[i]] === KEY_INTERVAL || this.count[list[i]] === 1) break
        }
        return i !== len
    }
    public IsPress_Now(name: string) {
        if (this.name.indexOf(name) === -1 || !this.active) return
        let list = this.name_to_codeIndex[this.name.indexOf(name)]
        let len = list.length, i
        for (i = 0; i < len; i++) {
            if (this.is_press[list[i]]) return true
        }
        return false
    }
    private GamePadConnect() {
        this.gamepadFlag = true
        console.log("gamepad connected!!!")
    }
    private GamePadCheck() {
        const kayname = ['B', 'X', 'A', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'L3', 'R3',
            'Up', 'Down', 'Left', 'Right', 'Home']
        let gamepad = navigator.getGamepads()[0];
        if (!gamepad) return
        let len = gamepad.buttons.length
        for (let i = 0; i < len; i++) {
            let key = "Pad" + kayname[i]
            let index = this.code.indexOf(key)
            if (index === -1) continue
            if (gamepad.buttons[i].pressed) {
                if (this.is_press[index] === undefined) continue
                this.is_press[index] = true
            }
            else this.is_press[index] = false
        }
    }
    private GamePadDisconnect() {
        console.log("gamepad Disconnected!!!")
        this.gamepadFlag = false
    }
    public CheckGamePad() {
        return this.gamepadFlag
    }
    public AutoRenewKey() {
        this.autoRenewKeyFlag = true
        this.RenewKeyData()
    }
    public ReleaseAuto() {
        this.autoRenewKeyFlag = false
    }
    public SetInactive() {
        const len = this.code.length
        for (let i = 0; i < len; i++)this.is_press[i] = false
        this.active = false
    }
    public SetActive() {
        this.active = true
    }
}