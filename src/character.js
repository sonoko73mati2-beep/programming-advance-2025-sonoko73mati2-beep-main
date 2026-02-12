/**
 * @fileoverview キャラクタークラスを定義するモジュール
 * @description タップ/クリック可能なキャラクターオブジェクト
 * @version 2.0.0
 */

import { Container, Graphics, Circle, Text } from 'pixi.js';

/**
 * キャラクタークラス
 * @class Character
 * @extends Container
 * @description タップ/クリックに反応するキャラクターオブジェクト
 */
export class Character extends Container {
    /**
     * Characterクラスのコンストラクタ
     * @constructor
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {number} [size=50] - キャラクターのサイズ
     * @param {number} [color=0xff6b6b] - キャラクターの色
     */
    constructor(x, y, size = 50, color = 0xff6b6b) {
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
         * HPテキストオブジェクト
         * @type {Text}
         * @private
         */
        this.hpText = null;

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
         * 前回の位置
         * @type {{x: number, y: number}}
         * @private
         */
        this.lastPosition = { x: 0, y: 0 };

        /**
         * 移動ベクトル
         * @type {{x: number, y: number}}
         * @private
         */
        this.dragVelocity = { x: 0, y: 0 };

        /**
         * 球発射時のコールバック関数
         * @type {Function|null}
         * @private
         */
        this.onShootBall = null;

        /**
         * 体力
         * @type {number}
         * @private
         */
        this.hp = 100;

        /**
         * 最後にダメージを受けた時刻（ミリ秒）
         * @type {number}
         * @private
         */
        this.lastDamageTime = 0;

        /**
         * 無敵時間（ミリ秒）
         * @type {number}
         * @private
         */
        this.invincibilityDuration = 1000;

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

        // HPテキストを作成
        this.hpText = new Text({
            text: `HP: ${this.hp}`,
            style: {
                fontSize: 14,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        });
        this.hpText.anchor.set(0.5, 0.5);
        this.hpText.y = -this.size - 15;
        this.addChild(this.hpText);
    }

    /**
     * イベントのセットアップ
     * @method setupEvents
     * @private
     */
    setupEvents() {
        this.interactive = true;
        this.eventMode = 'static';
        this.cursor = 'pointer';

        // ヒットエリアを設定
        this.hitArea = new Circle(0, 0, this.size);

        this.on('pointerdown', this.onPointerDown, this);
        this.on('pointerup', this.onPointerUp, this);
    }

    /**
     * ポインター押下時のイベントハンドラ
     * @method onPointerDown
     * @param {FederatedPointerEvent} event - ポインターイベントオブジェクト
     */
    onPointerDown(event) {
        this.isDragging = true;
        const colorHex = '0x' + this.color.toString(16).padStart(6, '0').toUpperCase();
        console.log('PointerDown: キャラクターが押されました');
        console.log('色:', colorHex);
        console.log('位置:', this.x, this.y);

        // ドラッグオフセットを計算
        this.dragOffset.x = event.global.x - this.x;
        this.dragOffset.y = event.global.y - this.y;
        
        // 前回の位置を記録
        this.lastPosition.x = this.x;
        this.lastPosition.y = this.y;
        this.dragVelocity.x = 0;
        this.dragVelocity.y = 0;
    }

    /**
     * ポインター離上時のイベントハンドラ
     * @method onPointerUp
     * @param {FederatedPointerEvent} event - ポインターイベントオブジェクト
     */
    onPointerUp(event) {
        if (this.isDragging) {
            // 球を発射
            if (this.onShootBall && (this.dragVelocity.x !== 0 || this.dragVelocity.y !== 0)) {
                this.onShootBall(this.x, this.y, this.dragVelocity.x, this.dragVelocity.y);
                console.log('球を発射:', this.dragVelocity);
            }
        }
        
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

        const newX = event.global.x - this.dragOffset.x;
        const newY = event.global.y - this.dragOffset.y;
        
        // 移動ベクトルを計算
        this.dragVelocity.x = newX - this.lastPosition.x;
        this.dragVelocity.y = newY - this.lastPosition.y;
        
        // 位置を更新
        this.lastPosition.x = this.x;
        this.lastPosition.y = this.y;
        this.x = newX;
        this.y = newY;
    }

    /**
     * ダメージを受ける
     * @method takeDamage
     * @param {number} damage - ダメージ量
     * @returns {boolean} ダメージを受けたかどうか
     */
    takeDamage(damage) {
        const currentTime = Date.now();
        const timeSinceLastDamage = currentTime - this.lastDamageTime;

        // 無敵時間中はダメージを受けない
        if (timeSinceLastDamage < this.invincibilityDuration) {
            return false;
        }

        // ダメージを適用
        this.hp -= damage;
        this.lastDamageTime = currentTime;

        console.log(`ダメージ！残りHP: ${this.hp} (ダメージ: ${damage})`);

        // HPが0以下になったら
        if (this.hp <= 0) {
            console.log('ゲームオーバー！');
            this.hp = 0;
            this.alpha = 0.5; // 半透明にする
        }

        return true;
    }

    /**
     * フレーム更新処理
     * @method update
     * @param {number} delta - 前フレームからの経過時間
     */
    update(delta) {
        // HPテキストを更新
        if (this.hpText) {
            this.hpText.text = `HP: ${this.hp}`;
        }
    }
}
