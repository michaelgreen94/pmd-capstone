<template>
  <v-layout class="user-profile">
    <v-dialog v-model="showUserProfile" fullscreen transition="scale-transition">
      <p @click="getTargetUser" class="u-nme" slot="activator"><strong>{{blockedUser.username}}</strong></p>
      <v-card>
        <v-toolbar>
          <v-btn @click.native="showUserProfile = false">
            <v-icon>close</v-icon>
          </v-btn>
          <v-toolbar-title>{{user.username}}</v-toolbar-title>
        </v-toolbar>
        <div v-if="user.username" class="profile-content">
          <h2 class="mt-1">AGE</h2>
          <span class="days-old">
            <v-icon>fa-birthday-cake</v-icon>
            <p>{{user.created | daysOld}}</p>
          </span>
          <p class="created">Member since: {{user.created | moment("MMMM Do, YYYY")}}</p>
          <hr>
          <h2>RELIABILITY</h2>
          <div class="progresses">
            <v-progress-circular v-if="user.reliability <= 10" color="#ff5252" size="150" :width="20" :value="user.reliability"
              :rotate="90">{{user.reliability}}</v-progress-circular>
            <v-progress-circular v-if="user.reliability <= 25 && user.reliability > 10" color="#ffc107" size="150"
              :width="20" :value="user.reliability" :rotate="90">{{user.reliability}}</v-progress-circular>
            <v-progress-circular v-if="user.reliability <= 60 && user.reliability > 25" color="#2196f3" size="150"
              :width="20" :value="user.reliability" :rotate="90">{{user.reliability}}</v-progress-circular>
            <v-progress-circular v-if="user.reliability <= 100 && user.reliability > 60" color="#4caf50" size="150"
              :width="20" :value="user.reliability" :rotate="90">{{user.reliability}}</v-progress-circular>
          </div>
          <hr>
          <div class="user-action">
            <h2>UNBLOCK USER</h2>
            <v-icon class="clickable" @click="unblockUser()">fa-ban</v-icon>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
  let moment = require("moment");
  import ContactUser from '@/components/ContactUser'

  export default {
    name: "BlockedUserProfile",
    props: ["blockedUser"],
    data() {
      return {
        showUserProfile: false
      };
    },
    computed: {
      user() {
        return this.$store.state.targetUser;
      }
    },
    methods: {
      getTargetUser() {
        this.$store.dispatch("getTargetUser", this.blockedUser.username);
      },

      unblockUser() {
        console.log("unblock user: ", this.blockedUser.userId, this.blockedUser.username)
        this.$store.dispatch('unblockUser', this.blockedUser.userId)
      }
    },
    filters: {
      daysOld(date) {
        return moment(date).fromNow(true);
      }
    },
    components: {
      ContactUser
    }
  };
</script>

<style scoped>
  .u-nme:hover {
    text-decoration: underline;
    cursor: pointer;
  }

  .profile-content {
    text-align: left;
    margin-left: 5%;
    overflow-y: scroll;
  }

  .profile-content hr {
    position: relative;
    left: -5%;
  }

  .days-old {
    display: flex;
    height: fit-content;
  }

  .days-old i {
    font-size: 5rem;
  }

  .days-old p {
    font-size: 5rem;
    margin-left: 5%;
  }

  .created {
    font-size: 1.5rem;
  }

  p {
    margin-bottom: 0;
  }

  .progresses {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-left: -5%;
  }

  .user-action {
    display: flex;
    justify-content: space-between;
  }

  .user-action i {
    font-size: 3rem;
    margin-right: 5%;
  }

  .clickable {
    cursor: pointer;
  }
</style>