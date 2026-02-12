/**
 * @fileoverview オープニング画面を担当するモジュール
 * @description ゲーム開始前のオープニング画面
 * @version 1.0.0
 */

import { Container, Graphics, Text, Sprite } from 'pixi.js';
import titleImageUrl from '../assets/title.PNG';
import startButtonImageUrl from '../assets/start_button.PNG';
import startSoundUrl from '../assets/効果音１.mp3';

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
         * スタートボタン
         * @type {Sprite}
         * @private
         */
        this.startButton = null;

        /**
         * スタートボタン効果音
         * @type {HTMLAudioElement|null}
         * @private
         */
        this.startSound = null;

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

        this.background = Sprite.from(titleImageUrl);
        
        // 画像の本来のアスペクト比を取得
        const imageAspectRatio = this.background.texture.width / this.background.texture.height;
        const screenAspectRatio = width / height;
        
        // アスペクト比を保ったまま、画面全体をカバーするようにスケーリング
        if (imageAspectRatio > screenAspectRatio) {
            // 画像が横長の場合は高さに合わせる
            this.background.height = height;
            this.background.width = height * imageAspectRatio;
        } else {
            // 画像が縦長の場合は幅に合わせる
            this.background.width = width;
            this.background.height = width / imageAspectRatio;
        }
        
        // 中央に配置
        this.background.anchor.set(0.5);
        this.background.x = width / 2;
        this.background.y = height / 2;
        
        this.addChild(this.background);
    }

    /**
     * テキストのセットアップ
     * @method setupTexts
     * @private
     */
    setupTexts() {
        const { width, height } = this.getStageSize();

        // ルール説明1
        const rulesText1 = new Text({
            text: '矢印キーで操作',
            style: {
                fontSize: 32,
                fill: 0x000000,
                fontWeight: 'bold',
                align: 'center'
            }
        });
        rulesText1.anchor.set(0.5);
        rulesText1.x = width / 2;
        rulesText1.y = height / 2 + 320;
        this.addChild(rulesText1);

        // ルール説明2
        const rulesText2 = new Text({
            text: '自分より小さいお魚を食べて成長しよう！',
            style: {
                fontSize: 32,
                fill: 0x000000,
                align: 'center'
            }
        });
        rulesText2.anchor.set(0.5);
        rulesText2.x = width / 2;
        rulesText2.y = height / 2 + 360;
        this.addChild(rulesText2);
    }

    /**
     * インタラクションのセットアップ
     * @method setupInteraction
     * @private
     */
    setupInteraction() {
        const { width, height } = this.getStageSize();

        // スタートボタンを作成
        this.startButton = Sprite.from(startButtonImageUrl);
        this.startButton.anchor.set(0.5);
        this.startButton.x = width / 2;
        this.startButton.y = height / 2 + 200;
        this.startButton.scale.set(0.5);
        this.startButton.eventMode = 'static';
        this.startButton.cursor = 'pointer';

        // ホバーエフェクト
        this.startButton.on('pointerover', () => {
            this.startButton.scale.set(0.55);
        });

        this.startButton.on('pointerout', () => {
            this.startButton.scale.set(0.5);
        });

        this.startButton.on('pointerdown', () => {
            if (this.startSound) {
                this.startSound.currentTime = 0;
                const playPromise = this.startSound.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(() => {});
                }
            }
            if (this.onComplete) {
                this.onComplete();
            }
        });

        this.addChild(this.startButton);

        this.startSound = new Audio(startSoundUrl);
        this.startSound.volume = 0.6;
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
