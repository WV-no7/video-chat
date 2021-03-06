/* eslint-disable prettier/prettier */
<template>
<div class="container" v-if="user">
    <div class="container-fluid mt-4">
        <div class="mb-3">
            <span class="mb-0 h2 text-primary">{{ roomName }}</span>
            <span class="ml-1" v-if="user && user.uid !== hostID"> Hosted by: <strong class="text-danger">{{hostDisplayName}}</strong> </span>
        </div>
        <div class="row" v-if="(user !== null && user.uid == hostID) || attendeeApproved">
            <div class="col-md-8">
                <vue-webrtc ref="webrtc" width="100%" :roomId="roomID" v-on:joined-room="doAttendeeJoined" v-on:left-room="doAttendeeLeft" :peerOptions="peerOptions"/>
            </div>
            <div class="col-md-4">
            <button class="btn btn-primary mr-1" v-if="!attendeeJoined && attendeeApproved" @click="doJoin">
                Join
            </button>
            <button type="button" class="btn btn-danger mr-1" v-if="attendeeJoined" @click="doLeave">
                Leave
            </button>
            <h4 class="mt-2">Attendees</h4>
            <ul class="list-unstyled">
                <li v-for="attendee in attendeesApproved" :key="attendee.id">
                    <a type="button" class="mr-2" title="Approve attendee" @click="toggleApproval(attendee.id)" v-if="user && user.uid == hostID">
                        <font-awesome-icon icon="user"></font-awesome-icon>
                    </a>
                    <span class="mr-2" :class="[attendee.webRTCID ? 'text-success':'text-secondary']" title="On Air">
                        <font-awesome-icon icon="podcast"></font-awesome-icon>
                    </span>
                    <span class="pl-1" :class="[attendee.id == user.uid ? 'font-weight-bold text-danger':'']">{{attendee.displayName}}<span v-if="attendee.id == hostID"> (Host)</span></span>
                </li>
            </ul>
            <div v-if="user && user.uid == hostID">
                <h5 class="mt-4">Pending</h5>
                <ul class="list-unstyled">
                <li class="mb-1" v-for="attendee in attendeesPending" :key="attendee.id">
                    <span>
                    <a type="button" class="mr-2" title="Approve attendee" @click="toggleApproval(attendee.id)">
                        <font-awesome-icon icon="user"></font-awesome-icon>
                    </a>
                    <a type="button" class="text-secondary pr-1" title="Delete Attendee" @click="deleteAttendee(attendee.id)">
                        <font-awesome-icon icon="trash"></font-awesome-icon>
                    </a>
                    </span>
                    <span class="pl-1" :class="[attendee.id == user.uid ? 'font-weight-bold text-danger':'']">{{attendee.displayName}}</span>
                </li>
                </ul>
            </div>
            </div>
        </div>
        <div v-else>
            <p class="lead" v-if="user">
            Hi <strong class="text-primary font-weight-bold">{{ user.displayName}}</strong>, you're currently in the room
            waiting for the owner of the chat to add you to the meeting. Please wait.
            </p>
        </div>
    </div>
</div>
<div class="card bg-light" v-else>
    <div class="card-body card-outline-danger text-center" >
        <h1 class="text-danger card-title ">Sorry</h1>
        <p class="card-text lead">
        Sorry, access to rooms is only available to registered users. Please
        <router-link to="/login">login</router-link> or
        <router-link to="/register">register</router-link> and try again.
        </p>
    </div>
</div>
</template>

<script>
import db from '../db'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';


