<template>
  <div class="login container-fluid">
    <!-- <div v-if="permission"> -->
    <div v-if="permission" class="row">
      <div class="col-12 text-center">
        <div id="nav" class="text-success">
          <router-link to="/about"> About </router-link>
        </div>
        <h1 id="title">bullUtin</h1>
      </div>
      <div class="user-input col-sm-8 offset-sm-2 col-md-4 offset-md-4">
        <div class="form-group" v-if="prevUser">
          <form @submit.prevent="loginUser" class="form-group" autocomplete="off">
            <input class="form-control" type="username" name="username" placeholder="username" required v-model="creds.username">
            <input class="form-control" type="password" name="password" placeholder="Password" required v-model="creds.password">
            <button type="submit" class="btn btn-primary mt-2">Login</button>
          </form>
          <h5><span @click="prevUser = !prevUser" class="clickable">Register for an account</span></h5>
        </div>
        <div class="register-form" v-else>
          <form @submit.prevent="registerUser" class="form-group" autocomplete="off">
            <input class="form-control" type="email" name="email" placeholder="email address" required v-model="newUser.email">
            <input class="form-control" type="text" name="username" placeholder="User Name" required v-model="newUser.username"
              @focusout="userExists">
            <input class="form-control" type="password" name="password" placeholder="Password" required v-model="newUser.password">
            <input class="form-control" type="password" name="password2" placeholder="Re-enter Password" required
              v-model="newUser.password2">
            <input class="form-control-inline mt-2" type="checkbox" name="terms" required /> I consent to the <a href="../assets/BullUtinT&C.pdf"
              target="_blank">BullUtin terms and conditions</a><br>
            <button type="submit" class="btn btn-primary mt-2">Register</button>
          </form>
          <h5><span @click="prevUser = !prevUser" class="clickable">Login to existing account</span></h5>
        </div>
      </div>
      <div class="col-12">
        <img src="../assets/Bulletin-Boards.png" width="100%" height="auto" class="pic" alt="Bulletin Board">
      </div>
    </div>
    <!-- </div> -->
    <div v-else class="row">
      <div class="col-12">
        <h1 class="pt-5">bullUtin only works with location access</h1>
        <h3>press the button to grant bullUtin permission to access your location</h3>
        <button @click="permission = !permission" class="btn btn-info mt-3">allow geolocation access</button>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: "login",
    mounted() {
      if (this.disabled == 'disable') {
        this.permission = false
      }
      else if (navigator.geolocation) {
        console.log("welcome to bullUtin");
      }
      else {
        this.permission = false;
      }
      this.$store.dispatch("authenticate");
    },
    props: ['disabled'],
    data() {
      return {
        prevUser: true,
        newUser: {
          username: "",
          password: "",
          password2: "",
          email: ""
        },
        creds: {
          username: "",
          password: ""
        },
        permission: true
      };
    },

    methods: {
      loginUser() {
        this.$store.dispatch("loginUser", this.creds);
        this.creds = { username: "", password: "" };
      },

      registerUser() {
        if (this.newUser.password.length < 5) {
          return alert("longer password required")
        }
        if (this.newUser.password === this.newUser.password2) {
          this.$store.dispatch("registerUser", this.newUser);
          this.newUser = {
            username: "",
            password: "",
            password2: "",
            email: ""
          };
        } else {
          alert("Passwords do not match");
        }
      },

      userExists() {
        this.$store.dispatch("userExists", this.newUser.username);
      }
    }
  };
</script>

<style>
  .clickable:hover {
    cursor: pointer;
  }

  .login {
    height: 100vh;
    overflow: hidden;
  }

  #title {
    color: #2c3e50;
    font-family: 'Lobster', cursive;
  }

  .user-input {
    margin-bottom: -10;
  }

  .pic {
    border: 10px solid brown;
  }



  @media only screen and (min-width: 768px) {
    h1 {
      font-size: 5rem;
    }
  }
</style>