/**
 * @fileoverview 球クラスを定義するモジュール
 * @description キャラクターが発射する球オブジェクト
 * @version 1.0.0
 */

import { Container, Graphics, Circle } from 'pixi.js';

/**
 * 球クラス
 * @class Ball
 * @extends Container
 * @description キャラクターが発射する球オブジェクト
 */
export class Ball extends Container {
    /**
     * Ballクラスのコンストラクタ
     * @constructor
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} velocityX - X方向の速度
     * @param {number} velocityY - Y方向の速度
     * @param {number} [size=10] - 球のサイズ
     * @param {number} [color=0xffff00] - 球の色
     */
    constructor(x, y, velocityX, velocityY, size = 10, color = 0xffff00) {
        super();

        /**
         * 球のサイズ
         * @type {number}
         * @private
         */
        this.size = size;

        /**
         * 球の色
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
         * 速度ベクトル
         * @type {{x: number, y: number}}
         * @private
         */
        this.velocity = { x: velocityX, y: velocityY };

        /**
         * 威力（攻撃力）
         * @type {number}
         * @private
         */
        this.power = 10;

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
    }

    /**
     * フレーム更新処理
     * @method update
     * @param {number} delta - 前フレームからの経過時間
     * @param {{width: number, height: number}} bounds - 画面の境界
     * @returns {boolean} 球が画面外に出た場合false、それ以外true
     */
    update(delta, bounds) {
        // 速度に基づいて位置を更新
        this.x += this.velocity.x * delta;
        this.y += this.velocity.y * delta;

        // 画面外に出たかチェック
        if (this.x < -this.size || this.x > bounds.width + this.size ||
            this.y < -this.size || this.y > bounds.height + this.size) {
            return false; // 画面外に出た
        }

        return true; // まだ画面内
    }
}
