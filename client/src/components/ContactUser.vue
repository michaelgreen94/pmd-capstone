<template>
    <v-expansion-panel class="contact-user">
        <v-expansion-panel-content>
            <h2 slot="header">EMAIL {{target.username.toUpperCase()}}</h2>
            <v-card>
                <form v-if="email" class="contact-form" :action="formSpreeTarget" method="POST">
                    <hr>
                    <div class="under-the-hood">
                        <input type="text" :name="bullUtinUser" value="We utilize formspree.io to enable our users the capability to directly email each other." />
                        <input type="text" name="From bullUtin user:" :value="user.username" />
                        <input type="text" name="Disclaimer:" value="It's encouraged that you research the user who contacted you before corresponding with them. Utilizing bullUtin's search feature can help with this." />
                        <input v-if="post" type="text" name="Responding to your bullUtin post titled:" :value="post.title" />
                        <input type="text" name="_replyto" :value="user.email" />
                    </div>
                    <input type="text" placeholder=" subject" name="subject" required />
                    <textarea type="text" placeholder=" content" name="content" required></textarea>
                    <p>*By contacting {{target.username}} directly you are agreeing to pass along your email that's registered on bullUtin to this user.</p>
                    <label>I agree<input type="checkbox" required /></label>
                    <button type="submit" class="btn btn-info">send</button>
                </form>
            </v-card>
        </v-expansion-panel-content>
    </v-expansion-panel>


</template>

<script>
export default {
  name: "contactUser",
  props: ["email", "post", "targetName"],
  data() {
    return {
      bullUtinUser: "This message is for bullUtin user " + this.targetName,
      formSpreeTarget: "https://formspree.io/" + this.email
    };
  },
  computed: {
    user() {
      return this.$store.state.user;
    },
    target() {
      return this.$store.state.targetUser;
    }
  }
};
</script>

<style>
.contact-user h2 {
  margin-left: 5%;
}
.contact-form {
  display: flex;
  flex-flow: wrap column;
}
.under-the-hood {
  display: none;
}
.contact-form input,
.contact-form textarea,
.contact-form p,
.contact-form label {
  background-color: #f5f5f5;
  margin: 1vh 0 1vh 7.5%;
  width: 90%;
  color: black;
}
.contact-form label input {
  position: absolute;
  left: -25vw;
}
.contact-form button {
  width: fit-content;
  margin: 0 auto;
}
</style>
