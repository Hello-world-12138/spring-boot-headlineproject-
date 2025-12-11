import { ref } from "vue"

const flag = ref(true)

const mySwitch = () => {
  const preBox = document.querySelector('.pre-box')
  const img = document.querySelector('#avatar')
  if (!preBox || !img) return
  if (flag.value) {
    preBox.style.transform = 'translateX(100%)'
    preBox.style.backgroundColor = '#c9e0ed'
    img.src = new URL('../assets/img/wuwu.jpeg', import.meta.url).href
  } else {
    preBox.style.transform = 'translateX(0%)'
    preBox.style.backgroundColor = '#edd4dc'
    img.src = new URL('../assets/img/waoku.jpg', import.meta.url).href
  }
  flag.value = !flag.value
}

export default mySwitch
