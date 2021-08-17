import Button from "framework/components/Button";
import Image from "framework/components/Image";
import SpineAnimation from "framework/components/SpineAnimation";
import Stage, {Layout} from "framework/components/Stage";
import Tween, {Ease} from "framework/components/Tween";
import Locales from "framework/services/Locales";
import Sounds from "framework/services/Sounds";
import {autoSizeLabel, degreeToRadians} from "framework/utils/Utils";
import {Container, Text, TextStyle} from "pixi.js";

export default class AppView extends Container {
    private bg: Image;
    private spineAnim: SpineAnimation;
    private label: Text;
    private btn: Button;
    private tween: Tween;

    constructor() {
        super();
        this.bg = new Image("bg");
        this.addChild(this.bg);

        this.spineAnim = new SpineAnimation("spineboy");
        this.playIdle();
        this.addChild(this.spineAnim);

        this.label = new Text("", this.getLabelStyle());
        this.label.anchor.set(0.5);
        this.label.position.set(100, 100);
        autoSizeLabel(this.label, Locales.getKey("test_str2", "asd", 21), 100);
        this.addChild(this.label);

        this.btn = new Button("spin_btn");
        this.btn.onClickSignal.add(this.onBtnClick, this);
        this.addChild(this.btn);

        this.tween = new Tween({
            onUpdate: t => {
                this.label.rotation = degreeToRadians(360 * t);
            },
            ease: Ease.CircEaseOut,
            duration: 500
        });

        Stage.onResize(this.onResize, this);
        this.onResize(Stage.layout);
    }

    private onResize(layout: Layout): void {
        this.bg.position.set(0, (Stage.viewHeight - this.bg.height) * 0.5);
        this.spineAnim.position.set(this.bg.x + 500, this.bg.y + 1600);
        if (layout === Layout.LANDSCAPE) {
            this.btn.position.set(Stage.viewWidth - 300, Stage.viewHeight * 0.5);
        } else {
            this.btn.position.set(Stage.viewWidth * 0.5, Stage.viewHeight - 300);
        }
    }

    private onBtnClick(): void {
        Sounds.play("coin");
        this.spineAnim.animationCompleteSignal.removeAll();
        this.spineAnim.animationCompleteSignal.addOnce(this.playIdle, this);
        this.spineAnim.play("jump");
        this.tween.start();
    }

    private playIdle(): void {
        this.spineAnim.play("idle", true);
    }

    private getLabelStyle(): TextStyle {
        return new TextStyle({
            fontFamily: "Anton-Regular",
            fontSize: 30,
            align: "center",
            fill: 0xffffff,
            dropShadow: true,
            dropShadowColor: 0x2F80A9,
            dropShadowDistance: 1
        });
    }
}
