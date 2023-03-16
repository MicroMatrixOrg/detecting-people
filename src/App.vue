<script setup lang="ts">
  import '@tensorflow/tfjs-core';
  import '@tensorflow/tfjs-backend-webgl';
  import '@mediapipe/selfie_segmentation';

  import { onBeforeMount, onMounted, ref } from 'vue';

  import { showDialog } from './components/toast';
  import { useSegmentation } from './components/segment';
  import { useDP } from './components/dp';
  import { Video } from './interface/Video';
  import { useVideo } from './components/video';

  let loading = ref(true);
  let maskOpen = ref(true);
  let foregroundThresholdProbability = ref(0.3);
  let modelType = ref('landscape');
  let segmenter = ref();
  let task = ref();

  let maskImageUrl = ref('');
  let videoActionShow = ref(false);
  let videoList = ref<Array<Video>>([
    {
      name: '只因你太美（鸡你太美）',
      subname: '蔡徐坤',
      url: 'https://dcdn.it120.cc/2022/11/04/87b7b5af-476c-4d2b-ae90-36724d66a407.mp4',
      barrage: [
        '时 隔 四 年 依 然 经 典',
        '小小房间竟然人才辈出，实在是恐怖如斯',
        '《有生之年看到原版》',
        '以前的鲲鲲充满了自信和笑容',
        '梦开始的地方',
        '1.自我介绍',
        '这短暂的一分钟养活了多少up主（doge）',
        '万 恶 之 源',
        '《开 始 吟 唱》',
        '《名场面》',
        '《music》',
        '《经典咏流传》',
        '非物质文化遗产',
        '《文艺复兴》',
        '《白 带 异 常》',
        '梦开始的地方，我的梦回来了',
        '每一帧都是经典',
        '每一帧都是表情包诶',
        '《梦开始的地方》',
        '5.优雅转身',
        '前 方 高 能',
        '准备铁山靠',
        '《铁山靠》',
        '招式3:《铁 山 靠》',
        '坤法第一式：铁山靠',
        '小秘密：随便一帧都是经典画面',
        '《白鹤亮翅》',
        '跳水00:40',
        '《 老 肩 巨 滑 》',
        '《每天一遍，精神百倍》',
        '优雅，真的是优雅',
        '《经典永流传》',
        '《垂直握把》',
        '《起舞弄清影》',
        '每时每刻打开都有人在看系列',
        '《护裆派》',
        '《让我蠢蠢欲动》',
        '᭙ᦔꪀꪑᦔ，​',
        '这种感觉我从未有Cause I Got A Cush On You Who You',
        '武当（档）派',
        '爷不知道就他笑死了多少无辜的生命',
        '《国家宝藏》之家禽',
        '《无效定语从句》',
        '卧槽，每一帧都是万恶之源',
        '“鳖”',
        '每日一遍',
        '嘎子偷狗时代考察',
        '《亡之音》',
        '看见这个头型我就想笑',
        '最后亿遍',
        '期待的话，请多多为我投票吧！',
        '《作词作曲》',
        '你干嘛∽哈哈～哎呦',
        '糖果超甜',
        '笑死我了哈哈哈哈',
        '你是我的我是你的谁',
        '原版都这么滑稽哈哈哈',
        '你不要过来！！！',
        '《啥时候都有人》',
        '我的口头禅',
      ],
    },
    {
      name: '蓝色战衣1',
      subname: '一栗小莎子',
      url: 'https://dcdn.it120.cc/2022/11/07/2cfeb9cd-84ff-4981-8ac1-ffa421c82ff1.mp4',
      barrage: [
        '蓝色这个无法超越啊，但是到底哪里不一样嘞',
        '让我看看谁22年七月份还在看',
        '看来粉色战衣后回来看看蓝色的，果然还是蓝色更好',
        '这就是传说中的。蓝衣战神。',
        '曹操只有一个，但曹贼不是',
        'S21版本T0英雄莎子相较上版本T0英雄电气鼠 英雄强度差别不大 主打身材流 扭捏颤抖流 但新版本蓝色战袍加身的莎子完美契合男人审美而电气鼠出装一成不变略有逊色，可谓名副其实版本T0',
        '蓝色战衣：起源（考古）',
        '她其实什么都懂',
        '好厉害',
        '36度会忍不住脱衣服，41度就大脑缺氧了',
        '有些人我不想点破',
        '林志玲？',
        '作者通过穿黑丝，露大腿，形象生动的表达了自己对夏天的喜爱和热情深刻的反应了当代劳动人民夏天特别热的社会现状，表达了对这个大自然的不满之情，以及作者豁达桀骜不驯的内心',
        '我们班男生天天喊的蓝色战衣是这个吗！？',
        '有人现在还在看吗',
        '考古',
        '@雷电将军 ',
        '22年10月了',
        '你的体温',
        '蓝衣战神',
        '@哎哟。 小莎子',
        '啊 这……',
        '@叭叭叭 久久不能入怀',
        '@qyJLJ& 好会',
        '每天看十遍',
        '@玖 这个',
        '@小鲨鱼 喜欢',
        '考古来了',
        '蓝衣战神',
        '不行了',
        '没人能超越我！',
        '看来粉色战衣后回来看看蓝色的，果然还是蓝色更好',
        '@黎夏 真的好看',
        '@Miss Lu 是有点像',
        '让我看看谁22年10月份还在看',
        '我还在看@Jͮoͮkͮeͮrͮ ',
        '@李知恩- @阿彩 @M⁵ 一波抖音回忆，这首歌我老喜欢了',
        '@一生要强汤姆猫 再艾特艾特你，怕你忘了',
        '我王贺兵就爱看这个',
        '女上',
        '考古',
      ],
    },
    {
      name: '蓝色战衣2',
      subname: '一栗小莎子',
      url: 'https://dcdn.it120.cc/2022/11/07/23a4e8ae-5a2f-4801-a557-cb5214d0d648.mp4',
      barrage: [
        '蓝色这个无法超越啊，但是到底哪里不一样嘞',
        '让我看看谁22年七月份还在看',
        '看来粉色战衣后回来看看蓝色的，果然还是蓝色更好',
        '这就是传说中的。蓝衣战神。',
        '曹操只有一个，但曹贼不是',
        'S21版本T0英雄莎子相较上版本T0英雄电气鼠 英雄强度差别不大 主打身材流 扭捏颤抖流 但新版本蓝色战袍加身的莎子完美契合男人审美而电气鼠出装一成不变略有逊色，可谓名副其实版本T0',
        '蓝色战衣：起源（考古）',
        '她其实什么都懂',
        '好厉害',
        '36度会忍不住脱衣服，41度就大脑缺氧了',
        '有些人我不想点破',
        '林志玲？',
        '作者通过穿黑丝，露大腿，形象生动的表达了自己对夏天的喜爱和热情深刻的反应了当代劳动人民夏天特别热的社会现状，表达了对这个大自然的不满之情，以及作者豁达桀骜不驯的内心',
        '我们班男生天天喊的蓝色战衣是这个吗！？',
        '有人现在还在看吗',
        '考古',
        '@雷电将军 ',
        '22年10月了',
        '你的体温',
        '蓝衣战神',
        '@哎哟。 小莎子',
        '啊 这……',
        '@叭叭叭 久久不能入怀',
        '@qyJLJ& 好会',
        '每天看十遍',
        '@玖 这个',
        '@小鲨鱼 喜欢',
        '考古来了',
        '蓝衣战神',
        '不行了',
        '没人能超越我！',
        '看来粉色战衣后回来看看蓝色的，果然还是蓝色更好',
        '@黎夏 真的好看',
        '@Miss Lu 是有点像',
        '让我看看谁22年10月份还在看',
        '我还在看@Jͮoͮkͮeͮrͮ ',
        '@李知恩- @阿彩 @M⁵ 一波抖音回忆，这首歌我老喜欢了',
        '@一生要强汤姆猫 再艾特艾特你，怕你忘了',
        '我王贺兵就爱看这个',
        '女上',
        '考古',
      ],
    },
  ]);
  let actionVideo = ref({ name: '' });
  let dplayer = ref(); // dom 元素
  let dp = ref();

  let { dpInit } = useDP({
    task,
    dplayer,
    actionVideo,
    maskOpen,
    segmenter,
    foregroundThresholdProbability,
    dp,
    maskImageUrl,
  });
  let { bodySegmentationInit } = useSegmentation({ dp, segmenter, modelType });

  let { playVideo, videoActionSelect, changeModelType, uploaderVideo } =
    useVideo({
      bodySegmentationInit,
      dp,
      loading,
      videoList,
      actionVideo,
      dplayer,
      segmenter,
      dpInit,
      maskImageUrl,
    });

  onBeforeMount(() => {});
  onMounted(() => {
    playVideo(videoList.value[0]);
  });
