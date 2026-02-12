/**
 * @fileoverview モンスタークラスを定義するモジュール
 * @description タップ/クリック可能なモンスターオブジェクト
 * @version 2.0.0
 */

import { Container, Graphics, Circle, Text } from 'pixi.js';

/**
 * モンスタークラス
 * @class Monster
 * @extends Container
 * @description タップ/クリックに反応するキャラクターオブジェクト
 */
export class Monster extends Container {
    /**
     * Monsterクラスのコンストラクタ
     * @constructor
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} [size=50] - キャラクターのサイズ
     * @param {number} [color=0xff6b6b] - キャラクターの色
     * @param {number} [attackPower=10] - 攻撃力
     */
    constructor(x, y, size = 50, color = 0xff6b6b, attackPower = 10) {
        super();

        /**
         * キャラクターのサイズ
         * @type {number}
         * @private
         */
        this.size = size;

        /**
         * キャラクターの色
         * @type {number}
         * @private
         */
        this.color = color;

        /**
         * グラフィックスオブジェクト
         * @type {Graphics}
         * @private
         */
        this.graphics = null;

        /**
         * 攻撃力テキストオブジェクト
         * @type {Text}
         * @private
         */
        this.attackPowerText = null;

        /**
         * ドラッグ中フラグ
         * @type {boolean}
         * @private
         */
        this.isDragging = false;

        /**
         * ドラッグ時のオフセット
         * @type {{x: number, y: number}}
         * @private
         */
        this.dragOffset = { x: 0, y: 0 };

        /**
         * 速度ベクトル
         * @type {{x: number, y: number}}
         * @private
         */
        this.velocity = { x: 0, y: 0 };

        /**
         * 攻撃力
         * @type {number}
         * @private
         */
        this.attackPower = attackPower + (Math.floor(Math.random() * 5) - 2); // ±2の範囲でランダム
        
        // 攻撃力が負にならないように制限
        if (this.attackPower < 1) {
            this.attackPower = 1;
        }

        /**
         * 直近のポインター位置
         * @type {{x: number, y: number} | null}
         * @private
         */
        this.lastPointerPos = null;

        /**
         * 直近のポインター時刻(ms)
         * @type {number}
         * @private
         */
        this.lastPointerTime = 0;

        this.x = x;
        this.y = y;

        this.init();
    }

    /**
     * 初期化処理
     * @method init
     * @private
     */
    init() {
        this.createGraphics();
        this.setupEvents();
    }

    /**
     * グラフィックスの作成
     * @method createGraphics
     * @private
     */
    createGraphics() {
        this.graphics = new Graphics();
        this.graphics.circle(0, 0, this.size);
        this.graphics.fill(this.color);
        this.addChild(this.graphics);

        // 攻撃力テキストを作成
        this.attackPowerText = new Text({
            text: `ATK: ${this.attackPower}`,
            style: {
                fontSize: 14,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        });
        this.attackPowerText.anchor.set(0.5, 0.5);
        this.attackPowerText.y = -this.size - 15;
        this.addChild(this.attackPowerText);
    }

    /**
     * イベントのセットアップ
     * @method setupEvents
     * @private
     */
    setupEvents() {
        // Monsterはドラッグできません（Characterのみドラッグ可能）
    }

    /**
     * ポインター押下時のイベントハンドラ
     * @method onPointerDown
     * @param {FederatedPointerEvent} event - ポインターイベントオブジェクト
     */
    onPointerDown(event) {
        this.isDragging = true;

        // ドラッグオフセットを計算
        this.dragOffset.x = event.global.x - this.x;
        this.dragOffset.y = event.global.y - this.y;
    }

    /**
     * ポインター離上時のイベントハンドラ
     * @method onPointerUp
     * @param {FederatedPointerEvent} event - ポインターイベントオブジェクト
     */
    onPointerUp(event) {
        this.isDragging = false;
        console.log('PointerUp: キャラクターが離されました');
    }

    /**
     * ドラッグ中の更新
     * @method updateDrag
     * @param {FederatedPointerEvent} event - ポインターイベントオブジェクト
     */
    updateDrag(event) {
        if (!this.isDragging) {
            return;
        }

        this.x = event.global.x - this.dragOffset.x;
        this.y = event.global.y - this.dragOffset.y;
    }

    /**
     * フレーム更新処理
     * @method update
     * @param {number} delta - 前フレームからの経過時間
     */
    update(delta, bounds) {
        // 攻撃力は固定（初期化時に設定済み）
    }
}
