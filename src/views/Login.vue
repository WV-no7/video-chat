/* eslint-disable prettier/prettier */
<template>
  <div>
    <form class="mt-3" @submit.prevent="login">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-6">
            <div class="card bg-light">
              <div class="card-body">
                <h3 class="font-weight-light mb-3">Log in</h3>
                <section class="form-group p-1">
                  <div class="col-12 alert alert-danger px-3" v-if="error">
                    {{error}}
                  </div>
                  <label class="form-control-label sr-only p-1" for="Email">Email</label>
                  <input
                    required
                    class="form-control"
                    type="email"
                    id="email"
                    placeholder="Email"
                    v-model="email"
                  />
                </section>
                <section class="form-group p-1">
                  <input
                    required
                    class="form-control"
                    type="password"
                    placeholder="Password"
                    v-model="password"
                  />
                </section>
                <div class="form-group text-right mb-0 p-1">
                  <button class="btn btn-primary" type="submit">Log in</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
    <p class="text-center mt-2">
      or
      <router-link to="/register">Register</router-link>
    </p>
  </div>
</template>

<script>
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export default {
  data: function(){
    return {
      email: null,
      password: null,
      error: null
    }
  },
  methods: {
    login: function(){
      const info = {
        email: this.email,
        password: this.password
      }
      firebase.auth()
      .signInWithEmailAndPassword(info.email, info.password)
      .then(()=>{
        this.$router.push('/rooms')
      },
      error => {
        this.error = error.message
      })
    }
  },
  mounted() {
    firebase.auth().onAuthStateChanged( user => {
        if(user){
            this.displayName = user.displayName
            this.$router.replace('/')
        }
    })
  }
}
</script>