/**
 * @fileoverview ゲームのメイン画面を担当するモジュール
 * @description ゲームのステージとして機能し、キャラクターを配置・管理する
 * @version 2.0.0
 */

import { Container, Graphics } from 'pixi.js';
import { Character } from './character.js';

/**
 * ゲームのメイン画面クラス
 * @class Game
 * @extends Container
 * @description ゲームのステージとして機能するコンテナクラス
 */
export class Game extends Container {
    /**
     * Gameクラスのコンストラクタ
     * @constructor
     * @param {Application} app - PixiJSアプリケーションインスタンス
     */
    constructor(app) {
        super();

        /**
         * PixiJSアプリケーションインスタンスへの参照
         * @type {Application}
         * @private
         */
        this.app = app;

        /**
         * 背景グラフィックスオブジェクト
         * @type {Graphics}
         * @private
         */
        this.background = null;

        /**
         * キャラクターインスタンス配列
         * @type {Character[]}
         * @private
         */
        this.characters = [];

        this.init();
    }

    /**
     * 初期化処理を実行
     * @method init
     * @private
     */
    init() {
        this.sortableChildren = true;

        this.setupBackground();
        this.setupCharacter();

        window.addEventListener('resize', () => {
            this.onResize();
        });
    }

    /**
     * 背景のセットアップ
     * @method setupBackground
     * @private
     */
    setupBackground() {
        this.background = new Graphics();
        this.drawBackground();
        this.addChild(this.background);
    }

    /**
     * 背景を描画
     * @method drawBackground
     * @private
     */
    drawBackground() {
        this.background.clear();
        this.background.rect(0, 0, this.app.screen.width, this.app.screen.height);
        this.background.fill(0x1099bb);
    }

    /**
     * キャラクターのセットアップ
     * @method setupCharacter
     * @private
     */
    setupCharacter() {
        // 3つの異なる色
        const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d];

        for (let i = 0; i < 3; i++) {
            // ランダムな位置を生成
            const randomX = Math.random() * (this.app.screen.width - 100) + 50;
            const randomY = Math.random() * (this.app.screen.height - 100) + 50;

            // キャラクターをインスタンス化
            const character = new Character(randomX, randomY, 50, colors[i]);
            this.addChild(character);
            this.characters.push(character);
        }
    }

    /**
     * ウィンドウリサイズ時のコールバック処理
     * @method onResize
     */
    onResize() {
        this.drawBackground();
    }

    /**
     * フレーム更新処理
     * @method update
     * @param {number} delta - 前フレームからの経過時間（60FPS基準で1.0が標準）
     */
    update(delta) {
        for (const character of this.characters) {
            character.update(delta);
        }
    }
}
