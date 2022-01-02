import {Screen} from './Screen'
import {SceneManager} from './sceneManager'

const screen = Screen.init()
const container = screen.getContainer()
const scene = SceneManager.init(container)