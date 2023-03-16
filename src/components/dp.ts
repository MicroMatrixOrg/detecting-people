import DPlayer, { DPlayerEvents } from 'dplayer';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import { showDialog } from '../components/toast';
import { ref, toRaw } from 'vue';

export const useDP = ({
  task,
  dplayer,
  actionVideo,
  maskOpen,
  segmenter,
  foregroundThresholdProbability,
  dp,
  maskImageUrl,
}: any) => {
  const randomDanmaku = () => {
    const danmaku = actionVideo.value.barrage || [
      new Date().toLocaleString(),
      '测试测试测试测试测试测试',
    ]; //弹幕文字
    const colors = [
      '#ffffff',
      '#ffffff',
      '#ffffff',
      '#ffffff',
      '#e54256',
      '#ffe133',
      '#64DD17',
      '#D500F9',
    ];
    const types = ['top', 'bottom', 'right'];

    const randomItem = (arr: any) => arr[(Math.random() * arr.length) | 0];

    dp.value?.danmaku.draw({
      text: randomItem(danmaku),
      color: randomItem(colors),
      type: randomItem(types), //滚动
    });
  };

  //压缩
  const compressionImage = (el: any) => {
    return new Promise(async (resolve) => {
      // const img = new Image();
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      // 原始尺寸
      const elRect = el.getBoundingClientRect();
      const originWidth = elRect.width;
      const originHeight = elRect.height;

      // 最大尺寸限制
      const maxWidth = 350;
      const maxHeight = 350;

      // 目标尺寸
      var targetWidth = originWidth,
        targetHeight = originHeight;
      if (originWidth > maxWidth || originHeight > maxHeight) {
        if (originWidth / originHeight > maxWidth / maxHeight) {
          // 更宽，按照宽度限定尺寸
          targetWidth = maxWidth;
          targetHeight = Math.round(maxWidth * (originHeight / originWidth));
        } else {
          targetHeight = maxHeight;
          targetWidth = Math.round(maxHeight * (originWidth / originHeight));
        }
      }
      // canvas对图片进行缩放
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      // 清除画布
      context?.clearRect(0, 0, targetWidth, targetHeight);
      // 压缩
      context?.drawImage(el, 0, 0, targetWidth, targetHeight);

      context?.drawImage(el, 0, 0, targetWidth, targetHeight);
      const imageData = context?.getImageData(0, 0, targetWidth, targetHeight);
      resolve(imageData);
    });
  };

  const imgLoad = (src: string) => {
    return new Promise(async (resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        resolve(img);
      };
    });
  };

  //识别
  const recognition = async () => {
    const danmaku = dplayer.value?.querySelector('.dplayer-danmaku');
    try {
      randomDanmaku();
      if (segmenter.value && maskOpen.value && danmaku) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        //压缩视频尺寸
        const imageData = await compressionImage(dp.value?.video);
        const segmentationConfig = {
          flipHorizontal: false,
          multiSegmentation: false,
          segmentBodyParts: true,
          segmentationThreshold: 1,
        };
        let tSegmenter = toRaw(segmenter.value);
        const people = await tSegmenter?.segmentPeople(
          imageData,
          segmentationConfig
        );

        const foregroundColor = { r: 0, g: 0, b: 0, a: 0 }; //用于可视化属于人的像素的前景色 (r,g,b,a)。
        const backgroundColor = { r: 0, g: 0, b: 0, a: 255 }; //用于可视化不属于人的像素的背景颜色 (r,g,b,a)。
        const drawContour = false; //是否在每个人的分割蒙版周围绘制轮廓。
        const fThresholdProbability = foregroundThresholdProbability.value; //将像素着色为前景而不是背景的最小概率。
        const backgroundDarkeningMask = await bodySegmentation.toBinaryMask(
          people,
          foregroundColor,
          backgroundColor,
          drawContour,
          fThresholdProbability
        );
        canvas.width = backgroundDarkeningMask.width;
        canvas.height = backgroundDarkeningMask.height;
        context?.putImageData(backgroundDarkeningMask, 0, 0);
        const Base64 = canvas.toDataURL('image/png');
        maskImageUrl.value = Base64;
        const { width, height } = dp.value.video.getBoundingClientRect();
        //加载图片到缓存中（如果不加载到缓存中，会导致mask-image失效，因为图片还没有加载到页面上，新的图片已经添加上去了，会导致图片一直是个空白）
        await imgLoad(Base64);
        danmaku.style = `-webkit-mask-image: url(${Base64});-webkit-mask-size: ${width}px ${height}px;`;
        task.value ? cancelAnimationFrame(task.value) : false;
        task.value = requestAnimationFrame(recognition);
      } else {
        danmaku.style = '';
        task.value ? cancelAnimationFrame(task.value) : false;
        task.value = requestAnimationFrame(recognition);
      }
    } catch (error) {
      danmaku.style = '';
      task.value ? cancelAnimationFrame(task.value) : false;
      task.value = requestAnimationFrame(recognition);
    }
  };

  // dp 播放器初始化
  const dpInit = (container: HTMLDivElement | null, videoUrl: string) => {
    dp.value = new DPlayer({
      container: container,
      loop: true,
      volume: 0,
      video: {
        url: videoUrl,
      },
      danmaku: {
        id: '9E2E3368B56CDBB4',
        api: 'http://127.0.0.1:1207/',
        bottom: '15%',
        unlimited: true,
      },
    });
    dp.value.video.setAttribute('crossorigin', 'anonymous');

    dp.value.on(<DPlayerEvents>'play', () => {
      task.value ? cancelAnimationFrame(task.value) : false;
      task.value = requestAnimationFrame(recognition);
    });
    dp.value.on(<DPlayerEvents>'pause', () => {
      cancelAnimationFrame(task.value);
    });
    dp.value.on(<DPlayerEvents>'danmaku_send', (e: unknown) => {
      console.log(e);
    });
    dp.value.on(<DPlayerEvents>'error', (error: unknown) => {
      console.error('error', error);
      showDialog('视频加载失败2-' + error);
    });
  };

  return { dpInit };
};
