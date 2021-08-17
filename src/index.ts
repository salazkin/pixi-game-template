
import AssetsConfig from 'config/AssetsConfig';
import Locales from 'framework/services/Locales';
import 'pixi-spine';
import AppView from 'view/AppView';
import Stage from "./framework/components/Stage";
import Resources from "./framework/services/Resources";

const stage = new Stage({
    landscape: {
        min: {width: 1920, height: 1080},
        max: {width: 2468, height: 1920}
    },
    portrait: {
        min: {width: 1080, height: 1920},
        max: {width: 1920, height: 2468}
    }
});


init();

async function init(): Promise<void> {
    await Resources.init("./res/");
    await Locales.init("en");
    await Resources.loadStatic(AssetsConfig.assets);
    await Resources.loadFonts(AssetsConfig.fonts);

    onPreloaderReady();
}

const onPreloaderReady = (): void => {
    stage.getStage().addChild(new AppView());

};
