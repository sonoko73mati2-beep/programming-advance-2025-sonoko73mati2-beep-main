/**
 * @fileoverview エンディング画面を担当するモジュール
 * @description ゲーム終了後のエンディング画面
 * @version 1.0.0
 */

import { Container, Graphics, Text, Sprite } from 'pixi.js';
import backgroundImageUrl from '../assets/background.jpg';

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
     * @param {boolean|string} isVictory - 勝利したかどうか、または'timeup'
     * @param {number} score - 最終スコア
     */
    constructor(app, isVictory = true, score = 0) {
        super();

        /**
         * PixiJSアプリケーションインスタンスへの参照
         * @type {Application}
         * @private
         */
        this.app = app;

        /**
         * 勝利フラグ
         * @type {boolean|string}
         * @private
         */
        this.isVictory = isVictory;

        /**
         * 最終スコア
         * @type {number}
         * @private
         */
        this.score = score;

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

        if (this.isVictory === false) {
            // Game Overの場合は真っ黒な背景
            this.background = new Graphics();
            this.background.rect(0, 0, width, height);
            this.background.fill(0x000000);
        } else {
            // Victory または Time Upの場合は背景画像を表示
            this.background = Sprite.from(backgroundImageUrl);
            this.background.width = width;
            this.background.height = height;
        }
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
        let resultMessage;
        if (this.isVictory === 'timeup') {
            resultMessage = 'Time Up!';
        } else {
            resultMessage = this.isVictory ? 'Victory!' : 'Game Over';
        }
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
        this.resultText.y = height / 2 - 80;
        this.addChild(this.resultText);

        // スコアテキスト
        if (this.isVictory === 'timeup' || this.score > 0) {
            this.scoreText = new Text({
                text: `SCORE: ${this.score.toFixed(2)}`,
                style: {
                    fontSize: 48,
                    fill: 0xffff00,
                    fontWeight: 'bold',
                    align: 'center'
                }
            });
            this.scoreText.anchor.set(0.5);
            this.scoreText.x = width / 2;
            this.scoreText.y = height / 2 + 20;
            this.addChild(this.scoreText);
        }

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
        this.instructionText.y = height / 2 + 100;
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
