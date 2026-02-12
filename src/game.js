/**
 * @fileoverview ゲームのメイン画面を担当するモジュール
 * @description ゲームのステージとして機能し、キャラクターを配置・管理する
 * @version 2.0.0
 */

import { Container, Graphics, Rectangle, Sprite, Text } from 'pixi.js';
import { Character } from './character.js';
import { Monster } from './monster.js';
import subFishImageUrl from '../assets/Subfish_1.PNG';
import subFish2ImageUrl from '../assets/Subfish_2.PNG';
import subFish3ImageUrl from '../assets/Subfish_3.PNG';
import subFish4ImageUrl from '../assets/Subfish_4.PNG';
import subFish5ImageUrl from '../assets/Subfish_5.PNG';
import sharkImageUrl from '../assets/shark.PNG';
import bgmUrl from '../assets/437_long_BPM120.mp3';
import backgroundImageUrl from '../assets/background.jpg';
import patSoundUrl from '../assets/パッ.mp3';
import papaSoundUrl from '../assets/パパッ.mp3';
import petaSoundUrl from '../assets/ペタッ.mp3';

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
        this.keyMoveSpeed = 6;

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
        /**
         * スコア（倒したモンスターのSIZE合計）
         * @type {number}
         * @private
         */
        this.score = 0;

        /**
         * スコアテキスト
         * @type {Text}
         * @private
         */
        this.scoreText = null;

        /**
         * ゲーム開始時刻
         * @type {number}
         * @private
         */
        this.startTime = Date.now();

        /**
         * 制限時間（ミリ秒）
         * @type {number}
         * @private
         */
        this.timeLimit = 20000;

        /**
         * タイマーテキスト
         * @type {Text}
         * @private
         */
        this.timerText = null;

        /**
         * BGM音声
         * @type {HTMLAudioElement|null}
         * @private
         */
        this.bgm = null;
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
        this.setupUI();
        this.setupBgm();

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
     * @param {number} score - 最終スコア
     * @private
     */
    endGame(victory, score = null) {
        this.isVictory = victory;
        const finalScore = score !== null ? score : this.score;

        this.stopBgm();
        
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
            this.onComplete(this.isVictory, finalScore);
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
        const sizes = [40, 45, 50, 55, 45, 45, 45, 45, 50, 50, 50, 50, 10, 10, 10, 10, 10, 100, 35, 35, 35];

        for (let i = 0; i < 21; i++) {
            const size = sizes[i % sizes.length];
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
            let fishType;
            if (i < 4) {
                fishType = 0; // Subfish_2
            } else if (i < 8) {
                fishType = 1; // Subfish_3
            } else if (i < 12) {
                fishType = 2; // Subfish_4
            } else if (i < 17) {
                fishType = 4; // Subfish_5
            } else if (i < 18) {
                fishType = 5; // Shark
            } else {
                fishType = 3; // Subfish_1
            }
            const imageUrl = fishType === 0 ? subFish2ImageUrl : fishType === 1 ? subFish3ImageUrl : fishType === 2 ? subFish4ImageUrl : fishType === 3 ? subFishImageUrl : fishType === 4 ? subFish5ImageUrl : fishType === 5 ? sharkImageUrl : undefined;
            const scaleX = fishType === 0 ? 3 : fishType === 1 ? 1.8 : fishType === 2 ? 2.5 : fishType === 3 ? 4 : fishType === 4 ? 3 : fishType === 5 ? 2 : 1;
            const scaleY = fishType === 0 ? 4 : fishType === 1 ? 1.8 : fishType === 2 ? 2.5 : fishType === 3 ? 4 : fishType === 4 ? 3 : fishType === 5 ? 2 : 1;
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
     * UIの初期化（スコアとタイマー）
     * @method setupUI
     * @private
     */
    setupUI() {
        const { width } = this.getStageSize();

        // スコア表示
        this.scoreText = new Text({
            text: 'SCORE: 0.00',
            style: {
                fontSize: 24,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        });
        this.scoreText.x = width - 200;
        this.scoreText.y = 20;
        this.addChild(this.scoreText);

        // タイマー表示
        this.timerText = new Text({
            text: 'TIME: 20.0',
            style: {
                fontSize: 24,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        });
        this.timerText.x = width - 200;
        this.timerText.y = 60;
        this.addChild(this.timerText);
    }

    /**
     * BGMのセットアップ
     * @method setupBgm
     * @private
     */
    setupBgm() {
        this.bgm = new Audio(bgmUrl);
        this.bgm.loop = true;
        this.bgm.volume = 0.4;

        const playPromise = this.bgm.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
        }
    }

    /**
     * BGMの停止
     * @method stopBgm
     * @private
     */
    stopBgm() {
        if (!this.bgm) {
            return;
        }
        this.bgm.pause();
        this.bgm.currentTime = 0;
    }

    /**
     * ランダムに敵倒時の効果音を再生
     * @method playRandomDefeatSound
     * @private
     */
    playRandomDefeatSound() {
        const soundUrls = [patSoundUrl, papaSoundUrl, petaSoundUrl];
        const randomIndex = Math.floor(Math.random() * soundUrls.length);
        const selectedUrl = soundUrls[randomIndex];

        const defeatSound = new Audio(selectedUrl);
        defeatSound.volume = 0.6;

        const playPromise = defeatSound.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
        }
    }

    /**
     * 画面端からモンスターをスポーンする
     * @method spawnMonster
     * @private
     */
    spawnMonster() {
        const { width, height } = this.getStageSize();
        
        // Subfish_1-5からランダムに選択
        const fishType = Math.floor(Math.random() * 5);
        const sizes = [40, 45, 50, 55, 10];
        const colors = [0x8b0000, 0x006400, 0xff8c00, 0x2f4f4f, 0x800080];
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
        const imageUrl = fishType === 0 ? subFish2ImageUrl : fishType === 1 ? subFish3ImageUrl : fishType === 2 ? subFish4ImageUrl : fishType === 3 ? subFishImageUrl : subFish5ImageUrl;
        const scaleX = fishType === 0 ? 3 : fishType === 1 ? 1.8 : fishType === 2 ? 2.5 : fishType === 3 ? 2 : fishType === 4 ? 3 : 1;
        const scaleY = fishType === 0 ? 4 : fishType === 1 ? 1.8 : fishType === 2 ? 2.5 : fishType === 3 ? 2 : fishType === 4 ? 3 : 1;
        
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

                        // スコアを加算（キャラクターに対する相対サイズ）
                        const size1Area = characterWidth * characterHeight / (1.1 * 1.1); // 成長前のサイズ
                        const monsterSize = monsterArea / size1Area;
                        this.score += monsterSize;
                        if (this.scoreText) {
                            this.scoreText.text = `SCORE: ${this.score.toFixed(2)}`;
                        }

                        // ランダムに効果音を再生
                        this.playRandomDefeatSound();

                        // 敵を画面から削除
                        this.removeChild(monster);
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

        // タイマー更新
        const elapsed = currentTime - this.startTime;
        const remaining = Math.max(0, (this.timeLimit - elapsed) / 1000);
        if (this.timerText) {
            this.timerText.text = `TIME: ${remaining.toFixed(1)}`;
        }

        // 時間切れチェック
        if (elapsed >= this.timeLimit) {
            this.endGame('timeup', this.score); // 時間切れで終了
            return;
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
