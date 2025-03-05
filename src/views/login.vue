<template>
  <div class="login">
    <div class="animation-container">
      <div class="farmer"></div>
      <div class="fish"></div>
    </div>
    <el-row>
      <el-col :span="14">
        <div class="left">
          <div class="login-title">
            <svg width="100%" height="100%" viewBox="0 0 500 100">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#ffffff">
                    <animate attributeName="stop-color"
                      values="#ffffff; #00ff87; #00ffff; #ffffff"
                      dur="4s"
                      repeatCount="indefinite"/>
                  </stop>
                  <stop offset="100%" style="stop-color:#d4f3e5">
                    <animate attributeName="stop-color"
                      values="#d4f3e5; #00ffff; #00ff87; #d4f3e5"
                      dur="4s"
                      repeatCount="indefinite"/>
                  </stop>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
                    fill="url(#gradient)" filter="url(#glow)" class="title-text">
                {{loginTitle}}
              </text>
            </svg>
          </div>
          <div class="login-subTitle">
            <span class="word">专</span>
            <span class="word">注</span>
            <span class="word">于</span>
            <span class="word">农</span>
            <span class="word">业</span>
            <span class="separator"> </span>
            <span class="word">面</span>
            <span class="word">向</span>
            <span class="word">未</span>
            <span class="word">来</span>
            <span class="separator"> </span>
            <span class="word">自</span>
            <span class="word">主</span>
            <span class="word">创</span>
            <span class="word">新</span>
          </div>
          <div class="login-bgImage">
            <img src="@/assets/images/login.png" alt="" />
          </div>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="right">
          <div class="blue-dot"></div>
          <div class="loginForm-title">系统登录</div>
          <div class="loginForm-subTitle">SYSTEM LOGIN</div>
          <div class="loginForm-form">
            <el-form label-position="top">
              <el-form ref="loginForm" :model="loginForm" :rules="loginRules">
                <el-form-item label="账号" prop="username">
                  <el-input
                    v-model="loginForm.username"
                    prefix-icon="el-icon-user"
                    placeholder="请输入用户名"
                  ></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                  <el-input
                    v-model="loginForm.password"
                    prefix-icon="el-icon-lock"
                    type="password"
                    placeholder="请输入密码"
                    show-password
                  ></el-input>
                </el-form-item>
                <el-form-item label="验证码" prop="code" v-if="captchaOnOff">
                  <el-row class="login-captchaBox">
                    <el-col :span="15">
                      <el-input
                        v-model="loginForm.code"
                        auto-complete="off"
                        placeholder="验证码"
                        prefix-icon="el-icon-circle-check"
                        @keyup.enter.native="handleLogin"
                      />
                    </el-col>
                    <el-col :span="8" :offset="1" style="display:flex" >
                      <div class="login-code">
                        <img :src="codeUrl" @click="getCode" />
                      </div>
                    </el-col>
                  </el-row>
                </el-form-item>

                <el-checkbox
                  v-model="loginForm.rememberMe"
                  style="margin: 0px 0px 25px 0px; color: #000"
                  >记住密码</el-checkbox
                >

                <el-form-item style="width: 100%">
                  <el-button
                    v-if="!bindAccount"
                    :loading="loading"
                    type="primary"
                    style="width: 100%"
                    @click.native.prevent="handleLogin"
                  >
                    <span v-if="!loading">登 录</span>
                    <span v-else>登 录 中...</span>
                  </el-button>
                  <el-button
                    v-else
                    :loading="loading"
                    type="primary"
                    style="width: 100%"
                    @click.native.prevent="handleLogin"
                  >
                    <span v-if="!loading">绑定</span>
                    <span v-else>绑 定 中...</span>
                  </el-button>
                </el-form-item>
              </el-form>
            </el-form>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import "element-ui/lib/theme-chalk/display.css";
import logo from "@/assets/logo/logo.gif";
import { getCodeImg, checkBindId, getErrorMsg } from "@/api/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from "@/utils/jsencrypt";

