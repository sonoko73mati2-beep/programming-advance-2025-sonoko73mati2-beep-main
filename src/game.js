/**
 * @fileoverview ゲームのメイン画面を担当するモジュール
 * @description ゲームのステージとして機能し、キャラクターを配置・管理する
 * @version 2.0.0
 */

import { Container, Graphics, Rectangle } from 'pixi.js';
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

        this.setupStageEvents();

        this.setupBackground();
        this.setupCharacter();
        this.setupDragListeners();

        window.addEventListener('resize', () => {
            this.onResize();
        });
    }

    /**
     * ドラッグリスナーのセットアップ
     * @method setupDragListeners
     * @private
     */
    setupDragListeners() {
        this.app.stage.on('pointermove', (event) => {
            for (const character of this.characters) {
                if (character.isDragging) {
                    character.updateDrag(event);
                }
            }
        });

        this.app.stage.on('pointerup', () => {
            for (const character of this.characters) {
                if (character.isDragging) {
                    character.onPointerUp();
                }
            }
        });
    }

    /**
     * ステージイベントのセットアップ
     * @method setupStageEvents
     * @private
     */
    setupStageEvents() {
        const { width, height } = this.getStageSize();

        this.app.stage.eventMode = 'static';
        this.app.stage.hitArea = new Rectangle(0, 0, width, height);
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
     * 背景を描画
     * @method drawBackground
     * @private
     */
    drawBackground() {
        const { width, height } = this.getStageSize();

        this.background.clear();
        this.background.rect(0, 0, width, height);
        this.background.fill(0x1099bb);
    }

    /**
     * キャラクターのセットアップ
     * @method setupCharacter
     * @private
     */
    setupCharacter() {
        const { width, height } = this.getStageSize();

        // 3つの異なる色
        const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d];

        for (let i = 0; i < 3; i++) {
            // ランダムな位置を生成
            const randomX = Math.random() * (width - 100) + 50;
            const randomY = Math.random() * (height - 100) + 50;

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
        this.setupStageEvents();
    }

    /**
     * 円同士の衝突判定と反発処理
     * @method checkCollisions
     * @private
     */
    checkCollisions() {
        // すべてのキャラクターペアをチェック
        for (let i = 0; i < this.characters.length; i++) {
            for (let j = i + 1; j < this.characters.length; j++) {
                const char1 = this.characters[i];
                const char2 = this.characters[j];

                // 中心間の距離を計算
                const dx = char2.x - char1.x;
                const dy = char2.y - char1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 2つの円の半径の合計
                const minDistance = char1.size + char2.size;

                // 衝突判定
                if (distance < minDistance && distance > 0) {
                    // 衝突している場合

                    // 正規化された衝突方向ベクトル
                    const nx = dx / distance;
                    const ny = dy / distance;

                    // 重なりを解消（円を離す）
                    const overlap = minDistance - distance;
                    const separationX = nx * overlap * 0.5;
                    const separationY = ny * overlap * 0.5;

                    char1.x -= separationX;
                    char1.y -= separationY;
                    char2.x += separationX;
                    char2.y += separationY;

                    // 相対速度を計算
                    const relativeVelocityX = char2.velocity.x - char1.velocity.x;
                    const relativeVelocityY = char2.velocity.y - char1.velocity.y;

                    // 衝突方向の相対速度成分
                    const velocityAlongNormal = relativeVelocityX * nx + relativeVelocityY * ny;

                    // 既に離れている場合は処理しない
                    if (velocityAlongNormal > 0) {
                        continue;
                    }

                    // 反発係数（0〜1、1で完全弾性衝突）
                    const restitution = 0.8;

                    // 衝突後の速度変化量
                    const impulse = -(1 + restitution) * velocityAlongNormal / 2;

                    // 速度を更新（質量は同じと仮定）
                    char1.velocity.x -= impulse * nx;
                    char1.velocity.y -= impulse * ny;
                    char2.velocity.x += impulse * nx;
                    char2.velocity.y += impulse * ny;
                }
            }
        }
    }

    /**
     * フレーム更新処理
     * @method update
     * @param {number} delta - 前フレームからの経過時間（60FPS基準で1.0が標準）
     */
    update(delta) {
        const bounds = this.getStageSize();

        for (const character of this.characters) {
            character.update(delta, bounds);
        }

        // キャラクター同士の衝突判定
        this.checkCollisions();
    }
}
