<template>
  <div class="bigBox">
    <div class="box">
      <div class="pre-box">
        <h1>WELCOME</h1>
        <p>JOIN US!</p>
        <div class="img-box">
          <img :src="avatar" alt="avatar" id="avatar" />
        </div>
      </div>

      <div class="register-form">
        <div class="title-box"><h1>注册</h1></div>
        <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="5px">
          <el-form-item prop="username" label=" ">
            <el-input v-model="registerForm.username" type="text" placeholder="用户名" :suffix-icon="User" />
          </el-form-item>
          <el-form-item prop="nickName" label=" ">
            <el-input v-model="registerForm.nickName" type="text" placeholder="昵称" :suffix-icon="User" />
          </el-form-item>
          <el-form-item prop="userPwd" label=" ">
            <el-input v-model="registerForm.userPwd" type="password" placeholder="密码" :suffix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item prop="confirmPassword" label=" ">
            <el-input v-model="registerForm.confirmPassword" type="password" placeholder="确认密码" :suffix-icon="Lock" show-password />
          </el-form-item>
        </el-form>
        <div class="btn-box">
          <button @click="goRegister">注册</button>
          <p @click="handleSwitch">已有账号? 去登录</p>
        </div>
      </div>

      <div class="login-form">
        <div class="title-box"><h1>登录</h1></div>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="5px">
          <el-form-item prop="username" label=" ">
            <el-input v-model="loginForm.username" type="text" placeholder="用户名" :suffix-icon="User" />
          </el-form-item>
          <el-form-item prop="userPwd" label=" ">
            <el-input v-model="loginForm.userPwd" type="password" placeholder="密码" :suffix-icon="Lock" show-password />
          </el-form-item>
        </el-form>
        <div class="btn-box">
          <button @click="login" :disabled="loading">登录</button>
          <p @click="handleSwitch">没有账号? 去注册</p>
        </div>
        <div v-if="errorMsg" class="inline-error">{{ errorMsg }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import mySwitch from '../../utils/mySwitch'
import { useUserInfoStore } from '../../stores/userInfo'
import type { FormInstance } from 'element-plus'
import { registerApi, registerValidateApi } from '../../api/index'

const userInfoStore = useUserInfoStore()
const router = useRouter()

const avatar = ref(new URL('../../assets/img/waoku.jpg', import.meta.url).href)

const loginForm = reactive({ username: '', userPwd: '' })
const registerForm = reactive({ username: '', userPwd: '', confirmPassword: '', nickName: '' })
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()
const loading = ref(false)
const errorMsg = ref('')

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度应为3~20个字符', trigger: 'blur' },
  ],
  userPwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '长度应大于6', trigger: 'blur' },
  ],
}
const registerRules = {
  nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }, { min: 2, max: 20, message: '长度应为2~20字符', trigger: 'blur' }],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度应为3~20个字符', trigger: 'blur' },
  ],
  userPwd: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '长度应大于6', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    { min: 6, message: '长度应大于6', trigger: 'blur' },
  ],
}

const login = async () => {
  errorMsg.value = ''
  const valid = await loginFormRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userInfoStore.login(loginForm)
    router.push({ name: 'HeadlineNews' })
  } catch (e: any) {
    errorMsg.value = e?.message || '登录失败，请检查账号或密码'
  } finally {
    loading.value = false
  }
}

const goRegister = async () => {
  const valid = await registerFormRef.value?.validate().catch(() => false)
  if (!valid) return
  if (registerForm.userPwd !== registerForm.confirmPassword) {
    errorMsg.value = '两次输入的密码不一致'
    return
  }
  await registerValidateApi(registerForm.username)
  const payload = {
    username: registerForm.username,
    userPwd: registerForm.userPwd,
    nickName: registerForm.nickName
  }
  await registerApi(payload)
  ElMessage.success('注册成功，请登录')
  mySwitch()
  registerForm.username = ''
  registerForm.userPwd = ''
  registerForm.confirmPassword = ''
  registerForm.nickName = ''
}

const handleSwitch = () => {
  mySwitch()
}
</script>

<style scoped>
input { outline: none; }
.bigBox {
  height: 100vh;
  overflow-x: hidden;
  display: flex;
  background: linear-gradient(to right, rgb(247, 209, 215), rgb(191, 227, 241));
}
.box {
  width: 1050px;
  height: 600px;
  display: flex;
  position: relative;
  z-index: 2;
  margin: auto;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 2px 1px 19px rgba(0, 0, 0, 0.1);
}
.pre-box {
  width: 50%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 99;
  border-radius: 4px;
  background-color: #edd4dc;
  box-shadow: 2px 1px 19px rgba(0, 0, 0, 0.1);
  transition: 0.5s ease-in-out;
}
.pre-box h1 {
  margin-top: 150px;
  text-align: center;
  letter-spacing: 5px;
  color: white;
  user-select: none;
  text-shadow: 4px 4px 3px rgba(0, 0, 0, 0.1);
}
.pre-box p {
  height: 30px;
  line-height: 30px;
  text-align: center;
  margin: 20px 0;
  user-select: none;
  font-weight: bold;
  color: white;
  text-shadow: 4px 4px 3px rgba(0, 0, 0, 0.1);
}
.img-box {
  width: 200px;
  height: 200px;
  margin: 20px auto;
  border-radius: 50%;
  user-select: none;
  overflow: hidden;
  box-shadow: 4px 4px 3px rgba(0, 0, 0, 0.1);
}
.img-box img { width: 100%; transition: 0.5s; }
.login-form, .register-form { flex: 1; height: 100%; }
.title-box { height: 300px; line-height: 500px; }
.title-box h1 {
  text-align: center;
  color: white;
  user-select: none;
  letter-spacing: 5px;
  text-shadow: 4px 4px 3px rgba(0, 0, 0, 0.1);
}
.el-form {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.el-form-item { width: 65%; }
input {
  height: 40px;
  margin-bottom: 20px;
  text-indent: 10px;
  border: 1px solid #fff;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 120px;
  backdrop-filter: blur(10px);
}
input:focus { color: #b0cfe9; }
input:focus::placeholder { opacity: 0; }
.btn-box { display: flex; justify-content: center; align-items: center; gap: 12px; }
button {
  width: 120px;
  height: 34px;
  margin: 0 7px;
  line-height: 34px;
  border: none;
  border-radius: 6px;
  background-color: #69b3f0;
  color: white;
  transition: all 0.2s ease;
}
button:hover { cursor: pointer; opacity: 0.9; transform: translateY(-1px); }
.btn-box p {
  height: 30px;
  line-height: 30px;
  user-select: none;
  font-size: 14px;
  color: white;
}
.btn-box p:hover { cursor: pointer; border-bottom: 1px solid white; }
.inline-error {
  margin-top: 10px;
  padding: 10px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 8px;
  color: #b91c1c;
  width: 65%;
  text-align: center;
}
</style>
