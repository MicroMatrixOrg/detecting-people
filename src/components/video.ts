import { showLoadingToast, UploaderResultType } from 'vant';
import { toRaw } from 'vue';
import { Video } from '../interface/Video';

export const useVideo = ({
  bodySegmentationInit,
  loading,
  dp,
  videoList,
  actionVideo,
  dplayer,
  segmenter,
  dpInit,
  maskImageUrl,
}: any) => {
  const playVideo = async (item: Video) => {
    const toast = showLoadingToast({
      duration: 0,
      forbidClick: true,
      message: 'loading...',
    });
    dp.value
      ? (dp.value?.pause(videoList.value[0]), dp.value.danmuku().clear())
      : (toast.close(), (loading.value = true));
    item.videoUrl = item.url;
    actionVideo.value = item;
    videoList.value = videoList.value.map((e: Video) => {
      e.color = e.name == item.name ? '#1989fa' : '#323233';
      return e;
    });
    dp.value
      ? dp.value.switchVideo({ url: item.videoUrl })
      : dpInit(dplayer.value, item.videoUrl);
    loading.value = false;
    await segmenter.value?.dispose();
    toast.close();
    bodySegmentationInit(dp);
  };

  const videoActionSelect = (e: any) => {
    playVideo(e);
  };

  const changeModelType = async (e: unknown) => {
    dp.value?.pause();
    let temSementer = toRaw(segmenter.value);
    await temSementer?.dispose();
    segmenter.value = null;
    await bodySegmentationInit();
  };

  const uploaderVideo = async (file: any) => {
    maskImageUrl.value = '';
    dp.value?.danmaku.clear();
    dp.value?.pause();
    const toast = showLoadingToast({
      duration: 0, // 持续展示 toast
      forbidClick: true,
      message: '上传图片中',
    });
    const url = window.URL && window.URL.createObjectURL(file);
    dp.value?.switchVideo({
      url,
    });
    toast.close();
    await segmenter.value?.dispose();
    segmenter.value = null;
    await bodySegmentationInit();
    return false;
  };

  return { playVideo, videoActionSelect, changeModelType, uploaderVideo };
};
