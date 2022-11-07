import { ref } from 'vue'
import { defineStore } from 'pinia'
import defaultEyesImg from '../assets/eyes/000.png'
import defaultMouthImg from '../assets/mouths/000.png'
import { FILL_COLORS } from '@/constants/colors'

export const useCanvasObjects = defineStore('canvasObjects', () => {
  const eyesImg = ref(defaultEyesImg)
  const setEyesImg = (imgUrl: string) => {
    eyesImg.value = imgUrl
  }

  const mouthImg = ref(defaultMouthImg)
  const setMouthImg = (imgUrl: string) => {
    mouthImg.value = imgUrl
  }

  const backgroundColor = ref<string>('transparent')
  const setBackgroundColor = (color: string) => {
    backgroundColor.value = color
  }

  const backgroundImage = ref<string | null>(null)
  const setBackgroundImage = (imgUrl: string | null) => {
    backgroundImage.value = imgUrl
  }

  const fillColor = ref<string>(FILL_COLORS.yellow)
  const setFillColor = (color: string) => {
    fillColor.value = color
  }

  return {
    eyesImg,
    setEyesImg,
    mouthImg,
    setMouthImg,
    fillColor,
    setFillColor,
    backgroundColor,
    setBackgroundColor,
    backgroundImage,
    setBackgroundImage
  }
})
