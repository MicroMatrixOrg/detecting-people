import { MediaPipeSelfieSegmentationMediaPipeModelConfig } from '@tensorflow-models/body-segmentation';
import * as bodySegmentation from '@tensorflow-models/body-segmentation';
import DPlayer from 'dplayer';

import { showLoadingToast, showToast } from 'vant';
export type UseSegmentationType = (arg1: DPlayer) => void;

export const useSegmentation = ({ dp, segmenter, modelType }: any) => {
  //模型初始化
  const bodySegmentationInit: UseSegmentationType = async () => {
    try {
      const messageToast = showLoadingToast({
        message: '加载中...',
        forbidClick: true,
        loadingType: 'spinner',
      });
      const model =
        bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
      const segmenterConfig: MediaPipeSelfieSegmentationMediaPipeModelConfig = {
        runtime: 'mediapipe',
        modelType: modelType.value,
        solutionPath:
          'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
      };
      segmenter.value = await bodySegmentation.createSegmenter(
        model,
        segmenterConfig
      );
      messageToast.close();
      dp.value?.notice('模型加载完成!', 500, 100);
      dp.value?.play();
    } catch (err) {
      showToast('模型加载失败' + err);
    }
  };

  return { bodySegmentationInit };
};
