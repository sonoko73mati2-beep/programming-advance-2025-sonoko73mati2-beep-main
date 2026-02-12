/**
 * @fileoverview モンスタークラスを定義するモジュール
 * @description タップ/クリック可能なモンスターオブジェクト
 * @version 2.0.0
 */

import { Container, Circle, Sprite, Text } from 'pixi.js';
import subFishImageUrl from '../assets/Subfish_1.PNG';

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
     * @param {string} [imageUrl=subFishImageUrl] - モンスター画像のURL
     * @param {number} [scaleX=1] - 横方向スケール
     * @param {number} [scaleY=1] - 縦方向スケール
     */
    constructor(
        x,
        y,
        size = 50,
        color = 0xff6b6b,
        attackPower = 10,
        imageUrl = subFishImageUrl,
        scaleX = 1,
        scaleY = 1
    ) {
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
         * 画像URL
         * @type {string}
         * @private
         */
        this.imageUrl = imageUrl;

        /**
         * 画像スケール
         * @type {{x: number, y: number}}
         * @private
         */
        this.imageScale = { x: scaleX, y: scaleY };

        /**
         * サイズテキストオブジェクト
         * @type {Text}
         * @private
         */
        this.sizeText = null;


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

        const speed = 0.3 + Math.random() * 0.2;
        const angle = Math.random() * Math.PI * 2;
        this.velocity.x = Math.cos(angle) * speed;
        this.velocity.y = Math.sin(angle) * speed;

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
         * 体力
         * @type {number}
         * @private
         */
        this.hp = 200 + (Math.floor(Math.random() * 41) - 20); // ±20の範囲でランダム (180-220)
        
        // HPが負にならないように制限
        if (this.hp < 1) {
            this.hp = 1;
        }

        /**
         * 倒されたかどうか
         * @type {boolean}
         * @private
         */
        this.isDefeated = false;

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
        this.graphics = Sprite.from(this.imageUrl);
        this.graphics.anchor.set(0.5, 0.5);
        this.graphics.width = this.size * 2 * this.imageScale.x;
        this.graphics.height = this.size * this.imageScale.y;
        this.addChild(this.graphics);

        // サイズテキストを作成
        this.sizeText = new Text({
            text: 'SIZE: --',
            style: {
                fontSize: 14,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        });
        this.sizeText.anchor.set(0.5, 0.5);
        this.sizeText.y = -this.size - 15;
        this.addChild(this.sizeText);
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
    update(delta, bounds, size1Area) {
        if (this.isDefeated) {
            return;
        }

        if (typeof size1Area === 'number') {
            this.updateSizeIndicator(size1Area);
        }

        if (this.graphics && this.velocity.x !== 0) {
            if (this.velocity.x > 0) {
                this.graphics.scale.x = -Math.abs(this.graphics.scale.x);
            } else if (this.velocity.x < 0) {
                this.graphics.scale.x = Math.abs(this.graphics.scale.x);
            }
        }

        if (bounds) {
            this.x += this.velocity.x * delta;
            this.y += this.velocity.y * delta;

            const minX = this.size;
            const maxX = bounds.width - this.size;
            const minY = this.size;
            const maxY = bounds.height - this.size;

            if (this.x < minX) {
                this.x = minX;
                this.velocity.x *= -1;
            } else if (this.x > maxX) {
                this.x = maxX;
                this.velocity.x *= -1;
            }

            if (this.y < minY) {
                this.y = minY;
                this.velocity.y *= -1;
            } else if (this.y > maxY) {
                this.y = maxY;
                this.velocity.y *= -1;
            }
        }

    }

    /**
     * サイズ指標を更新
     * @method updateSizeIndicator
     * @param {number} size1Area - キャラクターの面積
     * @private
     */
    updateSizeIndicator(size1Area) {
        if (!this.sizeText || size1Area <= 0) {
            return;
        }

        const width = this.graphics?.width ?? this.size * 2;
        const height = this.graphics?.height ?? this.size;
        const monsterArea = width * height;
        const ratio = monsterArea / size1Area;

        this.sizeText.text = `SIZE: ${ratio.toFixed(2)}`;
    }
}
