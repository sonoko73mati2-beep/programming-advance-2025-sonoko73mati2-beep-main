/**
 * @fileoverview ゲームのメイン画面を担当するモジュール
 * @description ゲームのステージとして機能し、キャラクターを配置・管理する
 * @version 2.0.0
 */

import { Container, Graphics, Rectangle } from 'pixi.js';
import { Character } from './character.js';
import { Monster } from './monster.js';
import { Ball } from './ball.js';

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

        /**
         * 球インスタンス配列
         * @type {Ball[]}
         * @private
         */
        this.balls = [];

        /**
         * ゲーム完了時のコールバック関数
         * @type {Function|null}
         */
        this.onComplete = null;

        /**
         * ゲーム結果（勝利/敗北）
         * @type {boolean}
         * @private
         */
        this.isVictory = false;

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
        this.setupGameEndListener();

        window.addEventListener('resize', () => {
            this.onResize();
        });
    }

    /**
     * ゲーム終了リスナーのセットアップ
     * @method setupGameEndListener
     * @private
     */
    setupGameEndListener() {
        // Escapeキーでゲーム終了（テスト用）
        const handleKeyPress = (event) => {
            if (event.key === 'Escape') {
                this.endGame(true);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        
        // クリーンアップ用に参照を保持
        this.keyPressHandler = handleKeyPress;
    }

    /**
     * ゲームを終了する
     * @method endGame
     * @param {boolean} victory - 勝利したかどうか
     * @private
     */
    endGame(victory) {
        this.isVictory = victory;
        
        // イベントリスナーをクリーンアップ
        if (this.keyPressHandler) {
            window.removeEventListener('keydown', this.keyPressHandler);
        }
        
        // コールバックを呼び出し
        if (this.onComplete) {
            this.onComplete(this.isVictory);
        }
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
        // 球発射時のコールバックを設定
        character.onShootBall = (x, y, vx, vy) => this.shootBall(x, y, vx, vy);
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
     * 球を発射する
     * @method shootBall
     * @param {number} x - 発射位置X
     * @param {number} y - 発射位置Y
     * @param {number} velocityX - X方向の速度
     * @param {number} velocityY - Y方向の速度
     * @private
     */
    shootBall(x, y, velocityX, velocityY) {
        const ball = new Ball(x, y, velocityX, velocityY);
        this.addChild(ball);
        this.balls.push(ball);
        console.log('球を作成:', ball);
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

        // 球とモンスターの当たり判定
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            let ballHit = false;

            for (const monster of this.monsters) {
                // 中心間の距離を計算
                const dx = monster.x - ball.x;
                const dy = monster.y - ball.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 2つの円の半径の合計
                const minDistance = ball.size + monster.size;

                // 衝突判定
                if (distance < minDistance) {
                    // モンスターにダメージを与える（球の威力を使用）
                    monster.hp -= ball.power;
                    console.log(`球がモンスターに衝突！ダメージ: ${ball.power}, モンスターHP: ${monster.hp}`);
                    
                    // モンスターのHPが0以下になった場合
                    if (monster.hp <= 0) {
                        console.log('モンスターが倒されました！');
                        monster.hp = 0;
                        monster.alpha = 0.5; // 半透明にする
                    }

                    ballHit = true;
                    break;
                }
            }

            // 球がモンスターに衝突した場合、球を削除
            if (ballHit) {
                this.removeChild(ball);
                this.balls.splice(i, 1);
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
            
            // キャラクターが死亡したか判定
            if (character.hp <= 0) {
                this.endGame(false); // 敗北
                return;
            }
        }
        
        for (const monster of this.monsters) {
            monster.update(delta, bounds);
        }

        // 球を更新し、画面外に出た球を削除
        for (let i = this.balls.length - 1; i >= 0; i--) {
            const ball = this.balls[i];
            const isAlive = ball.update(delta, bounds);
            if (!isAlive) {
                this.removeChild(ball);
                this.balls.splice(i, 1);
            }
        }

        // 当たり判定をチェック
        this.checkCollisions();
        
        // すべてのモンスターが倒されたか判定
        const allMonstersDefeated = this.monsters.every(monster => monster.hp <= 0);
        if (allMonstersDefeated && this.monsters.length > 0) {
            this.endGame(true); // 勝利
            return;
        }
    }
}
