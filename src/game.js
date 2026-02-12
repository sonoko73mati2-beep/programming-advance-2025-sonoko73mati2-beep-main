/**
 * @fileoverview ゲームのメイン画面を担当するモジュール
 * @description ゲームのステージとして機能し、キャラクターを配置・管理する
 * @version 2.0.0
 */

import { Container, Graphics, Rectangle, Sprite } from 'pixi.js';
import { Character } from './character.js';
import { Monster } from './monster.js';
import subFish2ImageUrl from '../assets/Subfish_2.PNG';
import subFish3ImageUrl from '../assets/Subfish_3.PNG';
import subFish4ImageUrl from '../assets/Subfish_4.PNG';
import backgroundImageUrl from '../assets/background.jpg';

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
         * @type {Sprite}
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

        /**
         * キー入力状態
         * @type {{ArrowUp: boolean, ArrowDown: boolean, ArrowLeft: boolean, ArrowRight: boolean}}
         * @private
         */
        this.keyState = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };

        /**
         * キーボード移動速度
         * @type {number}
         * @private
         */
        this.keyMoveSpeed = 4;

        /**
         * 最後にモンスターをスポーンした時刻
         * @type {number}
         * @private
         */
        this.lastSpawnTime = Date.now();

        /**
         * モンスタースポーン間隔（ミリ秒）
         * @type {number}
         * @private
         */
        this.spawnInterval = 6000;

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
        this.setupKeyboardControls();

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
     * キーボード操作のセットアップ
     * @method setupKeyboardControls
     * @private
     */
    setupKeyboardControls() {
        const handleKeyDown = (event) => {
            if (event.key in this.keyState) {
                this.keyState[event.key] = true;
            }
        };

        const handleKeyUp = (event) => {
            if (event.key in this.keyState) {
                this.keyState[event.key] = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        this.keyDownHandler = handleKeyDown;
        this.keyUpHandler = handleKeyUp;
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

        if (this.keyDownHandler) {
            window.removeEventListener('keydown', this.keyDownHandler);
        }

        if (this.keyUpHandler) {
            window.removeEventListener('keyup', this.keyUpHandler);
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
        this.background = Sprite.from(backgroundImageUrl);
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

        if (this.background) {
            this.background.width = width;
            this.background.height = height;
        }
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
        character.zIndex = 10;
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
        const character = this.characters[0];
        const characterBufferRadius = 30;

        // 6つの異なる色（少し暗めの色）
        const colors = [0x8b0000, 0x006400, 0xff8c00, 0x2f4f4f, 0x556b2f, 0x4b0082];
        const sizes = [40, 45, 50, 55, 60, 65];

        for (let i = 0; i < 12; i++) {
            const size = sizes[i % 4];
            let randomX = 0;
            let randomY = 0;
            let attempts = 0;

            while (attempts < 50) {
                randomX = Math.random() * (width - size * 2) + size;
                randomY = Math.random() * (height - size * 2) + size;

                let isValid = true;

                if (character) {
                    const dx = randomX - character.x;
                    const dy = randomY - character.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = characterBufferRadius + size;

                    if (distance < minDistance) {
                        isValid = false;
                    }
                }

                if (isValid) {
                    for (const other of this.monsters) {
                        const dx = randomX - other.x;
                        const dy = randomY - other.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const minDistance = size + other.size;

                        if (distance < minDistance) {
                            isValid = false;
                            break;
                        }
                    }
                }

                if (isValid) {
                    break;
                }

                attempts += 1;
            }

            // モンスターをインスタンス化（攻撃力を指定）
            const attackPower = 10 + i * 5; // 各モンスターで異なる攻撃力
            const fishType = Math.floor(i / 4); // 0-3: type0, 4-7: type1, 8-11: type2
            const imageUrl = fishType === 0 ? subFish2ImageUrl : fishType === 1 ? subFish3ImageUrl : fishType === 2 ? subFish4ImageUrl : undefined;
            const scaleX = fishType === 0 ? 2 : fishType === 2 ? 2.5 : fishType === 3 ? 2 : 1;
            const scaleY = fishType === 0 ? 4 : fishType === 2 ? 2.5 : fishType === 3 ? 2 : 1;
            const monster = new Monster(
                randomX,
                randomY,
                size,
                colors[i],
                attackPower,
                imageUrl,
                scaleX,
                scaleY
            );
            monster.zIndex = 0;
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
     * 画面端からモンスターをスポーンする
     * @method spawnMonster
     * @private
     */
    spawnMonster() {
        const { width, height } = this.getStageSize();
        
        // Subfish_3のみを生成
        const fishType = 1;
        const sizes = [40, 45, 50, 55];
        const colors = [0x8b0000, 0x006400, 0xff8c00, 0x2f4f4f];
        const size = sizes[fishType];
        
        // ランダムに画面端を選択（0=上, 1=右, 2=下, 3=左）
        const edge = Math.floor(Math.random() * 4);
        let x, y;
        
        switch (edge) {
            case 0: // 上端
                x = Math.random() * width;
                y = -size;
                break;
            case 1: // 右端
                x = width + size;
                y = Math.random() * height;
                break;
            case 2: // 下端
                x = Math.random() * width;
                y = height + size;
                break;
            case 3: // 左端
                x = -size;
                y = Math.random() * height;
                break;
        }
        
        const attackPower = 10 + fishType * 5;
        const imageUrl = fishType === 0 ? subFish2ImageUrl : fishType === 1 ? subFish3ImageUrl : fishType === 2 ? subFish4ImageUrl : undefined;
        const scaleX = fishType === 0 ? 2 : fishType === 2 ? 2.5 : fishType === 3 ? 2 : 1;
        const scaleY = fishType === 0 ? 4 : fishType === 2 ? 2.5 : fishType === 3 ? 2 : 1;
        
        const monster = new Monster(
            x,
            y,
            size,
            colors[fishType],
            attackPower,
            imageUrl,
            scaleX,
            scaleY
        );
        monster.zIndex = 0;
        this.addChild(monster);
        this.monsters.push(monster);
    }

    /**
     * キャラクターとモンスターの当たり判定
     * @method checkCollisions
     * @private
     */
    checkCollisions() {
        for (const character of this.characters) {
            for (const monster of this.monsters) {
                if (monster.isDefeated) {
                    continue;
                }

                // 中心間の距離を計算
                const dx = monster.x - character.x;
                const dy = monster.y - character.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 2つの円の半径の合計
                const minDistance = character.size + monster.size;

                // 衝突判定
                if (distance < minDistance) {
                    const characterWidth = character.graphics?.width ?? character.size * 2;
                    const characterHeight = character.graphics?.height ?? character.size * 2;
                    const characterArea = characterWidth * characterHeight;
                    const monsterWidth = monster.graphics?.width ?? monster.size * 2;
                    const monsterHeight = monster.graphics?.height ?? monster.size;
                    const monsterArea = monsterWidth * monsterHeight;

                    if (monsterArea < characterArea) {
                        monster.isDefeated = true;
                        monster.alpha = 0.5;
                        monster.velocity.x = 0;
                        monster.velocity.y = 0;
                        character.growBy(1.1);
                    } else {
                        this.endGame(false);
                        return;
                    }

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

        // モンスター同士の重なりを解消
        for (let i = 0; i < this.monsters.length; i++) {
            for (let j = i + 1; j < this.monsters.length; j++) {
                const monsterA = this.monsters[i];
                const monsterB = this.monsters[j];

                if (monsterA.isDefeated || monsterB.isDefeated) {
                    continue;
                }

                const dx = monsterB.x - monsterA.x;
                const dy = monsterB.y - monsterA.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = monsterA.size + monsterB.size;

                if (distance < minDistance) {
                    const overlap = minDistance - distance;
                    const nx = distance === 0 ? 1 : dx / distance;
                    const ny = distance === 0 ? 0 : dy / distance;

                    monsterA.x -= nx * overlap * 0.5;
                    monsterA.y -= ny * overlap * 0.5;
                    monsterB.x += nx * overlap * 0.5;
                    monsterB.y += ny * overlap * 0.5;
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

        // モンスタースポーン処理
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime >= this.spawnInterval) {
            this.spawnMonster();
            this.lastSpawnTime = currentTime;
        }

        for (const character of this.characters) {
            const moveX = (this.keyState.ArrowRight ? 1 : 0) - (this.keyState.ArrowLeft ? 1 : 0);
            const moveY = (this.keyState.ArrowDown ? 1 : 0) - (this.keyState.ArrowUp ? 1 : 0);

            if (moveX !== 0 || moveY !== 0) {
                character.x += moveX * this.keyMoveSpeed * delta;
                character.y += moveY * this.keyMoveSpeed * delta;

                const minX = character.size;
                const maxX = bounds.width - character.size;
                const minY = character.size;
                const maxY = bounds.height - character.size;

                if (character.x < minX) {
                    character.x = minX;
                } else if (character.x > maxX) {
                    character.x = maxX;
                }

                if (character.y < minY) {
                    character.y = minY;
                } else if (character.y > maxY) {
                    character.y = maxY;
                }
            }

            character.update(delta, bounds);
        }
        
        const character = this.characters[0];
        const characterWidth = character?.graphics?.width ?? character?.size * 2 ?? 0;
        const characterHeight = character?.graphics?.height ?? character?.size * 2 ?? 0;
        const size1Area = characterWidth * characterHeight;

        for (const monster of this.monsters) {
            monster.update(delta, bounds, size1Area);
        }

        // 画面外に出たモンスターを削除
        for (let i = this.monsters.length - 1; i >= 0; i--) {
            const monster = this.monsters[i];
            const margin = 200; // 画面外の余裕
            if (monster.x < -margin || monster.x > bounds.width + margin ||
                monster.y < -margin || monster.y > bounds.height + margin) {
                this.removeChild(monster);
                this.monsters.splice(i, 1);
            }
        }

        // 当たり判定をチェック
        this.checkCollisions();
        
        // すべてのモンスターが倒されたか判定
        const allMonstersDefeated = this.monsters.every(monster => monster.isDefeated);
        if (allMonstersDefeated && this.monsters.length > 0) {
            this.endGame(true); // 勝利
            return;
        }
    }
}
