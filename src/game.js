/**
 * @fileoverview ゲームのメイン画面を担当するモジュール
 * @description ゲームのステージとして機能し、キャラクターを配置・管理する
 * @version 2.0.0
 */

import { Container, Graphics, Rectangle } from 'pixi.js';
import { Character } from './character.js';
import { Monster } from './monster.js';

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

        /**
         * モンスターインスタンス配列
         * @type {Monster[]}
         * @private
         */
        this.monsters = [];

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
        this.setupMonster();
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

        // ランダムな位置を生成
        const randomX = Math.random() * (width - 100) + 50;
        const randomY = Math.random() * (height - 100) + 50;

        // キャラクターをインスタンス化（1体のみ、モンスターの1/2のサイズ）
        const character = new Character(randomX, randomY, 25, 0xff6b6b);
        this.addChild(character);
        this.characters.push(character);
    }

    /**
     * モンスターのセットアップ
     * @method setupMonster
     * @private
     */
    setupMonster() {
        const { width, height } = this.getStageSize();

        // 3つの異なる色（少し暗めの色）
        const colors = [0x8b0000, 0x006400, 0xff8c00];

        for (let i = 0; i < 3; i++) {
            // ランダムな位置を生成
            const randomX = Math.random() * (width - 100) + 50;
            const randomY = Math.random() * (height - 100) + 50;

            // モンスターをインスタンス化（攻撃力を指定）
            const attackPower = 10 + i * 5; // 各モンスターで異なる攻撃力
            const monster = new Monster(randomX, randomY, 50, colors[i], attackPower);
            this.addChild(monster);
            this.monsters.push(monster);
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
     * キャラクターとモンスターの当たり判定
     * @method checkCollisions
     * @private
     */
    checkCollisions() {
        for (const character of this.characters) {
            for (const monster of this.monsters) {
                // 中心間の距離を計算
                const dx = monster.x - character.x;
                const dy = monster.y - character.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 2つの円の半径の合計
                const minDistance = character.size + monster.size;

                // 衝突判定
                if (distance < minDistance) {
                    // ダメージ処理（無敵時間を考慮）
                    character.takeDamage(monster.attackPower);

                    // 重ならないように離す
                    const overlap = minDistance - distance;
                    const nx = dx / distance;
                    const ny = dy / distance;
                    character.x -= nx * overlap * 0.5;
                    character.y -= ny * overlap * 0.5;
                    monster.x += nx * overlap * 0.5;
                    monster.y += ny * overlap * 0.5;
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
        for (const monster of this.monsters) {
            monster.update(delta, bounds);
        }

        // 当たり判定をチェック
        this.checkCollisions();
    }
}
