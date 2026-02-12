/**
 * @fileoverview エンディング画面を担当するモジュール
 * @description ゲーム終了後のエンディング画面
 * @version 1.0.0
 */

import { Container, Graphics, Text } from 'pixi.js';

/**
 * エンディング画面クラス
 * @class Ending
 * @extends Container
 * @description ゲーム終了後のエンディング画面を管理
 */
export class Ending extends Container {
    /**
     * Endingクラスのコンストラクタ
     * @constructor
     * @param {Application} app - PixiJSアプリケーションインスタンス
     * @param {boolean} isVictory - 勝利したかどうか
     */
    constructor(app, isVictory = true) {
        super();

        /**
         * PixiJSアプリケーションインスタンスへの参照
         * @type {Application}
         * @private
         */
        this.app = app;

        /**
         * 勝利フラグ
         * @type {boolean}
         * @private
         */
        this.isVictory = isVictory;

        /**
         * 背景グラフィックスオブジェクト
         * @type {Graphics}
         * @private
         */
        this.background = null;

        /**
         * 結果テキスト
         * @type {Text}
         * @private
         */
        this.resultText = null;

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

        const backgroundColor = this.isVictory ? 0x27ae60 : 0xe74c3c;
        this.background = new Graphics();
        this.background.rect(0, 0, width, height);
        this.background.fill(backgroundColor);
        this.addChild(this.background);
    }

    /**
     * テキストのセットアップ
     * @method setupTexts
     * @private
     */
    setupTexts() {
        const { width, height } = this.getStageSize();

        // 結果テキスト
        const resultMessage = this.isVictory ? 'Victory!' : 'Game Over';
        this.resultText = new Text({
            text: resultMessage,
            style: {
                fontSize: 72,
                fill: 0xffffff,
                fontWeight: 'bold',
                align: 'center'
            }
        });
        this.resultText.anchor.set(0.5);
        this.resultText.x = width / 2;
        this.resultText.y = height / 2 - 50;
        this.addChild(this.resultText);

        // 説明テキスト
        this.instructionText = new Text({
            text: 'クリックしてタイトルに戻る',
            style: {
                fontSize: 24,
                fill: 0xffffff,
                align: 'center'
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
            const backgroundColor = this.isVictory ? 0x27ae60 : 0xe74c3c;
            this.background.rect(0, 0, width, height);
            this.background.fill(backgroundColor);
        }

        if (this.resultText) {
            this.resultText.x = width / 2;
            this.resultText.y = height / 2 - 50;
        }

        if (this.instructionText) {
            this.instructionText.x = width / 2;
            this.instructionText.y = height / 2 + 80;
        }
    }
}