export default {
  name: "Login",
  data() {
    return {
      loginTitle:process.env.VUE_APP_TITLE,
      logo,
      codeUrl: "",
      loginForm: {
        username: "",
        password: "",
        rememberMe: false,
        code: "",
        uuid: "",
        bindId: "",
      },
      loginRules: {
        username: [
          {
            required: true,
            trigger: "blur",
            message: "请输入您的账号",
          },
        ],
        password: [
          {
            required: true,
            trigger: "blur",
            message: "请输入您的密码",
          },
        ],
        code: [
          {
            required: true,
            trigger: "change",
            message: "请输入验证码",
          },
        ],
      },
      loading: false,
      // 验证码开关
      captchaOnOff: true,
      bindAccount: false,
      // 注册开关
      register: true,
      redirect: undefined,
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  created() {
    let loginId = this.$route.query.loginId;
    if (loginId === undefined || loginId === null) {
      this.checkBind();
      this.checkErrorMsg();
      this.getCode();
      this.getCookie();
    } else {
      this.redirectLogin(loginId);
    }
    // 添加回车键监听
    document.addEventListener('keyup', this.handleEnterPress);
  },
  beforeDestroy() {
    // 移除回车键监听
    document.removeEventListener('keyup', this.handleEnterPress);
  },
  methods: {
    handleEnterPress(e) {
      if (e.key === 'Enter' && !this.loading) {
        this.handleLogin();
      }
    },
    redirectLogin(loginId) {
      this.loading = true;
      this.$store
        .dispatch("RedirectLogin", loginId)
        .then(() => {
          this.$router
            .push({
              path: this.redirect || "/",
            })
            .catch(() => {});
        })
        .catch(() => {
          this.loading = false;
          if (this.captchaOnOff) {
            this.getCode();
          }
          this.$router.push({
            query: {},
          });
        });
    },
    checkBind() {
      let query = this.$route.query;
      let bindId = query.bindId;
      if (bindId === undefined || bindId === null) {
        this.bindAccount = false;
      } else {
        this.bindAccount = true;
        checkBindId(bindId).then((res) => {
          this.bindAccount =
            res.bindAccount === undefined ? true : res.bindAccount;
          if (this.bindAccount) {
            this.loginForm.bindId = bindId;
          } else {
            this.loginForm.bindId = "";
            this.$router.push({
              query: {},
            });
          }
        });
      }
    },
    checkErrorMsg() {
      let errorId = this.$route.query.errorId;
      if (errorId !== undefined && errorId !== null) {
        getErrorMsg(errorId)
          .then((res) => {})
          .catch((err) => {
            this.$router.push({
              query: {},
            });
          });
      }
    },
    getCode() {
      getCodeImg().then((res) => {
        this.captchaOnOff =
          res.captchaOnOff === undefined ? true : res.captchaOnOff;
        if (this.captchaOnOff) {
          this.codeUrl = "data:image/gif;base64," + res.img;
          this.loginForm.uuid = res.uuid;
        }
      });
    },
    getCookie() {
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get("rememberMe");
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password:
          password === undefined ? this.loginForm.password : decrypt(password),
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    },
    qqLogin() {
      window.location.href = "http://localhost:8080/auth/render/qq";
    },
    authLogin() {
      this.$alert("第三方登录正在集成中...", "提示消息", {
        confirmButtonText: "确定",
        callback: (action) => {
          this.$message({
            type: "info",
            message: `action: ${action}`,
          });
        },
      });
    },
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          if (this.loginForm.rememberMe) {
            Cookies.set("username", this.loginForm.username, {
              expires: 30,
            });
            Cookies.set("password", encrypt(this.loginForm.password), {
              expires: 30,
            });
            Cookies.set("rememberMe", this.loginForm.rememberMe, {
              expires: 30,
            });
          } else {
            Cookies.remove("username");
            Cookies.remove("password");
            Cookies.remove("rememberMe");
          }
          console.log(this.loginForm);
          this.$store
            .dispatch("Login", this.loginForm)
            .then(() => {
              this.$router
                .push({
                  path: this.redirect || "/",
                })
                .catch(() => {});
            })
            .catch(() => {
              this.loading = false;
              if (this.captchaOnOff) {
                this.getCode();
              }
            });
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  .left {
    height: 100vh;
    background: #109b5e;
    overflow: hidden;
    .login-title {
      height: 100px;
      margin-top: 15vh;

      .title-text {
        font-size: 50px;
        font-weight: 500;
        letter-spacing: 11px;
        font-family: "Microsoft YaHei", "微软雅黑";
        text-shadow: 0 0 10px rgba(255,255,255,0.8);
        animation: shine 3s ease-in-out infinite;
        @media screen and (max-width: 1200px) {
          font-size: 40px;
        }
        @media screen and (max-width: 768px) {
          font-size: 30px;
        }
      }
    }
    .login-subTitle {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-bottom: 26px;
      color: #fff;
      font-size: 20px;
      @media screen and (max-width: 1200px) {
        font-size: 18px;
      }
      @media screen and (max-width: 768px) {
        font-size: 16px;
      }

      .word {
        display: inline-block;
        margin: 0 2px;
        opacity: 0;
        animation: gather 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;

        &:hover {
          animation: swing 0.8s ease-in-out;
          opacity: 1;
        }
      }

      .word:nth-child(1) { --x: -1000px; --y: -500px; animation-delay: 0.1s; }
      .word:nth-child(2) { --x: 1000px; --y: -800px; animation-delay: 0.2s; }
      .word:nth-child(3) { --x: -800px; --y: 1000px; animation-delay: 0.3s; }
      .word:nth-child(4) { --x: 900px; --y: 900px; animation-delay: 0.4s; }
      .word:nth-child(5) { --x: -1000px; --y: -700px; animation-delay: 0.5s; }
      .word:nth-child(7) { --x: 800px; --y: 500px; animation-delay: 0.6s; }
      .word:nth-child(8) { --x: -600px; --y: -1000px; animation-delay: 0.7s; }
      .word:nth-child(9) { --x: 700px; --y: 800px; animation-delay: 0.8s; }
      .word:nth-child(10) { --x: -900px; --y: 600px; animation-delay: 0.9s; }
      .word:nth-child(12) { --x: 1000px; --y: -600px; animation-delay: 1.0s; }
      .word:nth-child(13) { --x: -700px; --y: 900px; animation-delay: 1.1s; }
      .word:nth-child(14) { --x: 600px; --y: -900px; animation-delay: 1.2s; }
      .word:nth-child(15) { --x: -800px; --y: -800px; animation-delay: 1.3s; }

      .separator {
        margin: 0 8px;
        opacity: 0.7;
      }
    }
    .login-bgImage {
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 75%;
        animation: float 3s ease-in-out infinite;
      }
      @media screen and (max-width: 768px) {
        display: none;
      }
    }
  }
  .right {
    height: 100vh;
    overflow: hidden;
    position: relative;
    margin-left: -50px;
    padding-left: 50px;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.7) 0%,
        rgba(255, 255, 255, 0.3) 100%
      );
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 1;
      border-radius: 10px 0 0 10px;
      box-shadow: -10px 0 20px rgba(0, 0, 0, 0.1);
    }

    &::after {
      content: '';
      position: absolute;
      width: 500px;
      height: 500px;
      top: -100px;
      left: -200px;
      background: conic-gradient(
        from 0deg,
        #109b5e,
        #00ffcc,
        #00ff87,
        #109b5e
      );
      filter: blur(100px);
      opacity: 0.3;
      z-index: 0;
    }

    .blue-dot {
      content: '';
      position: absolute;
      width: 400px;
      height: 400px;
      bottom: -150px;
      right: -150px;
      background: conic-gradient(
        from 180deg,
        #109b5e,
        #4facfe,
        #00f2fe,
        #109b5e
      );
      filter: blur(100px);
      opacity: 0.3;
      z-index: 0;
    }

    .loginForm-title,
    .loginForm-subTitle,
    .loginForm-form {
      position: relative;
      z-index: 2;
    }

    .loginForm-title {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      font-weight: bold;
      margin-top: 20vh;
      @media screen and (max-width: 768px) {
        font-size: 24px;
        margin-top: 15vh;
      }
    }
    .loginForm-subTitle {
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(22, 23, 26, 0.1);
      font-size: 23px;
      white-space: nowrap;
      letter-spacing: 2px;
      margin-top:-10px;
      @media screen and (max-width: 768px) {
        font-size: 18px;
      }
    }
    .loginForm-form {
        padding:0 25%;
        @media screen and (max-width: 1400px) {
          padding: 0 15%;
        }
        @media screen and (max-width: 1200px) {
          padding: 0 10%;
        }
        @media screen and (max-width: 768px) {
          padding: 0 5%;
        }
    }

    .login-captchaBox{
      display: flex;
      img{
        height: 50px;
      }
    }

    //组件样式修改
    ::v-deep {
        .el-form {
          position: relative;
          z-index: 2;
        }

        .el-input__inner {
          background: rgba(245, 245, 245, 0.5);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
          height: 50px;
          border-radius: 25px;
          padding-left: 40px;
          font-size: 20px;
          color:#000;
          @media screen and (max-width: 768px) {
            height: 40px;
            font-size: 16px;
            padding-left: 35px;
          }
        }
        .el-input__inner:focus{
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid #109b5e;
          box-shadow: 0 0 10px rgba(16, 155, 94, 0.2);
        }
        .el-input__inner:placeholder-shown{
            font-size: 16px;
        }
        .el-input__prefix{
            font-size:20px;
            left:10px;
        }
        .el-button {
          height: 50px;
          border-radius: 30px;
          font-size: 20px;
          border: none;
          position: relative;
          background-size: 200% auto;
          background-image: linear-gradient(
            45deg,
            #109b5e 0%,
            #00c853 50%,
            #109b5e 100%
          );
          box-shadow: 0 4px 15px rgba(16, 155, 94, 0.2);
          transition: all 0.5s ease;
          animation: gradientMove 3s ease infinite;
          @media screen and (max-width: 768px) {
            height: 40px;
            font-size: 16px;
          }

          &::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 32px;
            background: linear-gradient(45deg, #109b5e, #00ff87, #00c853, #109b5e);
            z-index: -1;
            filter: blur(8px);
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          &:hover {
            transform: translateY(-2px);
            background-position: right center;
            box-shadow: 0 6px 20px rgba(16, 155, 94, 0.3);

            &::before {
              opacity: 1;
            }
          }

          &:active {
            transform: translateY(1px);
            box-shadow: 0 2px 10px rgba(16, 155, 94, 0.2);
          }

          span {
            background: linear-gradient(45deg, #ffffff, #e0fff0);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-weight: 600;
            letter-spacing: 1px;
          }
        }
        .el-checkbox {
          position: relative;
          z-index: 2;
        }
    }
  }
}

@keyframes shine {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.2);
  }
  100% {
    filter: brightness(1);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes gather {
  0% {
    opacity: 0;
    transform: translate(var(--x), var(--y)) scale(0.1) rotate(var(--r, 180deg));
  }
  60% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
    transform: translate(0, 0) scale(1) rotate(0deg);
  }
}

@keyframes swing {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  50% { transform: rotate(-10deg); }
  75% { transform: rotate(5deg); }
  100% { transform: rotate(0deg); }
}

@keyframes shine-effect {
  0% {
    transform: rotate(45deg) translate(-100%, -100%);
  }
  100% {
    transform: rotate(45deg) translate(100%, 100%);
  }
}

@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

// Add new responsive layout rules
@media screen and (max-width: 768px) {
  .login {
    .el-row {
      display: flex;
      flex-direction: column;
    }
    
    .el-col {
      width: 100% !important;
    }

    .left {
      height: 30vh;
      min-height: 200px;
    }

    .right {
      height: 70vh;
      margin-left: 0;
      padding-left: 0;

      &::before {
        border-radius: 30px 30px 0 0;
        top: -30px;
      }
    }
  }
}
</style>