export default {
    name: 'Attendees',
    data: function(){
        return {
            hostID: this.$route.params.hostID,
            roomID: this.$route.params.roomID,
            hostDisplayName: null,
            roomName: null,
            attendeesPending: [],
            attendeesApproved: [],
            attendeeApproved: false,
            attendeeJoined: false,
            peerOptions:{'SimplePeer': 'TURN'}
        }
    },
    methods: {
        deleteAttendee: function(attendeeID){
            if( this.user && this.user.uid == this.hostID && this.user.uid != attendeeID){
                db.collection('users')
                .doc(this.user.uid).collection('rooms')
                .doc(this.roomID).collection('attendees')
                .doc(attendeeID).delete()
            }
        },
        doJoin(){
            this.$refs.webrtc.join()
            this.attendeeJoined = true
        },
        doLeave(){
            this.$refs.webrtc.leave()
            this.attendeeJoined = false
        },
        doAttendeeJoined(joinID){
            const ref = db.collection('users')
                        .doc(this.hostID).collection('rooms')
                        .doc(this.roomID).collection('attendees')
                        .doc(this.user.uid)
            ref.update({
                webRTCID: joinID
            })
        },
        doAttendeeLeft(leaveID){
            const ref = db.collection('users')
                        .doc(this.hostID).collection('rooms')
                        .doc(this.roomID).collection('attendees')
                        .doc(this.user.uid)
            ref.update({
                webRTCID: null
            })
        },
        toggleApproval: function(attendeeID){
            if(this.user && this.user.uid == this.hostID && this.user.uid != attendeeID){
                const ref = db.collection('users')
                .doc(this.user.uid).collection('rooms')
                .doc(this.roomID).collection('attendees')
                .doc(attendeeID)

                ref.get().then(attendeeDocument => {
                    const approved = attendeeDocument.data().approved
                    if(approved){
                        ref.update({
                            approved: !approved
                        })
                    }else{
                        ref.update({
                            approved: true
                        })
                    }
                })
            }
        }
    },
    components:{
        FontAwesomeIcon
    },
    props: ['user'],
    mounted(){
        firebase.auth().onAuthStateChanged( user => {
            if(user){
                this.displayName = user.displayName
            }else{
                this.$router.replace('/')
            }
        })
        console.log('mounter chat')
        const roomRef = db.collection('users')
            .doc(this.hostID)
            .collection('rooms')
            .doc(this.roomID)
            
            roomRef.get().then( roomDocument =>{
                if(roomDocument.exists){
                    this.roomName = roomDocument.data().name
                }else{
                    this.$router.replace('/')
                }
            })

            roomRef.collection('attendees').onSnapshot( attendeeSnapshot => {
                const tempPending = []
                const tempApproved = []
                let amCheckIn = false
                attendeeSnapshot.forEach(attendeeDocument => {
                    if(this.user.uid == attendeeDocument.id){
                        amCheckIn = true
                    }
                    if(this.hostID == attendeeDocument.id){
                        this.hostDisplayName = attendeeDocument.data().displayName
                    }
                    if(attendeeDocument.data().approved){
                        if(this.user.uid == attendeeDocument.id){
                            this.attendeeApproved = true
                        }
                        tempApproved.push({
                            id: attendeeDocument.id,
                            displayName: attendeeDocument.data().displayName,
                            approved: attendeeDocument.data().approved,
                            webRTCID: attendeeDocument.data().webRTCID
                        })
                    }else{
                        if(this.user.uid == attendeeDocument.id){
                            this.attendeeApproved = false
                        }
                        tempPending.push({
                            id: attendeeDocument.id,
                            displayName: attendeeDocument.data().displayName,
                            approved: attendeeDocument.data().approved,
                            webRTCID: attendeeDocument.data().webRTCID
                        })
                    }
                    
                })
                this.attendeesPending = tempPending
                this.attendeesApproved = tempApproved
                if(!amCheckIn){
                    this.$route.replace(`/checkin/${this.hostID}/${this.roomID}`)
                }
            })
    }
}
</script>
<style lang="scss">
.video-list {
    margin-bottom: 10px;
    background: transparent !important;
}
.video-item{
    width: 50%;
    display: inline-block;
    background: transparent !important;
}
.video-item video {
    width: auto;
    height: 250px;
}
</style>