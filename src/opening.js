/**
 * @fileoverview オープニング画面を担当するモジュール
 * @description ゲーム開始前のオープニング画面
 * @version 1.0.0
 */

import { Container, Graphics, Text } from 'pixi.js';

/**
 * オープニング画面クラス
 * @class Opening
 * @extends Container
 * @description ゲーム開始前のオープニング画面を管理
 */
export class Opening extends Container {
    /**
     * Openingクラスのコンストラクタ
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
         * タイトルテキスト
         * @type {Text}
         * @private
         */
        this.titleText = null;

        /**
         * 説明テキスト
         * @type {Text}
         * @private
         */
        this.instructionText = null;

        /**
         * 完了時のコールバック関数
         * @type {Function|null}
         */
        this.onComplete = null;

        this.init();
    }

    /**
     * 初期化処理
     * @method init
     * @private
     */
    init() {
        this.setupBackground();
        this.setupTexts();
        this.setupInteraction();
    }

    /**
     * 背景のセットアップ
     * @method setupBackground
     * @private
     */
    setupBackground() {
        const { width, height } = this.getStageSize();

        this.background = new Graphics();
        this.background.rect(0, 0, width, height);
        this.background.fill(0x2c3e50);
        this.addChild(this.background);
    }

    /**
     * テキストのセットアップ
     * @method setupTexts
     * @private
     */
    setupTexts() {
        const { width, height } = this.getStageSize();

        // タイトルテキスト
        this.titleText = new Text({
            text: 'Monster Battle',
            style: {
                fontSize: 64,
                fill: 0xffffff,
                fontWeight: 'bold',
                align: 'center'
            }
        });
        this.titleText.anchor.set(0.5);
        this.titleText.x = width / 2;
        this.titleText.y = height / 2 - 50;
        this.addChild(this.titleText);

        // 説明テキスト
        this.instructionText = new Text({
            text: 'キャラクターをドラッグして球を発射！\nモンスターを倒そう！\n\nクリックしてスタート',
            style: {
                fontSize: 24,
                fill: 0xecf0f1,
                align: 'center',
                lineHeight: 40
            }
        });
        this.instructionText.anchor.set(0.5);
        this.instructionText.x = width / 2;
        this.instructionText.y = height / 2 + 80;
        this.addChild(this.instructionText);
    }

    /**
     * インタラクションのセットアップ
     * @method setupInteraction
     * @private
     */
    setupInteraction() {
        this.eventMode = 'static';
        this.cursor = 'pointer';

        this.on('pointerdown', () => {
            if (this.onComplete) {
                this.onComplete();
            }
        });
    }

    /**
     * 描画サイズを取得
     * @method getStageSize
     * @private
     * @returns {{width:number, height:number}}
     */
    getStageSize() {
        const width = this.app.screen.width || this.app.renderer.width || window.innerWidth;
        const height = this.app.screen.height || this.app.renderer.height || window.innerHeight;

        return { width, height };
    }

    /**
     * リサイズ処理
     * @method onResize
     */
    onResize() {
        const { width, height } = this.getStageSize();

        if (this.background) {
            this.background.clear();
            this.background.rect(0, 0, width, height);
            this.background.fill(0x2c3e50);
        }

        if (this.titleText) {
            this.titleText.x = width / 2;
            this.titleText.y = height / 2 - 50;
        }

        if (this.instructionText) {
            this.instructionText.x = width / 2;
            this.instructionText.y = height / 2 + 80;
        }
    }
}
