/* eslint-disable prettier/prettier */
<template>
  <div id="app">
    <Navigation :user='user' @logout="logout"/>
    <router-view :user='user' @logout="logout" :rooms="rooms" @addRoom="addRoom" @deleteRoom="deleteRoom" @checkIn="checkIn"/>
    <Footer />
  </div>
</template>
<script>
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import db from './db.js'

export default {
  name:'App',
  data: function(){
    return {
      user: null,
      rooms:[]
    }
  },
  methods: {
    logout: function(){
      firebase.auth().signOut()
      .then( () => {
        this.user = null,
        this.$router.push('/login')
      })
    },
    addRoom: function (payload){
      db.collection('users')
      .doc(this.user.uid)
      .collection('rooms')
      .add({
        name: payload,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      })
    },
    deleteRoom: function(payload){
      db.collection('users')
      .doc(this.user.uid)
      .collection('rooms')
      .doc(payload)
      .delete()
    },
    checkIn: function(payload){
      const roomRef = db.collection('users')
      .doc(payload.hostID)
      .collection('rooms')
      .doc(payload.roomID)

      roomRef.get().then(doc => {
        if(doc.exists){
          roomRef.collection('attendees')
          .doc(this.user.uid)
          .set({
            displayName: payload.displayName,
            approved: payload.hostID == this.user.uid? true : false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          })
          .then(() => this.$router.push(`/chat/${payload.hostID}/${payload.roomID}`))
        }
      })
    }
  },
  mounted() {
    firebase.auth().onAuthStateChanged( user =>{
      if(user) {
        this.user = user
        db.collection('users')
        .doc(this.user.uid)
        .collection('rooms')
        .onSnapshot(snapshot => {
          const snapData = []
          snapshot.forEach(doc => {
            snapData.push({
              id: doc.id,
              name: doc.data().name
            })
          })
          this.rooms = snapData.sort((a,b) =>{
            if(a.name.toLowerCase() < b.name.toLowerCase()){
              return -1
            }else{
              return 1
            }
          })
        })
      }
    })
  },
  components:{
    Navigation,
    Footer
  }
}
</script>

<style lang="scss">
$primary: #5f2882;
@import 'node_modules/bootstrap/scss/bootstrap';
</style>
