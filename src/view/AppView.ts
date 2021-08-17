import Button from "framework/components/Button";
import Image from "framework/components/Image";
import SpineAnimation from "framework/components/SpineAnimation";
import Tween, {Ease} from "framework/components/Tween";
import Locales from "framework/services/Locales";
import Sounds from "framework/services/Sounds";
import {autoSizeLabel, degreeToRadians} from "framework/utils/Utils";
import {Container, Text, TextStyle, utils} from "pixi.js";

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
        this.spineAnim.position.set(300, 600);
        this.spineAnim.play("idle", true);
        this.addChild(this.spineAnim);

        this.label = new Text("", this.getLabelStyle());
        this.label.anchor.set(0.5);
        this.label.position.set(100, 100);
        autoSizeLabel(this.label, Locales.getKey("test_str2", "asd", 21), 100);
        this.addChild(this.label);

        this.btn = new Button("spin_btn");
        this.btn.position.set(600, 500);
        this.btn.onClickSignal.add(this.onBtnClick, this);
        this.addChild(this.btn);

        this.tween = new Tween({
            onUpdate: t => {
                this.label.rotation = degreeToRadians(360 * t);
            },
            ease: Ease.CircEaseOut,
            duration: 500
        });
    }

    private onBtnClick(): void {
        Sounds.play("coin");
        this.tween.start();
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
