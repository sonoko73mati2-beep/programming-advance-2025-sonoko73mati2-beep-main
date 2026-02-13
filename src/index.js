/**
 * @fileoverview アプリケーションのエントリーポイント
 * @description PixiJSアプリケーションの初期化とゲーム画面の起動を行う

 */

import { Application, Assets } from 'pixi.js';
import { Opening } from './opening.js';
import { Game } from './game.js';
import { Ending } from './ending.js';
import fishImageUrl from '../assets/fish.png';
import subFishImageUrl from '../assets/Subfish_1.PNG';
import subFish2ImageUrl from '../assets/Subfish_2.PNG';
import subFish3ImageUrl from '../assets/Subfish_3.PNG';
import subFish4ImageUrl from '../assets/Subfish_4.PNG';
import subFish5ImageUrl from '../assets/Subfish_5.PNG';
import sharkImageUrl from '../assets/shark.PNG';
import bgmUrl from '../assets/437_long_BPM120.mp3';
import backgroundImageUrl from '../assets/background.jpg';
import titleImageUrl from '../assets/title.PNG';
import startButtonImageUrl from '../assets/start_button.PNG';
import startSoundUrl from '../assets/効果音１.mp3';
import gameOverSoundUrl from '../assets/効果音２.mp3';
import gameOverEnterSoundUrl from '../assets/効果音３.mp3';
import timeUpSoundUrl from '../assets/効果音４.mp3';
import patSoundUrl from '../assets/パッ.mp3';
import papaSoundUrl from '../assets/パパッ.mp3';
import petaSoundUrl from '../assets/ペタッ.mp3';

/**
 * PixiJSアプリケーションの初期化クラス
 * @class Init
 * @description PixiJS Applicationのインスタンス生成と初期設定を管理する
 *              ウィンドウサイズに追従するレスポンシブ対応を含む
 */
class Init {
    /**
     * Initクラスのコンストラクタ
     * @constructor
     */
    constructor() {
        /**
         * PixiJSアプリケーションインスタンス
         * @type {Application|null}
         * @private
         */
        this.app = null;
    }

    /**
     * PixiJSアプリケーションのセットアップを実行
     * @async
     * @method setup
     * @returns {Promise<Application>} 初期化されたPixiJSアプリケーションインスタンス
     */
    async setup() {
        this.app = new Application();

        await Assets.load([fishImageUrl, subFishImageUrl, subFish2ImageUrl, subFish3ImageUrl, subFish4ImageUrl, subFish5ImageUrl, sharkImageUrl, bgmUrl, backgroundImageUrl, titleImageUrl, startButtonImageUrl, startSoundUrl, gameOverSoundUrl, gameOverEnterSoundUrl, timeUpSoundUrl, patSoundUrl, papaSoundUrl, petaSoundUrl]);

        await this.app.init({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x1099bb,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            resizeTo: window
        });

        document.body.appendChild(this.app.canvas);

        window.addEventListener('resize', () => {
            this.onResize();
        });

        return this.app;
    }

    /**
     * ウィンドウリサイズ時のコールバック処理
     * @method onResize
     */
    onResize() {
        if (this.app) {
            this.app.renderer.resize(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * PixiJSアプリケーションインスタンスを取得
     * @method getApp
     * @returns {Application|null}
     */
    getApp() {
        return this.app;
    }
}

/**
 * ゲーム画面遷移管理クラス
 * @class GameManager
 * @description Opening → Game → Ending の画面遷移を管理
 */
class GameManager {
    /**
     * GameManagerクラスのコンストラクタ
     * @constructor
     * @param {Application} app - PixiJSアプリケーションインスタンス
     */
    constructor(app) {
        /**
         * PixiJSアプリケーションインスタンス
         * @type {Application}
         * @private
         */
        this.app = app;

        /**
         * 現在のシーン
         * @type {Container|null}
         * @private
         */
        this.currentScene = null;

        /**
         * ゲームループ用のティッカー関数
         * @type {Function|null}
         * @private
         */
        this.tickerFunction = null;

        // リサイズ処理を設定
        window.addEventListener('resize', () => {
            this.onResize();
        });

        this.showOpening();
    }

    /**
     * ウィンドウリサイズ時のコールバック処理
     * @method onResize
     */
    onResize() {
        if (this.currentScene && this.currentScene.onResize) {
            this.currentScene.onResize();
        }
    }

    /**
     * 現在のシーンをクリア
     * @method clearScene
     * @private
     */
    clearScene() {
        // ティッカーを削除
        if (this.tickerFunction) {
            this.app.ticker.remove(this.tickerFunction);
            this.tickerFunction = null;
        }

        // シーンを削除
        if (this.currentScene) {
            this.app.stage.removeChild(this.currentScene);
            this.currentScene = null;
        }
    }

    /**
     * オープニング画面を表示
     * @method showOpening
     */
    showOpening() {
        this.clearScene();

        const opening = new Opening(this.app);
        opening.onComplete = () => {
            this.showGame();
        };

        this.app.stage.addChild(opening);
        this.currentScene = opening;

        console.log('Opening画面を表示');
    }

    /**
     * ゲーム画面を表示
     * @method showGame
     */
    showGame() {
        this.clearScene();

        const game = new Game(this.app);
        game.onComplete = (isVictory, score) => {
            this.showEnding(isVictory, score);
        };

        this.app.stage.addChild(game);
        this.currentScene = game;

        // ゲームループを開始
        this.tickerFunction = (ticker) => {
            game.update(ticker.deltaTime);
        };
        this.app.ticker.add(this.tickerFunction);

        console.log('Game画面を表示');
    }

    /**
     * エンディング画面を表示
     * @method showEnding
     * @param {boolean|string} isVictory - 勝利したかどうか、または'timeup'
     * @param {number} score - 最終スコア
     */
    showEnding(isVictory, score = 0) {
        this.clearScene();

        const ending = new Ending(this.app, isVictory, score);
        ending.onComplete = () => {
            this.showOpening();
        };

        this.app.stage.addChild(ending);
        this.currentScene = ending;

        console.log('Ending画面を表示:', isVictory === 'timeup' ? 'Time Up' : isVictory ? 'Victory' : 'Game Over', 'Score:', score);
    }
}

/**
 * アプリケーションのメインエントリーポイント
 */
(async () => {
    const init = new Init();
    const app = await init.setup();

    // フォールバックメッセージを削除
    const fallbackMessage = document.getElementById('fallback-message');
    if (fallbackMessage) {
        fallbackMessage.remove();
    }

    // ゲーム画面遷移管理を開始
    new GameManager(app);
})();