</script>
<template>
  <div
    id="app"
    v-cloak>
    <div class="barrage-ai">
      <div
        v-if="loading"
        style="padding: 20px 0">
        <van-loading
          color="#0094ff"
          size="24px"
          vertical
          >加载中</van-loading
        >
      </div>
      <div :style="{ opacity: loading ? 0 : 1 }">
        <h1>防挡弹幕</h1>
        <div
          style="width: 100%"
          ref="dplayer"></div>
        <br />
        <van-cell-group inset>
          <van-field
            label="视频"
            :value="actionVideo.name"
            @click="videoActionShow = true"
            readonly
            is-link></van-field>
          <van-action-sheet
            v-model:show="videoActionShow"
            :actions="videoList"
            description="请选择视频"
            @select="videoActionSelect"
            cancel-text="取消"
            close-on-click-action>
          </van-action-sheet>
          <van-field label="智能防挡弹幕">
            <template #input>
              <van-switch
                v-model="maskOpen"
                size="20" />
            </template>
          </van-field>
          <van-field label="模型分类">
            <template #label>
              <span>模型分类</span>
              <van-icon
                name="question-o"
                @click="showDialog('尺寸越大，识别越准确，同时性能也更差')"
                style="padding: 0 3px" />
            </template>
            <template #input>
              <van-radio-group
                :disabled="!maskOpen"
                @change="changeModelType"
                v-model="modelType">
                <van-radio name="landscape">144x256 x3</van-radio>
                <van-radio name="general">256x256 x3</van-radio>
              </van-radio-group>
            </template>
          </van-field>
          <van-field>
            <template #label>
              <span>阈值概率</span>
              <van-icon
                name="question-o"
                @click="
                  showDialog('前景阈值概率(越小物体越清晰，同时噪点也比较多)')
                "
                style="padding: 0 3px" />
            </template>
            <template #input>
              <van-slider
                :disabled="!maskOpen"
                v-model="foregroundThresholdProbability"
                min="0.1"
                max="1"
                step="0.1" />
            </template>
          </van-field>
          <van-field>
            <template #label>
              <span>上传视频</span>
              <van-icon
                name="question-o"
                @click="showDialog('视频背景不要太乱')"
                style="padding: 0 3px" />
            </template>
            <template #input>
              <van-uploader
                :before-read="uploaderVideo"
                accept="video/*" />
            </template>
          </van-field>
        </van-cell-group>
        <br />
        <img
          v-if="maskOpen && maskImageUrl"
          :src="maskImageUrl"
          style="width: 100%" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  [v-cloak] {
    opacity: 0 !important;
  }
  .barrage-ai {
    max-width: 550px;
    margin: 0 auto;
    padding: 15px;
    .dplayer-controller .dplayer-icons .dplayer-full {
      display: none;
    }
    .dplayer-danmaku {
      font-size: 13px !important;
    }
    .van-radio:not(:last-child) {
      margin-bottom: 8px;
    }
  }
</style>
